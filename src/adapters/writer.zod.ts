import camelCase from 'lodash/camelCase';
import {
  CombinedFieldInfo,
  NumericFieldInfo,
  TypeNameStringComposite,
  TypeNameStringDecimal,
} from 'types';
import { properCase, removeBlankLines } from 'helpers';
import { KeyValPair } from 'types';
import type { IDataAnalyzerWriter } from './writers';

const getHeader = () => `import { z } from "zod";\n\n`;

const getZodType = ({ type, ...data }: CombinedFieldInfo) => {
  if (type === '$ref') return `object()`;
  if (type === 'Unknown') return `string()`;
  if (type === 'ObjectId') return `string()`;
  if (type === 'UUID') return `string().uuid())`;
  if (type === 'Boolean') return `boolean()`;
  if (type === 'Date') return `date()`;
  if (type === 'Timestamp') return `date()`;
  if (type === 'Currency') return `number()`;
  if (type === 'Float') return `number()`;
  if (type === 'Number') return `number()`;
  if (type === 'BigNumber') return `string()`;
  if (type === 'Email') return `string().email()`;
  if (type === 'String') return `string()`;
  if (type === 'Array') return `array()`;
  if (type === 'Object') return `object()`;
  if (type === 'Null') return `any()`;
  console.error('failed to map type ', type, data);
  return `any()`;
};
const writer: IDataAnalyzerWriter = {
  render(results) {
    const { options } = results;

    const typeSummary = results.flatTypeSummary;
    const hasNestedTypes =
      typeSummary.nestedTypes && Object.keys(typeSummary.nestedTypes!).length > 0;
    // const { fields } = typeSummary;
    const getSchema = (schemaName: string, fields: KeyValPair<CombinedFieldInfo>) => {
      return (
        `\nexport const ${properCase(schemaName)}Schema = z.object({\n` +
        Object.entries(fields)
          .map(([fieldName, fieldInfo]) => {
            const refProperName =
              typeof fieldInfo.typeRef === 'string'
                ? fieldInfo.typeRef![0]?.toUpperCase() +
                  camelCase(fieldInfo.typeRef).slice(1)
                : undefined;
            // fieldInfo.typeSummary.value
            if (fieldInfo == null) return `// null field info !!!`;
            if (fieldInfo.typeRef)
              return `  ${camelCase(fieldName)}: z.lazy(() => ${refProperName}Schema)`;

            return `  ${camelCase(fieldName)}: z.${getZodType(fieldInfo)}${
              fieldInfo.nullable ? '' : '.required()'
            }${
              TypeNameStringDecimal.includes(fieldInfo.type) &&
              typeof fieldInfo.typeSummary.value === 'object' &&
              typeof fieldInfo.typeSummary.value.max === 'number'
                ? '.max(' +
                  (fieldInfo as NumericFieldInfo).typeSummary.value!['max'] +
                  ')'
                : ''
            }${
              fieldInfo.value && TypeNameStringDecimal.includes(fieldInfo.type)
                ? '.min(' + (fieldInfo as NumericFieldInfo).value + ')'
                : ''
            }${
              fieldInfo.value && TypeNameStringComposite.includes(fieldInfo.type)
                ? '.length(' + fieldInfo.value + ')'
                : ''
            }${
              Array.isArray(fieldInfo.enum) && fieldInfo.enum.length > 0
                ? '.enum(["' + fieldInfo.enum.join('", "') + '"])'
                : ''
            }`;
          })
          .join(',\n') +
        `\n});\n`
      );
    };

    const getRecursive = () => {
      if (!options?.disableNestedTypes && hasNestedTypes) {
        return Object.entries(typeSummary.nestedTypes!)
          .map(([nestedName, results]) => {
            // console.log('nested mongoose schema:', nestedName);
            return getSchema(nestedName, results.fields);
          })
          .join('\n');
      }
      return '';
    };
    let code = moveModuleExports(
      getSchema(results.schemaName!, typeSummary.fields) + getRecursive(),
    );
    return getHeader() + code;
  },
};

function moveModuleExports(code: string): string {
  const mongooseModelLines = /^const.*mongoose.model.*$/gim;
  const moduleLines = /^module\.exports.*$/gim;
  let moduleMatch: null | string[] = moduleLines.exec(code);
  let mongooseMatch: null | string[] = mongooseModelLines.exec(code);
  const moduleConstLines: string[] = [];
  const moduleExportLines: string[] = [];
  while (Array.isArray(moduleMatch) && moduleMatch.length > 0) {
    moduleExportLines.push(...moduleMatch);
    moduleMatch = moduleLines.exec(code);
  }
  while (Array.isArray(mongooseMatch) && mongooseMatch.length > 0) {
    moduleConstLines.push(...mongooseMatch);
    mongooseMatch = mongooseModelLines.exec(code);
  }

  code =
    code.replace(moduleLines, '').replace(mongooseModelLines, '') +
    moduleConstLines.join('\n') +
    '\n\n' +
    moduleExportLines.join('\n');
  return code;
}

export default writer;
