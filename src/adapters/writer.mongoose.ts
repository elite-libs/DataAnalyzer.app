import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import {
  CombinedFieldInfo,
  NumericFieldInfo,
  TypeNameStringComposite,
  TypeNameStringDecimal,
} from 'types';
import { properCase, removeBlankLines } from 'helpers';
import { KeyValPair } from 'types';
import type { IDataAnalyzerWriter } from './writers';

interface IRenderOptions {
  nameTransformer: 'default' | 'camelCase' | 'snakeCase';
}

const illegalVariableChar = /[^a-zA-Z0-9$_]*/gm;
function removeIllegalVariableChar(name: string): string {
  return name.replace(illegalVariableChar, '');
}

const writer: IDataAnalyzerWriter<IRenderOptions> = {
  render(results, { nameTransformer = 'default' } = { nameTransformer: 'default' }) {
    const { options } = results;
    const typeSummary = results.flatTypeSummary;
    const hasNestedTypes =
      typeSummary.nestedTypes && Object.keys(typeSummary.nestedTypes!).length > 0;

    const fieldNameTransformer =
      nameTransformer === 'default'
        ? removeIllegalVariableChar
        : nameTransformer === 'camelCase'
        ? camelCase
        : snakeCase;

    const getSchema = (schemaName: string, fields: KeyValPair<CombinedFieldInfo>) => {
      return (
        `const ${properCase(schemaName)} = new Schema({\n` +
        Object.entries(fields)
          .map(([fieldName, fieldInfo]) => {
            if (fieldInfo == null) return `// null field info !!!`;
            return `  ${fieldNameTransformer(fieldName)}: {
    type: "${fieldInfo.typeRef || fieldInfo.type.replace('BigNumber', 'Decimal128')}",
    ${fieldInfo.unique ? 'unique: true,' : ''}
    ${fieldInfo.nullable ? '' : 'required: true,'}
    ${
      fieldInfo.value && TypeNameStringDecimal.includes(fieldInfo.type)
        ? 'max: ' + (fieldInfo as NumericFieldInfo).value + ','
        : ''
    }
    ${
      fieldInfo.value && TypeNameStringComposite.includes(fieldInfo.type)
        ? 'maxLength: ' + fieldInfo.value + ','
        : ''
    }
    ${
      Array.isArray(fieldInfo.enum) && fieldInfo.enum.length > 0
        ? 'enum: ["' + fieldInfo.enum.join('", "') + '"],'
        : ''
    }
  }`;
          })
          .join(',\n') +
        `});

const ${camelCase(schemaName)}Model = mongoose.model("${camelCase(
          schemaName,
        )}", ${properCase(schemaName)});
    
module.exports.${properCase(schemaName)} = ${camelCase(schemaName)}Model;\n`
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
    return getHeader() + removeBlankLines(code);
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

const getHeader = () => {
  return `const mongoose = require("mongoose");
const {Schema, Model, Types} = mongoose;

`;
};
