import { camelCase, startCase } from 'lodash';
import { CombinedFieldInfo, TypeNameString } from '../../../schema-analyzer';
import { properCase, removeBlankLines } from '../helpers';
import { IDataStepWriter, IRenderArgs } from './writers';
const typeMap: { [k: string]: string } = {
  '$ref': 'string',
  'Unknown': 'string',
  'ObjectId': 'Types.ObjectId',
  'UUID': 'string',
  'Boolean': 'boolean',
  'Date': 'Date',
  'Timestamp': 'Date',
  'Currency': 'number',
  'Float': 'number',
  'Number': 'number',
  'Email': 'string',
  'String': 'string',
  'Array': 'any[]',
  'Object': 'any',
  'Null': 'string'
}

const getTSTypeExpression = (fieldInfo: CombinedFieldInfo) => {
  let tsType = typeMap[fieldInfo.type]
  if (fieldInfo.enum) return '"' + fieldInfo.enum.join('" | "') + `" ${fieldInfo.nullable ? ' | null' : ''}`;
  if (fieldInfo.typeRef) return  properCase(fieldInfo.typeRef) + `[] ${fieldInfo.nullable ? ' | null' : ''}`;
  return `${tsType} ${fieldInfo.nullable ? ' | null' : ''}`
}
const typescriptWriter: IDataStepWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const hasNestedTypes = results.nestedTypes && Object.keys(results.nestedTypes!).length > 0
    const { fields } = results;
    const getFields = () => {
      return (
        `export interface ${properCase(schemaName)} {\n` +
        Object.entries(fields)
          .map(([fieldName, fieldInfo]) => {
            return `  ${camelCase(fieldName)}${fieldInfo.nullable ? '?' : ''}: ${getTSTypeExpression(fieldInfo).trim()};`;
          })
          .join('\n') +
        `\n};\n`
      );
    };

    const getRecursive = () => {
      if (
        !options?.disableNestedTypes &&
        hasNestedTypes
      ) {
        // console.log('nested schema detected', schemaName);

        return Object.entries(results.nestedTypes!).map(
          ([nestedName, results]) => {
            // console.log('nested typescript schema:', nestedName);
            return this.render({
              schemaName: nestedName,
              results,
              options: { disableNestedTypes: false },
            });
          },
        );
      }
      return '';
    };
    return removeBlankLines(getFields() + '\n' + getRecursive());
  },
};

export default typescriptWriter;


