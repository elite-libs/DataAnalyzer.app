/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/first */
import { schemaAnalyzer } from '../schema-analyzer/index';
import typescript from './writer.typescript';
import users from '../../public/data/users.example.json';
import usersSparse from '../../public/data/user_sparse-subtypes.json';
import people from '../../public/data/swapi-people.json';
import pokemon from '../../public/data/pokemon-charmander.json';
import eventResults from '../../public/data/ticketmaster-event-results.json';

// import path from 'path';
// import fs from 'fs';
// import csvParse from 'csv-parse';

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

  it('can handle bigint', async () => {
    const results = await schemaAnalyzer(
      'users',
      { id: '12345678901234567890', username: 'Dan', email: 'dan@example.com' },
      {
        debug: true,
        strictMatching: false,

        flattenOptions: {
          targetLength: 'p99',
          targetPrecision: 'p99',
          targetScale: 'p99',
          targetValue: 'p99',
          nullableRowsThreshold: 0.001,
        },
      },
    );
    const code = typescript.render(results);
    expect(code).toMatch(/id.*bigint/gi);
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
    const code = typescript.render(results);
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
    // await writeJson('build/typescriptResults.json', results);
    const code = typescript.render(results);
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
    const code = typescript.render(results);
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
    const code = typescript.render(results);
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
    const code = typescript.render(results);
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
    const code = typescript.render(results);
    expect(code).toMatchSnapshot();
  });
});
