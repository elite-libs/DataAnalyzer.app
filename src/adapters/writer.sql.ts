import snakecase from 'lodash.snakecase';
import { CombinedFieldInfo } from 'types';
import { IDataAnalyzerWriter } from './writers';

const BIG_INTEGER_MIN = BigInt('2147483647');

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
  render(results) {
    let { schemaName } = results;
    const { options } = results;
    const typeSummary = results.flatTypeSummary;
    const hasNestedTypes =
      typeSummary.nestedTypes && Object.keys(typeSummary.nestedTypes!).length > 0;

    const getCreateTableCode = ({ schemaName, fields }) =>
      `CREATE TABLE ${snakecase(schemaName)} (\n` +
      Object.entries<CombinedFieldInfo>(fields)
        .map(([fieldName, fieldInfo]) => {
          const name = snakecase(fieldName);
          const {
            type,
            typeRef,
            identity,
            unique,
            nullable,
            value,
            // enum: enumData,
            // count: typeCount,
          } = fieldInfo;

          let length;
          let scale;
          let precision;

          if ('length' in fieldInfo) length = fieldInfo.length;
          if ('scale' in fieldInfo) scale = fieldInfo.scale;
          if ('precision' in fieldInfo) precision = fieldInfo.precision;

          let appendChain = '';
          let sizePart =
            type === 'String' && length ? `(${getFieldLengthArg(name, length)})` : '';

          if (!nullable) appendChain += ' NOT NULL ';
          if (identity) {
            appendChain += ' PRIMARY KEY ';
          } else if (unique) {
            appendChain += ' UNIQUE ';
          }
          appendChain = appendChain.trim();
          // if (enumData && enumData.length > 0) {
          //   // console.info(`ENUM Detected: ${name} (${uniques.length}) \n TODO: Get/add unique values from the SchemaAnalyzer`)
          //   appendChain += `.enum('${enumData.join("', '")}')`;
          // }

          if ('precision' in fieldInfo && 'scale' in fieldInfo) {
            return `    ${name}    DECIMAL(${1 + precision}, ${
              scale % 2 !== 0 ? scale + 1 : scale
            }) ${appendChain},`;
          }
          if (identity && type === 'Number') {
            return `    ${name}    BIGSERIAL ${appendChain},`;
          }

          // if (
          //   !identity &&
          //   unique &&
          //   (type === 'ObjectId' ||
          //     type === 'UUID' ||
          //     type === 'Email' ||
          //     type === 'String' ||
          //     type === 'Number')
          // ) {
          //   // rows have unique values for field
          //   appendChain += '.unique()';
          // }
          // if (identity) {
          //   // Override any possible redundant 'unique' method from above
          //   // console.warn('invalid identity field detected: unsupported identity column type', name, type, fieldInfo)
          //   appendChain += '.primary()';
          // }

          if (typeRef)
            return `    ${name}  INT NOT NULL,
            FOREIGN KEY (${name})
                REFERENCES ${snakecase(typeRef)} (${snakecase(
              typeRef,
            )}_id), // TODO: Verify column names`;
          if (type === 'Unknown')
            return `    ${name}    VARCHAR(${sizePart})   ${appendChain},`;
          if (type === 'ObjectId') return `    ${name}    VARCHAR(24)   ${appendChain},`;
          if (type === 'UUID')
            return `    ${name}    UUID    ${sizePart}  ${appendChain},`;
          if (type === 'Boolean')
            return `    ${name}    BOOLEAN    ${sizePart}  ${appendChain},`;
          if (type === 'BigNumber')
            return `    ${name}    NUMERIC(100, 20), // BigInt in JavaScript is arbitrary precision, and much larger than Postgres' \`bigint\`, IMPORTANT: for postgres use \`NUMERIC\` without size specified, for other engines: adjust the precision and scale as small as possible!!!`;
          if (type === 'Date')
            return `    ${name}    TIMESTAMP    ${sizePart}  ${appendChain},`;
          if (type === 'Timestamp') return `    ${name}    TIMESTAMP    ${appendChain},`;
          if (type === 'Currency') return `    ${name}    MONEY    ${appendChain},`;
          if (type === 'Float') return `    ${name}    NUMERIC${sizePart},`;
          if (type === 'Number') {
            return `    ${name}    ${
              value != null && value > BIG_INTEGER_MIN ? 'BIGINT' : 'INT'
            } ${appendChain},`;
          }
          if (type === 'Email')
            return `    ${name}    VARCHAR${sizePart}  ${appendChain},`;
          if (type === 'String')
            return `    ${name}    VARCHAR${sizePart}  ${appendChain},`;
          if (type === 'Array') return `    ${name}    JSONB    ${appendChain},`;
          if (type === 'Object') return `    ${name}    JSONB    ${appendChain},`;
          if (type === 'Null')
            return `    ${name}    TEXT   ${appendChain}, // WARNING: Not enough data in column to determine type, fallback to TEXT`;

          return `    ${name}    TEXT   ${appendChain}, // WARNING: Not enough data in column to determine type, fallback to TEXT! Details: ${JSON.stringify(
            fieldInfo,
          )}`;
        })
        .join('\n') +
      `\n)`;

    schemaName = snakecase(schemaName);

    const getRecursive = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        // console.log('nested schema detected', schemaName);

        return Object.entries(typeSummary.nestedTypes!).map(
          ([nestedName, { fields }]) => {
            // console.log('nested knex schema:', nestedName);
            return getCreateTableCode({
              schemaName: snakecase(nestedName),
              fields,
            });
          },
        );
      }
      return [''];
    };

    const generatedSql = `${
      hasNestedTypes
        ? `${getRecursive().join(';\n\n').trim()};\n`
        : `/* Note: no nested types detected */`
    }
${getCreateTableCode({ schemaName, fields: typeSummary.fields })}

`;

    return generatedSql.replace(/ ,/gim, ',').replace(/ ,/gim, ',').replace(/ ,/gim, ',');
  },
};

export default writer;
