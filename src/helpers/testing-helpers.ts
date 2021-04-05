import fs from 'fs';
import path from 'path';
import { parseCsv } from './parseCsv';

export const productCsv = (): Promise<any[]> =>
  parseCsv(
    fs.readFileSync(
      path.resolve(__dirname, '../../public/data/products-3000.csv'),
      'utf8',
    ),
  ).catch((err) => void console.error(err) || []);

export const usersCsv = (): Promise<any[]> =>
  parseCsv(
    fs.readFileSync(path.resolve(__dirname, '../../public/data/users-alt.csv'), 'utf8'),
  ).catch((err) => void console.error(err) || []);
