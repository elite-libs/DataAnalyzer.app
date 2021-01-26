/* eslint-disable import/first */

import { schemaAnalyzer, helpers } from 'schema-analyzer/index';

const flattenTypes = helpers.flattenTypes;
import knex from './writer.knex';
import users from '../../../../public/users.example.json';
import usersSparse from '../../../../public/user_sparse-subtypes.json';
import people from '../../../../public/swapi-people.json';
import commerceDeptNews from '../../../../public/commerce-dept-news.json';
// import people from '../../../../public/swapi-people.json'
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

const productCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(
    path.resolve(__dirname, '../../../../public/products-3000.csv'),
    'utf8',
  ),
);

const usersCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(
    path.resolve(__dirname, '../../../../public/users-alt.csv'),
    'utf8',
  ),
);

const flattenWrapper = (result) => {
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

function parseCsv(content): Promise<any[]> {
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

describe('knex writer', () => {
  it('can emit correct knex migration', async () => {
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

  it('can emit knex migration for people json', async () => {
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
      schemaName: 'test',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit knex migration for nested user json', async () => {
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
      schemaName: 'test',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });
});
