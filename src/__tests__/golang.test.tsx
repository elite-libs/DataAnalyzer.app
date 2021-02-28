import golang from '../adapters/writer.golang';
import {
  schemaAnalyzer,
  helpers,
  // FieldTypeSummary,
  // TypeSummary,
} from '../schema-analyzer/index';
import usersNotes from '../../public/data/user-notes.json';
import users from '../../public/data/users.example.json';
import pokemonCharmander from '../../public/data/pokemon-charmander.json';

describe('#GoLang', () => {
  it('can emit structs with enum', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('users', users, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
      targetValue: 'p99',
      nullableRowsThreshold: 0.001,
    });
    const code = golang.render({
      schemaName: 'users',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
    expect(flatResult).toMatchSnapshot();
  });

  it('can emit nested structs', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('User', usersNotes, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'max',
      targetPrecision: 'max',
      targetScale: 'max',
      targetValue: 'max',
      nullableRowsThreshold: 0.001,
    });
    const code = golang.render({
      schemaName: 'users',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  it('can emit deeply nested structs', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('Pokemon', pokemonCharmander, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'max',
      targetPrecision: 'max',
      targetScale: 'max',
      targetValue: 'max',
      nullableRowsThreshold: 0.001,
    });
    const code = golang.render({
      schemaName: 'Pokemon',
      results: flatResult,
      options,
    });

    expect(code).toMatchSnapshot();
  });

  // it('can emit golang', async () => {
  //   const options = { strictMatching: false };
  //   const results = await schemaAnalyzer('users', usersSparse, options);

  //   expect(results.fields.id).toBeDefined();
  //   expect(results.fields.id?.unique).toBe(true);
  //   expect(results.fields.id?.identity).toBe(true);
  //   expect(results.fields.id?.nullable).toBe(false);
  // });
});

// golang
