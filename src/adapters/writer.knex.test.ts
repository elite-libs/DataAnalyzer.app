/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/first */
import { schemaAnalyzer } from '../schema-analyzer/index';

import knex from './writer.knex';
import users from '../../public/data/users.example.json';
import usersSparse from '../../public/data/user_sparse-subtypes.json';
import people from '../../public/data/swapi-people.json';
import pokemon from '../../public/data/pokemon-charmander.json';
import eventResults from '../../public/data/ticketmaster-event-results.json';
import { ISchemaAnalyzerOptions } from 'types';

// import path from 'path';
// import fs from 'fs';
// import csvParse from 'csv-parse';

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

  it('can emit migration for long fields', async () => {
    const getDataBigField = (fieldLength: number) => {
      let usersWithNChar = [...users];
      usersWithNChar[0]!.profile = Array(fieldLength + 1)
        .fill('/')
        .join('');
      usersWithNChar[1]!.profile = Array(fieldLength + 1)
        .fill('=')
        .join('');
      return usersWithNChar;
    };
    const options: ISchemaAnalyzerOptions = {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'max',
        targetPrecision: 'max',
        targetScale: 'max',
        targetValue: 'max',
        nullableRowsThreshold: 0.001,
      },
    };

    let code = knex.render(await schemaAnalyzer('users', getDataBigField(400), options));
    expect(code).toMatchSnapshot();
    code = knex.render(await schemaAnalyzer('users', getDataBigField(600), options));
    expect(code).toMatchSnapshot();
    code = knex.render(await schemaAnalyzer('users', getDataBigField(800), options));
    expect(code).toMatchSnapshot();
    code = knex.render(await schemaAnalyzer('users', getDataBigField(1000), options));
    expect(code).toMatchSnapshot();
    code = knex.render(await schemaAnalyzer('users', getDataBigField(2000), options));
    expect(code).toMatchSnapshot();
    code = knex.render(await schemaAnalyzer('users', getDataBigField(4000), options));
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

  it('can emit migration for pokemon json', async () => {
    const results = await schemaAnalyzer('pokemon', pokemon, {
      debug: true,
      prefixNamingMode: 'full',
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

  it('can emit migration for pokemon json, w/ dense fields', async () => {
    const results = await schemaAnalyzer('pokemon', pokemon, {
      debug: true,
      consolidateTypes: 'field-names',
      prefixNamingMode: 'full',
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    });
    // await writeJson('build/knexResults.json', results);
    const code = knex.render(results);
    expect(code).toMatchSnapshot();
  });

  it('can emit migration for pokemon json, w/ dense & trim fields', async () => {
    const results = await schemaAnalyzer('pokemon', pokemon, {
      debug: true,
      consolidateTypes: 'field-names',
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
    const code = knex.render(results);
    expect(code).toMatchSnapshot();
  });

  it('can emit migration for eventResults json', async () => {
    const results = await schemaAnalyzer('eventResults', eventResults, {
      debug: true,
      prefixNamingMode: 'full',
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

  it('can emit migration for eventResults json, w/ dense fields', async () => {
    const results = await schemaAnalyzer('eventResults', eventResults, {
      debug: true,
      consolidateTypes: 'field-names',
      prefixNamingMode: 'full',
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

  it('can emit migration for eventResults json, w/ dense & trim fields', async () => {
    const results = await schemaAnalyzer('eventResults', eventResults, {
      debug: true,
      consolidateTypes: 'field-names',
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
