// import { mapValues } from 'lodash';
import snakecase from 'lodash.snakecase';
// import debug from 'debug';
import { CombinedFieldInfo } from '../../../schema-analyzer/index';
import { IDataAnalyzerWriter, IRenderArgs } from './writers';
// const log = debug('writer:knex');

const BIG_INTEGER_MIN = 2147483647n;

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
const writer: IDataAnalyzerWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const hasNestedTypes = results.nestedTypes && Object.keys(results.nestedTypes!).length > 0;

    const getCreateTableCode = ({ schemaName, results }: IRenderArgs) =>
      `knex.schema.createTable("${schemaName}", (table) => {\n` +
      Object.entries<CombinedFieldInfo>(results.fields)
        .map(([fieldName, fieldInfo]) => {
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

          let appendChain = '';

          let sizePart = type === 'String' && length ? `, ${getFieldLengthArg(name, length)}` : '';

          if (enumData && enumData.length > 0) {
            // console.info(`ENUM Detected: ${name} (${uniques.length}) \n TODO: Get/add unique values from the SchemaAnalyzer`)
            appendChain += `.enum('${enumData.join("', '")}')`;
          }

          // likely a not-null type of field
          if (!nullable) appendChain += '.notNullable()';

          if ('precision' in fieldInfo && 'scale' in fieldInfo) {
            const p = fieldInfo.precision!;
            const s = fieldInfo.scale!;
            sizePart = `, ${1 + p}, ${s % 2 !== 0 ? s + 1 : s}`;
            return `    table.decimal("${name}"${sizePart})${appendChain};`;
          }
          if (identity && type === 'Number') {
            if (value && BigInt(value) >= BIG_INTEGER_MIN) {
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
            // console.warn('invalid identity field detected: unsupported identity column type', name, type, fieldInfo)
            appendChain += '.primary()';
          }

          if (typeRef)
            return `    table.integer("${name}").references('id').inTable('${snakecase(
              typeRef,
            )}');`;

          if (type === 'Unknown') return `    table.text("${name}"${sizePart})${appendChain};`;
          if (type === 'ObjectId') return `    table.string("${name}", 24);`;
          if (type === 'UUID') return `    table.uuid("${name}"${sizePart})${appendChain};`;
          if (type === 'Boolean') return `    table.boolean("${name}"${sizePart})${appendChain};`;
          if (type === 'Date') return `    table.datetime("${name}"${sizePart})${appendChain};`;
          if (type === 'Timestamp') return `    table.timestamp("${name}"${sizePart})`;
          if (type === 'Currency') return `    table.float("${name}"${sizePart});`;
          if (type === 'Float') return `    table.float("${name}"${sizePart});`;
          if (type === 'Number') {
            return `    table.${
              value != null && value > BIG_INTEGER_MIN ? 'bigInteger' : 'integer'
            }("${name}")${appendChain};`;
          }
          if (type === 'Email') return `    table.string("${name}"${sizePart})${appendChain};`;
          if (type === 'String') return `    table.string("${name}"${sizePart})${appendChain};`;
          if (type === 'Array') return `    table.json("${name}"${sizePart})${appendChain};`;
          if (type === 'Object') return `    table.json("${name}"${sizePart})${appendChain};`;
          if (type === 'Null') return `    table.text("${name}")${appendChain};`;

          return `    table.text("${name}")${appendChain}; // ` + JSON.stringify(fieldInfo);
        })
        .join('\n') +
      `\n})\n`;

    schemaName = snakecase(schemaName);

    const getAllDropTables = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        return [...Object.keys(results.nestedTypes!).map(snakecase), schemaName];
      }
      return [schemaName];
    };
    const getRecursive = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        // console.log('nested schema detected', schemaName);

        return Object.entries(results.nestedTypes!).map(([nestedName, results]) => {
          // console.log('nested knex schema:', nestedName);
          return getCreateTableCode({
            schemaName: snakecase(nestedName),
            results,
            options: { disableNestedTypes: false }, // possible needs to be true?
          });
        });
      }
      return [''];
    };

    return `// More info: http://knexjs.org/#Schema-createTable

exports.up = async function up(knex) {
${
  hasNestedTypes
    ? `  await ${getRecursive().join(';\n  await')};\n`
    : `  /* Note: no nested types detected */`
}

  return ${getCreateTableCode({ schemaName, results })}
};

exports.down = async function down(knex) {
${getAllDropTables()
  .map((tableName) => `  await knex.schema.dropTableIfExists("${tableName}")`)
  .join(';\n')};
};
`;
  },
};

export default writer;
