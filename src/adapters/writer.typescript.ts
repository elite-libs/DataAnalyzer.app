import { camelCase } from 'lodash';
import { properCase, removeBlankLines } from 'helpers';
import { IDataAnalyzerWriter } from './writers';
import { CombinedFieldInfo, KeyValPair } from 'types';
const typeMap: { [k: string]: string } = {
  $ref: 'string',
  Unknown: 'string',
  ObjectId: 'Types.ObjectId',
  UUID: 'string',
  Boolean: 'boolean',
  Date: 'Date',
  Timestamp: 'Date',
  Currency: 'number',
  Float: 'number',
  Number: 'number',
  Email: 'string',
  String: 'string',
  Array: 'any[]',
  Object: 'any',
  Null: 'string',
};

const getTSTypeExpression = (fieldInfo: CombinedFieldInfo, schemaName: string) => {
  let tsType = typeMap[fieldInfo.type];
  if (fieldInfo.enum)
    return (
      '"' + fieldInfo.enum.join('" | "') + `" ${fieldInfo.nullable ? ' | null' : ''}`
    );
  if (fieldInfo.typeRef) {
    return (
      properCase(fieldInfo.typeRef) +
      `${fieldInfo.typeRelationship === 'one-to-many' ? '[]' : ''} ${
        fieldInfo.nullable ? ' | null' : ''
      }`
    );
  }
  return `${tsType} ${fieldInfo.nullable ? ' | null' : ''}`;
};

const typescriptWriter: IDataAnalyzerWriter = {
  render(results) {
    const { options } = results;
    const typeSummary = results.flatTypeSummary;
    const hasNestedTypes =
      typeSummary.nestedTypes && Object.keys(typeSummary.nestedTypes!).length > 0;

    const getFields = (schemaName: string, fields: KeyValPair<CombinedFieldInfo>) => {
      return (
        `export interface ${properCase(schemaName)} {\n` +
        Object.entries(fields)
          .map(([fieldName, fieldInfo]) => {
            return `  ${camelCase(fieldName)}${
              fieldInfo.nullable ? '?' : ''
            }: ${getTSTypeExpression(fieldInfo, schemaName).trim()};`;
          })
          .join('\n') +
        `\n};\n`
      );
    };

    const getRecursive = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        // console.log('nested schema detected', schemaName);

        return Object.entries(typeSummary.nestedTypes!).map(
          ([nestedName, subTypeSummary]) => {
            // console.log('nested typescript schema:', nestedName);
            return getFields(nestedName, subTypeSummary.fields);
          },
        );
      }
      return [''];
    };
    return removeBlankLines(
      getFields(typeSummary.schemaName, typeSummary.fields) +
        '\n' +
        getRecursive().join(''),
    );
  },
};

export default typescriptWriter;
