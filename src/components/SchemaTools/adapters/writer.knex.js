import snakecase from 'lodash.snakecase'
import debug from 'debug'
const log = debug('writer:knex')

const BIG_INTEGER_MIN = 2147483647

const getFieldLengthArg = (fieldName, maxLength) => {
  if (maxLength > 4000) return 8000
  if (maxLength > 2000) return 4000
  if (maxLength > 1000) return 2000
  if (maxLength > 800) return 1000
  if (maxLength > 600) return 800
  if (maxLength > 400) return 600
  if (maxLength > 200) return 400
  if (maxLength > 100) return 200
  if (maxLength > 80) return 100
  if (maxLength > 60) return 80
  if (maxLength > 40) return 60
  if (maxLength > 20) return 40
  return 20
}

/**

Determine a "best guess" maximum field size, use the 90th percentile when
the distance between it and the maximum exceeds 30 percent (of the max value)

@example

Situation: A `City` field normally has a size range of 3-15 characters.
A glitch at our vendor swapped `City` with a huge text field in 1 record!

We don't want to set the limit way bigger than
necessary, as it'd be confusing and impact performance.

Reduced example - `very sparse` data: [3, 4, 5, 7, 9, 231429]
*/
const correctForErroneousMaximum = (threshold = 0.10, ninetiethPct, maximum) => {
  const gapLimit = threshold * maximum
  const topTenPercentileRange = maximum - ninetiethPct
  if (topTenPercentileRange > gapLimit) {
    log('Correcting for erroneous maximum field value:', { ninetiethPct, maximum })
    return ninetiethPct
  }
  return maximum
}

/**
 * @returns TypeMetadata
 *
 * > Type details: https://github.com/justsml/schema-analyzer#data-analysis-results
 *
 * "String": {
 *   "count": 5,
 *   "length": {
 *     "min": 3,"avg": 7.2,"max": 15,
 *     "percentiles": [ 3, 10, 15 ]
 *   },
 *   "rank": 12
 * }
 */
const getMetadataByTypeName = (typeName, types) => {
  return types.find(field => field[0].toLowerCase() === typeName.toLowerCase())
}

