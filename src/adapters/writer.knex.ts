import snakeCase from 'lodash/snakeCase';
import type { CombinedFieldInfo, KeyValPair, TypeSummary } from 'types';
import type { IDataAnalyzerWriter } from './writers';
// import debug from 'debug';
// const log = debug('writer:knex');

// const BIG_INTEGER_MIN = BigInt('2147483647');

const instructionsForMultipleTypes = `// NOTE #1: You can break up multiple createTable's into different migration scripts
  // OR, you can chain the calls to .createTable()'s
  // NOTE #2: make sure any tables are created before it's relations (tables) are setup.
`;

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
    let { options, schemaName } = results;
    const typeSummary = results.flatTypeSummary;
    const { nestedTypes } = typeSummary;
    const hasNestedTypes =
      nestedTypes &&
      typeof nestedTypes === 'object' &&
      Object.keys(nestedTypes).length > 0;
    // const nestedTypesEntries =
    //   hasNestedTypes && nestedTypes ? Object.entries(nestedTypes) : {};
    // const nestedTypesKeys = hasNestedTypes && nestedTypes ? Object.keys(nestedTypes) : {};

    // console.warn('nestedTypes', nestedTypes);
    function getFirstIdentityOrUniqueField(
      nestedTypeName: string,
      preferUniqueOverFirstColumn = true,
    ): string {
      if (nestedTypes == null)
        throw new Error(
          `Error: Missing nested type data. Couldn't lookup '${nestedTypeName}'`,
        );
      // console.log('nestedTypes', Object.keys(nestedTypes));

      let schema: TypeSummary<CombinedFieldInfo> | undefined =
        nestedTypes[nestedTypeName];
      if (!schema) {
        let nestedKey = results.renamedTypes && results.renamedTypes[nestedTypeName];
        schema = nestedKey ? nestedTypes[nestedKey] : undefined;
      }
      if (schema?.fields == null)
        throw new Error(
          `Error: Failed to find nested schema for '${nestedTypeName}' inside ${Object.keys(
            nestedTypes,
          ).join(', ')}`,
        );
      const fieldSet = Object.entries<CombinedFieldInfo>(schema.fields);
      // locate by explicit identity indicator
      let identityField = fieldSet.find(([fieldName, fieldStats]) => {
        return fieldStats.identity ? true : false;
      });
      if (identityField) return identityField[0];
      // No solid ID col found, fallback to preferUniqueOverFirstColumn
      if (preferUniqueOverFirstColumn) {
        // next check for unique fields :shrug: :fingers_crossed:
        identityField = fieldSet.find(([fieldName, fieldStats]) => {
          return fieldStats.unique ? true : false;
        });
      }
      return fieldSet[0] && fieldSet[0][0] ? fieldSet[0][0] : '__unknown__';
    }

    const getCreateTableCode = ({
      schemaName,
      fields,
    }: {
      schemaName: string;
      fields: KeyValPair<CombinedFieldInfo>;
    }) =>
      `knex.schema.createTable("${schemaName}", (table) => {\n` +
      Object.entries<CombinedFieldInfo>(fields)
        .map(([fieldName, fieldInfo]) => {
          const name = snakeCase(fieldName);
          const {
            type,
            typeRef,
            typeRelationship,
            identity,
            unique,
            nullable,
            enum: enumData,
          } = fieldInfo;

          let length;
          let scale;
          let precision;

          if ('length' in fieldInfo) length = fieldInfo.length;
          if ('scale' in fieldInfo) scale = fieldInfo.scale;
          if ('precision' in fieldInfo) precision = fieldInfo.precision;

          let appendChain = '';

          let sizePart =
            type === 'String' && length ? `, ${getFieldLengthArg(name, length)}` : '';

          if (enumData && enumData.length > 0) {
            // console.info(`ENUM Detected: ${name} (${uniques.length}) \n TODO: Get/add unique values from the SchemaAnalyzer`)
            appendChain += `.enum('${enumData.join("', '")}')`;
          }

          // likely a not-null type of field
          if (!nullable) appendChain += '.notNullable()';

          if ('precision' in fieldInfo && 'scale' in fieldInfo) {
            sizePart = `, ${1 + precision}, ${scale % 2 !== 0 ? scale + 1 : scale}`;
            return `    table.decimal("${name}"${sizePart})${appendChain};`;
          }
          if (identity && type === 'Number') {
            return `    table.increments("${name}");`;
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
            return `    table.integer("${name}").references("${getFirstIdentityOrUniqueField(
              typeRef,
              false,
            )}").inTable('${snakeCase(typeRef)}'); // note: ${typeRelationship}`;

          if (type === 'Unknown')
            return `    table.text("${name}"${sizePart})${appendChain};`;
          if (type === 'ObjectId') return `    table.string("${name}", 24);`;
          if (type === 'UUID')
            return `    table.uuid("${name}"${sizePart})${appendChain};`;
          if (type === 'Boolean')
            return `    table.boolean("${name}"${sizePart})${appendChain};`;
          if (type === 'Date')
            return `    table.datetime("${name}"${sizePart})${appendChain};`;
          if (type === 'Timestamp') return `    table.timestamp("${name}"${sizePart})`;
          if (type === 'Currency') return `    table.float("${name}"${sizePart});`;
          if (type === 'Float') return `    table.float("${name}"${sizePart});`;
          if (type === 'Number') return `    table.integer("${name}")${appendChain};`;
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
            `    table.text("${name}")${appendChain}; // ` + JSON.stringify(fieldInfo)
          );
        })
        .join('\n') +
      `\n  })\n`;

    schemaName = snakeCase(schemaName);

    const getAllDropTables = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        return [...Object.keys(nestedTypes!).reverse().map(snakeCase), schemaName];
      }
      return [schemaName];
    };
    const getRecursive = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        // console.log('nested schema detected', schemaName);
        // @ts-ignore
        return Object.entries<TypeSummary<CombinedFieldInfo>>(typeSummary.nestedTypes)
          .reverse()
          .map(([nestedName, results], index) => {
            if (!results || !results.fields || !results)
              throw Error(`Error invalid field data at index ${index}`);
            return getCreateTableCode({
              schemaName: snakeCase(nestedName),
              fields: results.fields,
            });
          });
      }
      return [''];
    };

    return `// More info: http://knexjs.org/#Schema-createTable

exports.up = async function up(knex) {
  ${nestedTypes && hasNestedTypes ? instructionsForMultipleTypes : ''}
${
  hasNestedTypes
    ? `  await ${getRecursive().join('\n  await ')}\n`
    : `  /* Note: no nested types detected */`
}

  // Create the main table
  return ${getCreateTableCode({ schemaName, fields: typeSummary.fields })}
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
