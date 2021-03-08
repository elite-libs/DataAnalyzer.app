import readerCsv from './reader.csv';
import readerJson from './reader.json';

export interface IReaderAdapter {
  name: string;
  shouldParse: (input: string) => boolean;
  parse: (input: any) => Promise<any[] | any>;
}

const readers: IReaderAdapter[] = [readerJson, readerCsv];

export const parse = (content: string) => {
  // console.log('attempting ', content);
  const reader = readers.find((r) => r.shouldParse(content));
  // console.log('attempting ', reader);
  return (reader && reader.parse(content)) || false;
};
