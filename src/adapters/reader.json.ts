import type { IReaderAdapter } from './readers';

const jsonReader: IReaderAdapter = {
  name: 'json',
  shouldParse(content: string) {
    content = `${content}`.trim();
    if (content.startsWith('[') || content.startsWith('{')) return true;
    return false;
  },
  parse(content: string) {
    return Promise.resolve(JSON.parse(content));
  },
};

export default jsonReader;
