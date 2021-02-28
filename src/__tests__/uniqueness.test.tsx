import usersSparse from '../../public/data/user_sparse-subtypes.json';
import { schemaAnalyzer, helpers } from '../schema-analyzer/index';

it('can detect string-ish IDs', async () => {
  const options = { strictMatching: false };
  const results = await schemaAnalyzer('users', usersSparse, options);
  expect(results.fields.id).toBeDefined();
  expect(results.fields.id?.unique).toBe(true);
  expect(results.fields.id?.identity).toBe(true);
  expect(results.fields.id?.nullable).toBe(false);
});
