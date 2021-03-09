/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/first */
import { schemaAnalyzer } from '../schema-analyzer/index';

import knex from './writer.knex';
import typescript from './writer.typescript';
import mongoose from './writer.mongoose';
import users from '../../public/data/users.example.json';
import usersSparse from '../../public/data/user_sparse-subtypes.json';
import people from '../../public/data/swapi-people.json';
import pokemon from '../../public/data/pokemon-charmander.json';
// import commerceDeptNews from '../../public/data/commerce-dept-news.json';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

const productCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(path.resolve(__dirname, '../../public/data/products-3000.csv'), 'utf8'),
).catch((err) => void console.error(err) || []);

const usersCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(path.resolve(__dirname, '../../public/data/users-alt.csv'), 'utf8'),
).catch((err) => void console.error(err) || []);

// const flattenWrapper = (result: TypeSummary<any>) => {
//   result = flattenTypes(result, {
//     nullableRowsThreshold: 0.0001,
//     targetValue: 'p99',
//     targetLength: 'p99',
//     targetPrecision: 'p99',
//     targetScale: 'p99',
//   });
//   // if (!isCI) console.log(JSON.stringify(result, null, 2))
//   return result;
// };

function parseCsv(content: any): Promise<any[]> {
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

describe('#knex', () => {
  it('can emit migration', async () => {
    const results = await schemaAnalyzer('users', users, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = knex.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit migration for people json', async () => {
    const results = await schemaAnalyzer('people', people, {
      debug: true,
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = knex.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit migration for nested type', async () => {
    const results = await schemaAnalyzer('users', usersSparse, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = knex.render(results);

    expect(code).toMatchSnapshot();
  });

  it.skip('can emit migration with bigInteger id', async () => {
    let localData = usersSparse.map((u) => ({ ...u }));
    if (localData && localData[0]) localData[0].id = '2147483648';
    if (localData && localData[1]) localData[1].id = '2147483649';
    const results = await schemaAnalyzer('users', localData, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'max',
        targetPrecision: 'max',
        targetScale: 'max',
        targetValue: 'max',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = knex.render(results);

    expect(code).toMatchSnapshot();
  });
});

describe('#mongoose', () => {
  it('can emit schema', async () => {
    const results = await schemaAnalyzer('users', users, {
      debug: true,
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = mongoose.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit schema with better names', async () => {
    const results = await schemaAnalyzer('Pokemon', pokemon, {
      debug: true,
      prefixNamingMode: 'trim',
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = mongoose.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit schema for people json', async () => {
    const results = await schemaAnalyzer('people', people, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = mongoose.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit schema with nested types', async () => {
    const results = await schemaAnalyzer('users', usersSparse, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = mongoose.render(results);
    expect(code).toMatchSnapshot();
  });

  it('can emit module exports correctly', async () => {
    const results = await schemaAnalyzer('pokemon', pokemon, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = mongoose.render(results);
    expect(code).toMatchSnapshot();
  });
});

describe('#typescript', () => {
  it('can emit interface(s)', async () => {
    const results = await schemaAnalyzer('users', users, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = typescript.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit interface for people json', async () => {
    const results = await schemaAnalyzer('people', people, {
      debug: true,
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = typescript.render(results);

    expect(code).toMatchSnapshot();
  });

  it('can emit interface for nested types', async () => {
    const results = await schemaAnalyzer('users', usersSparse, {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = typescript.render(results);

    expect(code).toMatchSnapshot();
  });
});
