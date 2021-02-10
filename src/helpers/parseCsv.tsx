import csvParse from 'csv-parse';
// import path from 'path';
// import fs from 'fs';

export function parseCsv(content: any): Promise<any[]> {
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
}
