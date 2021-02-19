import usersSparse from '../../public/data/user_sparse-subtypes.json';
import {
  schemaAnalyzer,
  helpers,
  FieldTypeSummary,
  TypeSummary,
} from '../schema-analyzer/index';

const flattenTypes = helpers.flattenTypes;

it('can detect string-ish IDs', async () => {
  const options = { strictMatching: false };
  const results = await schemaAnalyzer('users', usersSparse, options);
  // const flatResult = helpers.flattenTypes(results, {
  //   targetLength: 'p99',
  //   targetPrecision: 'p99',
  //   targetScale: 'p99',
  //   targetValue: 'p99',
  //   nullableRowsThreshold: 0.001,
  // });

  expect(results.fields.id).toBeDefined();
  expect(results.fields.id?.unique).toBe(true);
  expect(results.fields.id?.identity).toBe(true);
  expect(results.fields.id?.nullable).toBe(false);
});
