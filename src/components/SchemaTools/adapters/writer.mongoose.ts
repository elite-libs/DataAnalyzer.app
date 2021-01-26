/* eslint-disable import/no-anonymous-default-export */
import camelcase from 'lodash.camelcase';
import { IDataStepWriter, IRenderArgs } from './writers';

const writer: IDataStepWriter = {
  render({ results, options, schemaName }: IRenderArgs) {
    const { fields } = results;
    const fieldNames = Object.keys(fields);

    const fieldString = fieldNames
      .map((f) => {
        const types = Object.entries(
          f.typeInfo,
        ).sort(([typeName1, typeCount1], [typeName2, typeCount2]) =>
          typeCount1 > typeCount2 ? -1 : typeCount1 === typeCount2 ? 0 : 1,
        );
        console.log(f.fieldName, types);
        return `  ${camelcase(f.fieldName)}: {
    type: ${types[0][0]},
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
