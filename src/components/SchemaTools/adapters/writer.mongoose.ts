/* eslint-disable import/no-anonymous-default-export */
import camelcase from 'lodash.camelcase';
import { IDataStepWriter, IRenderArgs } from './writers';

const writer: IDataStepWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const { fields } = results;
    const fieldNames = Object.keys(fields);

    const fieldString = fieldNames
      .map((f) => {
        const field = fields[f];
        // console.log(f, field.type);
        return `  ${camelcase(f)}: {
    type: ${field.type},
    default: null
  }`;
      })
      .join(',\n');

    return `const mongoose = require("mongoose");
const {Schema} = mongoose;

const schema = new Schema({
${fieldString.replace(/\\n/gms, '\n')}
});

const model = mongoose.model("${schemaName}", schema);

module.exports = model;
`;
  },
};

export default writer;
