/* eslint-disable import/first */

import {
  schemaAnalyzer,
  helpers,
  FieldTypeSummary,
  TypeSummary,
} from '../schema-analyzer/index';

const flattenTypes = helpers.flattenTypes;
import knex from './writer.knex';
import typescript from './writer.typescript';
import mongoose from './writer.mongoose';
import users from '../../public/data/users.example.json';
import usersSparse from '../../public/data/user_sparse-subtypes.json';
import people from '../../public/data/swapi-people.json';
// import commerceDeptNews from '../../../../public/data/commerce-dept-news.json';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

const productCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(
    path.resolve(__dirname, '../../../../public/data/products-3000.csv'),
    'utf8',
  ),
).catch((err) => void console.error(err) || []);

const usersCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(
    path.resolve(__dirname, '../../../../public/data/users-alt.csv'),
    'utf8',
  ),
).catch((err) => void console.error(err) || []);

const flattenWrapper = (result: TypeSummary<any>) => {
  result = flattenTypes(result, {
    nullableRowsThreshold: 0.0001,
    targetValue: 'p99',
    targetLength: 'p99',
    targetPrecision: 'p99',
    targetScale: 'p99',
  });
  // if (!isCI) console.log(JSON.stringify(result, null, 2))
  return result;
};

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
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', users, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = knex.render({
      schemaName: 'test',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit migration for people json', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('people', people, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = knex.render({
      schemaName: 'people',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit migration for nested type', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', usersSparse, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = knex.render({
      schemaName: 'usersSparse',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it.skip('can emit migration with bigInteger id', async () => {
    const options = { strictMatching: false };
    let localData = usersSparse.map((u) => ({ ...u }));
    if (localData && localData[0]) localData[0].id = '2147483648';
    if (localData && localData[1]) localData[1].id = '2147483649';
    const results = await schemaAnalyzer('users', localData, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'max',
      targetPrecision: 'max',
      targetScale: 'max',
      targetValue: 'max',
      nullableRowsThreshold: 0.001,
    });

    const code = knex.render({
      schemaName: 'usersBigInt',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });
});

describe('#mongoose', () => {
  it('can emit schema', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', users, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = mongoose.render({
      schemaName: 'users',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit schema for people json', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('people', people, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = mongoose.render({
      schemaName: 'people',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit schema with nested types', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', usersSparse, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = mongoose.render({
      schemaName: 'usersSparse',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });
});

describe('#typescript', () => {
  it('can emit interface(s)', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', users, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = typescript.render({
      schemaName: 'users',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit interface for people json', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('people', people, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = typescript.render({
      schemaName: 'people',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit interface for nested types', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', usersSparse, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = typescript.render({
      schemaName: 'usersSparse',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });
});
