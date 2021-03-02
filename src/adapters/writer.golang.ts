// import { camelCase } from 'lodash';
import { CombinedFieldInfo } from '../schema-analyzer';
import { properCase, numericSorter } from 'helpers';
import { IDataAnalyzerWriter, IRenderArgs } from './writers';
import { map, mapValues, snakeCase } from 'lodash';

const typeMap: { [k: string]: string } = {
  $ref: 'string',
  Unknown: 'string',
  ObjectId: 'ObjectId',
  UUID: 'uuid.UUID',
  Boolean: 'bool',
  Date: 'time.Time',
  Timestamp: 'time.Time',
  Currency: 'number',
  Float: 'float32',
  Number: 'int',
  Email: 'string',
  String: 'string',
  Array: '[]string',
  Object: 'string',
  Null: 'string',
};

const getGoLangType = (fieldName: string, fieldInfo: CombinedFieldInfo) => {
  let tsType = typeMap[fieldInfo.type];
  // if enum, use getEnumDeclaration() to build the enums we'll need to support this struct
  if (fieldInfo.enum && fieldInfo.enum.length >= 1) return `${properCase(fieldName)}Enum`;
  if (fieldInfo.typeRef) {
    return (
      `${fieldInfo.typeRelationship === 'one-to-many' ? '[]' : ''}` +
      properCase(fieldInfo.typeRef)
    );
  }
  return `${tsType}`;
};

const formatKey = (key: string | number) =>
  typeof key === 'string' ? properCase(key) : key;
const formatValue = (key: string | number) =>
  typeof key === 'string' ? `"${properCase(key)}"` : key;
const getSortByTypeFn = (fieldInfo: CombinedFieldInfo) =>
  fieldInfo.type === 'String' ? undefined : numericSorter;

const getEnumDeclaration = (fieldName: string, fieldInfo: CombinedFieldInfo) => {
  if (!fieldInfo.enum || fieldInfo.enum.length <= 0) return ``;
  const typeName = properCase(fieldName);
  const enumName = `${typeName}Enum`;
  return `type ${enumName} ${fieldInfo.type === 'String' ? 'string' : 'int'}
const(
${fieldInfo.enum
  .slice()
  .sort(getSortByTypeFn(fieldInfo))
  // @ts-ignore
  .map<any>((key) => `    ${formatKey(key)} ${enumName} = ${formatValue(key)}`)
  .join('\n')}
)`;
};
/**

GoLang types:

| typename            |            min          |          max           |
|---------------------|-------------------------|------------------------|
| bool                |                         |                        |  
| string              |                         |                        |    
| int                 | 32 or 64bit             | 32 or 64bit            |
| int8                | -128                    | 127                    |
| int16               | -32767                  | 32767                  |  
| int32 (`rune`)      | -2147483647             | 2147483647             |
| int64               | -9223372036854775808    | 9223372036854775808    |  
| uint                | 0                       | 32 or 64bit            |  
| uint8 (`byte`)      | 0                       | 255                    |  
| uint16              | 0                       | 65535                  |    
| uint32              | 0                       | 4294967295             |    
| uint64              | 0                       | 18446744073709551614   |
| uintptr             | 0                       |                        |

// | float32             |                         |                        |
// | float64             |                         |                        |
// | complex64           |                         |                        |
// | complex128          |                         |                        |

*/
const Writer: IDataAnalyzerWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const hasNestedTypes =
      results.nestedTypes && Object.keys(results.nestedTypes!).length > 0;
    const { fields } = results;
    const getFields = () => {
      return `type ${properCase(schemaName)} struct {\n${Object.entries(fields)
        .map(([fieldName, fieldInfo]) => {
          return `    ${properCase(fieldName)} ${getGoLangType(
            fieldName,
            fieldInfo,
          ).trim()} \`json:"${snakeCase(fieldName)}" db:"${snakeCase(fieldName)}"\``;
        })
        .join('\n')}\n}`;
    };

    const getRecursive = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        // console.log('nested schema detected', schemaName);

        return Object.entries(results.nestedTypes!).map(([nestedName, results]) => {
          // console.log('nested schema:', nestedName);
          return this.render({
            schemaName: nestedName,
            results,
            options: { disableNestedTypes: false },
          });
        });
      }
      return [''];
    };
    const enumDefs = map(fields, (fieldInfo, fieldName) => {
      if (fieldInfo.enum && fieldInfo.enum.length > 0)
        return getEnumDeclaration(fieldName, fieldInfo);
      return null;
    });
    const getEnums = () => `\n${enumDefs.join('\n')}`.trim();
    // console.warn({ enums });
    return getFields() + '\n\n' + getEnums() + '\n' + getRecursive().join('');
  },
};

export default Writer;
export { getEnumDeclaration as _getEnumDeclaration };
