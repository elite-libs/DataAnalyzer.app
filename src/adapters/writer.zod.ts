import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import trim from 'lodash/trim';
import {
  CombinedFieldInfo,
  // FieldTypeSummary,
  // NumericFieldInfo,
  // TypeNameStringComposite,
  // TypeNameStringDecimal,
} from 'types';
import { properCase, removeBlankLines } from 'helpers';
import { KeyValPair } from 'types';
import type { IDataAnalyzerWriter } from './writers';

interface IRenderOptions {
  minRowsForTypeConstraints: number;
  nameTransformer: 'default' | 'camelCase' | 'snakeCase';
}

const getHeader = () => `import { z } from "zod";\n\n`;

const getZodType = ({ type, ...data }: CombinedFieldInfo) => {
  if (type === '$ref') return `object()`;
  if (type === 'Unknown') return `string()`;
  if (type === 'ObjectId') return `string()`;
  if (type === 'UUID') return `string().uuid()`;
  if (type === 'Boolean') return `boolean()`;
  if (type === 'Date') return `date()`;
  if (type === 'Timestamp') return `date()`;
  if (type === 'Currency') return `number()`;
  if (type === 'Float') return `number()`;
  if (type === 'Number') return `number()`;
  if (type === 'BigNumber') return `bigint()`;
  if (type === 'Email') return `string().email()`;
  if (type === 'String') return `string()`;
  if (type === 'Array') return `array()`;
  if (type === 'Object') return `object()`;
  if (type === 'Null') return `any()`;
  console.error('failed to map type ', type, data);
  return `any()`;
};

const illegalVariableChar = /[^a-zA-Z0-9$_]*/gm;
function removeIllegalVariableChar(name: string): string {
  return name.replace(illegalVariableChar, '');
}

const writer: IDataAnalyzerWriter<IRenderOptions> = {
  render(
    results,
    { minRowsForTypeConstraints = 10, nameTransformer = 'default' } = {
      minRowsForTypeConstraints: 10,
      nameTransformer: 'default',
    },
  ) {
    const { options } = results;

    const typeSummary = results.flatTypeSummary;
    const hasNestedTypes =
      typeSummary.nestedTypes && Object.keys(typeSummary.nestedTypes!).length > 0;
    // const { fields } = typeSummary;
    const enableConstraints = results.totalRows >= minRowsForTypeConstraints;
    const fieldNameTransformer =
      nameTransformer === 'default'
        ? removeIllegalVariableChar
        : nameTransformer === 'camelCase'
        ? camelCase
        : snakeCase;

    const getSchema = (schemaName: string, fields: KeyValPair<CombinedFieldInfo>) => {
      return (
        `export type ${properCase(schemaName)} = z.infer<typeof ${properCase(
          schemaName,
        )}Schema>;
export const ${properCase(schemaName)}Schema = z.object({\n` +
        Object.entries(fields)
          .map(([fieldName, fieldInfo]) => {
            const normalizedRefName = trim(fieldInfo.typeRef, '_');
            const refProperName =
              typeof normalizedRefName === 'string'
                ? normalizedRefName![0]?.toUpperCase() +
                  camelCase(normalizedRefName).slice(1)
                : undefined;

            // console.log(fieldName, fieldInfo.typeRef, refProperName, normalizedRefName);

            const {
              type,
              typeSummary: {
                value: valueAggregate,
                length: lengthAggregate,
                // precision: precisionAggregate,
                // scale: scaleAggregate,
              },
            } = fieldInfo;
            const bigNumSuffix = type === 'BigNumber' ? 'n' : '';
            const maxValue =
              typeof valueAggregate === 'object' && typeof valueAggregate.max === 'number'
                ? valueAggregate.max
                : undefined;
            const minValue =
              typeof valueAggregate === 'object' && typeof valueAggregate.min === 'number'
                ? valueAggregate.min
                : undefined;
            const maxLength =
              typeof lengthAggregate === 'object' &&
              typeof lengthAggregate.max === 'number'
                ? lengthAggregate.max
                : undefined;
            const minLength =
              typeof lengthAggregate === 'object' &&
              typeof lengthAggregate.min === 'number'
                ? lengthAggregate.min
                : undefined;

            if (fieldInfo == null) return `// null field info !!!`;
            if (fieldInfo.typeRef)
              return `  ${fieldNameTransformer(
                fieldName,
              )}: z.lazy(() => ${refProperName}Schema)`;

            return `  ${fieldNameTransformer(fieldName)}: z.${getZodType(fieldInfo)}${
              fieldInfo.nullable ? '' : '.required()'
            }${
              enableConstraints && (minValue || minLength)
                ? `.min(${minValue || minLength}${bigNumSuffix})`
                : ''
            }${
              enableConstraints && (maxValue || maxLength)
                ? `.max(${maxValue || maxLength}${bigNumSuffix})`
                : ''
            }${
              enableConstraints && minLength && minLength === maxLength
                ? `.length(${maxLength}, { message: "Exact length required: ${maxLength}" })`
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
    return getHeader() + removeBlankLines(code) + '\n';
  },
};

function moveModuleExports(code: string): string {
  // const mongooseModelLines = /^const.*mongoose.model.*$/gim;
  const moduleLines = /^export type.*$/gim;
  let moduleMatch: null | string[] = moduleLines.exec(code);
  // let mongooseMatch: null | string[] = mongooseModelLines.exec(code);
  // const moduleConstLines: string[] = [];
  const moduleExportLines: string[] = [];
  while (Array.isArray(moduleMatch) && moduleMatch.length > 0) {
    moduleExportLines.push(...moduleMatch);
    moduleMatch = moduleLines.exec(code);
  }
  // while (Array.isArray(mongooseMatch) && mongooseMatch.length > 0) {
  //   moduleConstLines.push(...mongooseMatch);
  //   mongooseMatch = mongooseModelLines.exec(code);
  // }

  code =
    code.replace(moduleLines, '') +
    // moduleConstLines.join('\n') +
    '\n' +
    moduleExportLines.join('\n');
  return code;
}

export default writer;
