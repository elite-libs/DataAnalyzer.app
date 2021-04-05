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
import eventResults from '../../public/data/ticketmaster-event-results.json';

import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

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
    const code = mongoose.render(results);
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
    // await writeJson('build/mongooseResults.json', results);
    const code = mongoose.render(results);
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
    const code = mongoose.render(results);
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
    const code = mongoose.render(results);
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
    const code = mongoose.render(results);
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
    const code = mongoose.render(results);
    expect(code).toMatchSnapshot();
  });
});
