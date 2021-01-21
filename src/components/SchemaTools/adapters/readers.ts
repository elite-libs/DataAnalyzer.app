import readerCsv from './reader.csv'
import readerJson from './reader.json'

export const parse = (content: string) => {
  const readers = [readerJson, readerCsv]
  const reader = readers.find(r => r.shouldParse(content))
  return reader && reader.parse(content)
}
