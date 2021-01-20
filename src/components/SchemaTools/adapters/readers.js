import readerCsv from './reader.csv.js'
import readerJson from './reader.json.js'

export const parse = content => {
  const readers = [readerJson, readerCsv]
  const reader = readers.find(r => r.shouldParse(content))
  return reader && reader.parse(content)
}
