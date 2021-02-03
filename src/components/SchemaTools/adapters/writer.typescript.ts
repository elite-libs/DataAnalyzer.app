/* eslint-disable import/no-anonymous-default-export */
import { camelCase, startCase } from 'lodash';
import { IDataStepWriter, IRenderArgs } from './writers';

const writer: IDataStepWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const { fields } = results;
    return Object.entries(fields)
    .map(([fieldName, fieldInfo]) => {
      return `  ${camelCase(fieldName)}: {
  type: ${fieldInfo.type},
  ${fieldInfo.enum && fieldInfo.enum.length > 0 ? 'enum: ["' + fieldInfo.enum.join('", "') + '"]' : ''}
}`;
    });

// ${fieldString.replace(/\\n/gms, '\n')}
  },
};

export default writer;

const getHeader = ({schemaName}: any) => {
  return `const mongoose = require("mongoose");
const {Schema} = mongoose;

const ${startCase(schemaName)} = new Schema({`
}

const getFooter = ({schemaName}: any) => {
  return `});

  const model = mongoose.model("${camelCase(schemaName)}", ${startCase(schemaName)});
  
  module.exports = model;
`
}