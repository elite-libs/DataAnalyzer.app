import csvParse from 'csv-parse';
import type { IReaderAdapter } from './readers';

const csvReader: IReaderAdapter = {
  name: 'csv',
  shouldParse(content: string) {
    const sample =
      (content && content.length > 500 ? content.slice(0, 500) : content) || '';
    return sample.split(/[,\t|]/).length > 5;
  },

  parse(content: string) {
    return new Promise((resolve, reject) => {
      csvParse(
        content,
        {
          columns: true,
          trim: true,
          skip_empty_lines: true,
        },
        (err, results, info) => {
          if (err) return reject(err);
          resolve(results);
        },
      );
    });
  },
};

export default csvReader;
