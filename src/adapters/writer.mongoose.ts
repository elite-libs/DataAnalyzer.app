import { camelCase } from 'lodash';
import {
  NumericFieldInfo,
  TypeNameStringComposite,
  TypeNameStringDecimal,
} from '../schema-analyzer';
import { properCase, removeBlankLines } from 'helpers';
import type { IDataAnalyzerWriter, IRenderArgs } from './writers';

const writer: IDataAnalyzerWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const hasNestedTypes =
      results.nestedTypes && Object.keys(results.nestedTypes!).length > 0;
    const { fields } = results;
    const getFields = () => {
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
        return Object.entries(results.nestedTypes!).map(([nestedName, results]) => {
          // console.log('nested mongoose schema:', nestedName);
          return this.render({
            schemaName: nestedName,
            results,
            options: { disableNestedTypes: false },
          });
        });
      }
      return '';
    };
    return getHeader() + removeBlankLines(getFields() + getRecursive());
  },
};

export default writer;

const getHeader = () => {
  return `const mongoose = require("mongoose");
const {Schema, Model, Types} = mongoose;

`;
};
