/* eslint-disable import/no-anonymous-default-export */
import { mapValues } from 'lodash';
import snakecase from 'lodash.snakecase';
import debug from 'debug';
import {
  TypeSummary,
  ISchemaAnalyzerOptions,
  SimpleFieldInfo,
  TypeNameString,
  FieldTypeSummary,
  TypeNameStringDecimal,
  ScalarFieldInfo,
  CombinedFieldInfo,
} from '../../../schema-analyzer/index';
import { IDataStepWriter, IRenderArgs } from './writers';
const log = debug('writer:knex');

const BIG_INTEGER_MIN = 2147483647;

const getFieldLengthArg = (fieldName: string, maxLength: number) => {
  if (maxLength > 4000) return 8000;
  if (maxLength > 2000) return 4000;
  if (maxLength > 1000) return 2000;
  if (maxLength > 800) return 1000;
  if (maxLength > 600) return 800;
  if (maxLength > 400) return 600;
  if (maxLength > 200) return 400;
  if (maxLength > 100) return 200;
  if (maxLength > 80) return 100;
  if (maxLength > 60) return 80;
  if (maxLength > 40) return 60;
  if (maxLength > 20) return 40;
  return 20;
};

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
const correctForErroneousMaximum = (
  threshold = 0.1,
  ninetiethPct: number,
  maximum: number,
) => {
  const gapLimit = threshold * maximum;
  const topTenPercentileRange = maximum - ninetiethPct;
  if (topTenPercentileRange > gapLimit) {
    log('Correcting for erroneous maximum field value:', {
      ninetiethPct,
      maximum,
    });
    return ninetiethPct;
  }
  return maximum;
};

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
// const getMetadataByTypeName = (typeName, types) => {
//   return types.find((field) => field[0].toLowerCase() === typeName.toLowerCase())
// }
const writer: IDataStepWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    // const {  } = options || {}

    const fieldSummary = results.fields;
    // const uniqueCounts = results.uniques
    // const rowCount = results.rowCount

    const fieldPairs: string[] = Object.entries<CombinedFieldInfo>(
      fieldSummary,
    ).map(([fieldName, fieldInfo]) => {
      const name = snakecase(fieldName);
      const {
        type,
        typeRef,
        identity,
        unique,
        nullable,
        value,
        enum: enumData,
        count: typeCount,
      } = fieldInfo;

      let length;
      let scale;
      let precision;

      if ('length' in fieldInfo) length = fieldInfo.length;
      if ('scale' in fieldInfo) scale = fieldInfo.scale;
      if ('precision' in fieldInfo) precision = fieldInfo.precision;

      // console.log(
      //   'typeStats',
      //   fieldName,
      //   type,
      //   { length, scale, precision, value, enumData, typeCount },
      //   JSON.stringify(fieldInfo),
      // )

      let appendChain = '';

      let sizePart =
        type === 'String' && length
          ? `, ${getFieldLengthArg(name, length)}`
          : '';

      if (enumData && enumData.length > 0) {
        // console.info(`ENUM Detected: ${name} (${uniques.length}) \n TODO: Get/add unique values from the SchemaAnalyzer`)
        appendChain += `.enum('${enumData.join("', '")}')`;
      }

      // likely a not-null type of field
      if (!nullable) appendChain += '.notNull()';

      if ('precision' in fieldInfo && 'scale' in fieldInfo) {
        const p = fieldInfo.precision!;
        const s = fieldInfo.scale!;
        sizePart = `, ${1 + p}, ${s % 2 !== 0 ? s + 1 : s}`;
        return `    table.decimal("${name}"${sizePart})${appendChain};`;
      }
      if (identity && type === 'Number') {
        if (value && value > BIG_INTEGER_MIN) {
          return `    table.bigIncrements("${name}");`;
        } else {
          return `    table.increments("${name}");`;
        }
      }

      if (
        !identity &&
        unique &&
        (type === 'ObjectId' ||
          type === 'UUID' ||
          type === 'Email' ||
          type === 'String' ||
          type === 'Number')
      ) {
        // rows have unique values for field
        appendChain += '.unique()';
      }
      if (identity) {
        // Override any possible redundant 'unique' method from above
        appendChain = '.primary()';
      }

      if (typeRef)
        return `    table.text("${name}"); // TODO: add references: ${typeRef};`;

      if (type === 'Unknown')
        return `    table.text("${name}"${sizePart})${appendChain};`;
      if (type === 'ObjectId') return `    table.string("${name}", 24);`;
      if (type === 'UUID')
        return `    table.uuid("${name}"${sizePart})${appendChain};`;
      if (type === 'Boolean')
        return `    table.boolean("${name}"${sizePart})${appendChain};`;
      if (type === 'Date')
        return `    table.datetime("${name}"${sizePart})${appendChain};`;
      if (type === 'Timestamp')
        return `    table.timestamp("${name}"${sizePart})`;
      if (type === 'Currency') return `    table.float("${name}"${sizePart});`;
      if (type === 'Float') return `    table.float("${name}"${sizePart});`;
      if (type === 'Number') {
        return `    table.${
          value != null && value > BIG_INTEGER_MIN ? 'bigInteger' : 'integer'
        }("${name}")${appendChain};`;
      }
      if (type === 'Email')
        return `    table.string("${name}"${sizePart})${appendChain};`;
      if (type === 'String')
        return `    table.string("${name}"${sizePart})${appendChain};`;
      if (type === 'Array')
        return `    table.json("${name}"${sizePart})${appendChain};`;
      if (type === 'Object')
        return `    table.json("${name}"${sizePart})${appendChain};`;
      if (type === 'Null') return `    table.text("${name}")${appendChain};`;

      return (
        `    table.text("${name}")${appendChain}; // ` +
        JSON.stringify(fieldInfo)
      );
    });
    schemaName = snakecase(schemaName);
    return `// More info: http://knexjs.org/#Schema-createTable

    exports.up = function up(knex) {
      return knex.schema.createTable("${schemaName}", (table) => {
    ${fieldPairs.join('\n    ')}
      });
    };

    exports.down = function down(knex) {
      return knex.schema.dropTableIfExists("${schemaName}");
    };

    `;
  },
};

export default writer;