export default {
  render ({
    results,
    options,
    schemaName
  }) {
    const { bogusSizeThreshold = 0.10 } = options || {}

    const fieldSummary = results.fields
    // const uniqueCounts = results.uniques
    // const rowCount = results.rowCount

    const fieldPairs = Object.entries(fieldSummary)
      .map(([fieldName, fieldInfo]) => {
        const name = snakecase(fieldName)
        let { types } = fieldInfo
        types = Array.isArray(types) ? types : Object.entries(types)
        types = types.slice(0)
          .filter(f => f[0] !== 'Null' && f[0] !== 'Unknown')
          .sort((a, b) => a[1].count > b[1].count ? -1 : a[1].count === b[1].count ? 0 : 1)
        let [topType, topTypeStats] = types[0]
        topType = topType.toLowerCase()
        const { length, scale, precision, value, unique, nullable, enum: enumData, count: typeCount } = topTypeStats
        console.log('typeStats', fieldName, topType, { length, scale, precision, value, unique, nullable, enumData, typeCount }, JSON.stringify(types))

        let appendChain = ''

        let sizePart = topType === 'string' && length
          ? `, ${getFieldLengthArg(name, correctForErroneousMaximum(bogusSizeThreshold, length.p99, length.max))}`
          : ''

        if ((topType === 'string' || topType === 'number') && (enumData && enumData.length > 0)) {
          // console.info(`ENUM Detected: ${name} (${uniques.length}) \n TODO: Get/add unique values from the SchemaAnalyzer`)
          appendChain += `.enum('${enumData.join("', '")}')`
        }

        if (topType === 'float' && precision && precision.max) {
          const p = correctForErroneousMaximum(bogusSizeThreshold, precision.p99, precision.max)
          const s = correctForErroneousMaximum(bogusSizeThreshold, scale.p99, scale.max)
          sizePart = `, ${1 + p}, ${s % 2 !== 0 ? s + 1 : s}`
          return `    table.decimal("${name}"${sizePart})${appendChain};`
        }
        if (name.toLowerCase() === 'id' && topType === 'number') {
          if (value.max > BIG_INTEGER_MIN) {
            return `    table.bigIncrements("${name}");`
          } else {
            return `    table.increments("${name}");`
          }
        }

        if (!nullable) { // likely a not-null type of field
          appendChain += '.notNull()'
        }
        if (unique && (topType === 'objectid' || topType === 'uuid' ||
        topType === 'email' || topType === 'string' || topType === 'number')) { // rows have unique values for field
          appendChain += '.unique()'
        }
        if (name === 'id' && unique) {
          // Override any possible redundant 'unique' method from above
          appendChain = '.primary()'
        }

        if (topType === 'unknown') return `    table.text("${name}"${sizePart})${appendChain};`
        if (topType === 'objectid') return `    table.string("${name}", 24);`
        if (topType === 'uuid') return `    table.uuid("${name}"${sizePart})${appendChain};`
        if (topType === 'boolean') return `    table.boolean("${name}"${sizePart})${appendChain};`
        if (topType === 'date') return `    table.datetime("${name}"${sizePart})${appendChain};`
        if (topType === 'timestamp') return `    table.timestamp("${name}"${sizePart})`
        if (topType === 'currency') return `    table.float("${name}"${sizePart});`
        if (topType === 'float') return `    table.float("${name}"${sizePart});`
        if (topType === 'number') { return `    table.${value.max > BIG_INTEGER_MIN ? 'bigInteger' : 'integer'}("${name}")${appendChain};` }
        if (topType === 'email') return `    table.string("${name}"${sizePart})${appendChain};`
        if (topType === 'string') return `    table.string("${name}"${sizePart})${appendChain};`
        if (topType === 'array') return `    table.json("${name}"${sizePart})${appendChain};`
        if (topType === 'object') return `    table.json("${name}"${sizePart})${appendChain};`
        if (topType === 'null') return `    table.text("${name}")${appendChain};`

        return `    table.text("${name}")${appendChain}; // ` + JSON.stringify(topTypeStats)
      })
    schemaName = snakecase(schemaName)
    return `// More info: http://knexjs.org/#Schema-createTable

    exports.up = function up(knex) {
      return knex.schema.createTable("${schemaName}", (table) => {
    ${fieldPairs.join('\n    ')}
      });
    };

    exports.down = function down(knex) {
      return knex.schema.dropTableIfExists("${schemaName}");
    };

    `

    return fieldPairs
    // function getColumnBuilderString(name, types) {
    //   const dbName = snakecase(name)
    //   const nullTypeInfo = getMetadataByTypeName('Null', types)

    //   types = types.slice(0)
    //     .filter(f => f[0] !== 'Null' && f[0] !== 'Unknown')
    //     .sort((a, b) => a[1].count > b[1].count ? -1 : a[1].count === b[1].count ? 0 : 1)
    //   let [topType, topTypeStats] = types[0]
    //   const { length, scale, precision, value, unique, nullable, enum: enumData, count: typeCount } = topTypeStats
    //   // console.log('typeStats', name, {length, scale, precision, value, unique, nullable, enumData, typeCount}, JSON.stringify(types))

    // }
  }
}
// const { length, scale, precision, value, unique, nullable, enum: enumData, count: typeCount } = topTypeStats
//     topType = topType.toLowerCase()
//     // const uniqueness = rowCount / uniques.length
//     // // TODO: calculate entropy using a sum of all non-null detected types, not just typeCount
//     // const entropy = rowCount / typeCount
//     // const nullCount = nullTypeInfo && nullTypeInfo.count
//     // console.log('typeStats', name, uniqueCounts[name], { uniqueness, entropy, nullCount }, JSON.stringify(types))

//   const fieldDefs = Object.entries(fieldSummary)
//     .map(([fieldName, typeInfo]) => {
//       typeInfo = Object.entries(typeInfo)
//       return getColumnBuilderString(fieldName, typeInfo)
//     })
//     .join('\n')

/*
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id')
      table.string('name', 256)
      table.integer('age')
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('users')
};
*/
