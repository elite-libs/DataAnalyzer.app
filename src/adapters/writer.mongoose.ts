import { camelCase } from 'lodash';
import {
  CombinedFieldInfo,
  NumericFieldInfo,
  TypeNameStringComposite,
  TypeNameStringDecimal,
} from 'types';
import { properCase, removeBlankLines } from 'helpers';
import { KeyValPair } from 'types';
import type { IDataAnalyzerWriter } from './writers';

const writer: IDataAnalyzerWriter = {
  render(results) {
    const { options } = results;
    const typeSummary = results.flatTypeSummary;
    const hasNestedTypes =
      typeSummary.nestedTypes && Object.keys(typeSummary.nestedTypes!).length > 0;
    // const { fields } = typeSummary;
    const getSchema = (schemaName: string, fields: KeyValPair<CombinedFieldInfo>) => {
      return (
        `const ${properCase(schemaName)} = new Schema({\n` +
        Object.entries(fields)
          .map(([fieldName, fieldInfo]) => {
            if (fieldInfo == null) return `// null field info !!!`;
            return `  ${camelCase(fieldName)}: {
    type: "${fieldInfo.type}",
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
        return Object.entries(typeSummary.nestedTypes!).map(([nestedName, results]) => {
          // console.log('nested mongoose schema:', nestedName);
          return getSchema(nestedName, results.fields);
        });
      }
      return '';
    };
    return (
      getHeader() +
      removeBlankLines(
        getSchema(results.schemaName!, typeSummary.fields) + getRecursive(),
      )
    );
  },
};

export default writer;

const getHeader = () => {
  return `const mongoose = require("mongoose");
const {Schema, Model, Types} = mongoose;

`;
};
