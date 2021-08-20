import golang from '../adapters/writer.golang';
import { schemaAnalyzer } from '../schema-analyzer/index';
import usersNotes from '../../public/data/user-notes.json';
import users from '../../public/data/users.example.json';
import pokemonCharmander from '../../public/data/pokemon-charmander.json';
import eventSearch from '../../public/data/ticketmaster-event-results.json';

import { ISchemaAnalyzerOptions } from 'types';

describe('#GoLang', () => {
  it('can emit structs with enum', async () => {
    const options: ISchemaAnalyzerOptions = {
      strictMatching: false,
      flattenOptions: {
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
        targetValue: 'p99',
        nullableRowsThreshold: 0.001,
      },
    };
    const results = await schemaAnalyzer('users', users, options);
    const code = golang.render(results);
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
    const code = golang.render(results);
    expect(code).toMatch(/id.*big\.Int/gi);
    expect(code).toMatchSnapshot();
  });

  it('can emit nested structs', async () => {
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
    const results = await schemaAnalyzer('User', usersNotes, options);
    const code = golang.render(results);
    expect(code).toMatchSnapshot();
  });

  it('can emit deeply nested structs', async () => {
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
    const results = await schemaAnalyzer('Pokemon', pokemonCharmander, options);
    const code = golang.render(results);
    expect(code).toMatchSnapshot();
  });

  it('can emit consolidated nested structs', async () => {
    const options: ISchemaAnalyzerOptions = {
      strictMatching: false,
      consolidateTypes: 'field-names',
      debug: true,
      flattenOptions: {
        targetLength: 'max',
        targetPrecision: 'max',
        targetScale: 'max',
        targetValue: 'max',
        nullableRowsThreshold: 0.001,
      },
    };
    const results = await schemaAnalyzer('Pokemon', pokemonCharmander, options);
    const code = golang.render(results);
    expect(code).toMatchSnapshot();
  });

  it('can emit correctly prefixed type-names', async () => {
    const results = await schemaAnalyzer('EventResults', eventSearch, {
      strictMatching: false,
      consolidateTypes: 'field-names',
      debug: true,
      flattenOptions: {
        targetLength: 'max',
        targetPrecision: 'max',
        targetScale: 'max',
        targetValue: 'max',
        nullableRowsThreshold: 0.001,
      },
    });
    const code = golang.render(results);
    expect(code).toContain('type Links struct');
  });
});
