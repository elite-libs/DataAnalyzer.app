import camelcase from 'lodash.camelcase'

export default {
  render ({ schemaName, results, options }) {
    console.log(results)
    // results._uniques = undefined;
    // results._totalRecords = undefined;
    const fieldSummary = results._summary

    const fieldString = fieldSummary
      .map(f => {
        const types = Object.entries(f.typeInfo).sort(
          ([typeName1, typeCount1], [typeName2, typeCount2]) =>
            typeCount1 > typeCount2 ? -1 : typeCount1 === typeCount2 ? 0 : 1
        )
        console.log(f.fieldName, types)
        return `  ${camelcase(f.fieldName)}: {
    type: ${types[0][0]},
    default: null
  }`
      })
      .join(',\n')

    return `const mongoose = require("mongoose");
const {Schema} = mongoose;

const schema = new Schema({
${fieldString.replace(/\\n/gms, '\n')}
});

const model = mongoose.model("${schemaName}", schema);

module.exports = model;
`
  }
}
