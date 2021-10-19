/* eslint-disable jest/valid-expect-in-promise */
import { schemaAnalyzer, _getNumberRangeStats, parseDate } from './index';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import { flattenTypes } from './utils/helpers';

import userNotes from '../../public/data/user-notes.json';
import properties from '../../public/data/real-estate.example.json';
import people from '../../public/data/swapi-people.json';
import users from '../../public/data/users.example.json';
import userData_SparseSubtypes from '../../public/data/user_sparse-subtypes.json';

const productCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(
    path.resolve(__dirname, '../../public/data/products-3000.csv'),
    'utf8',
  ),
).catch((err) => void console.error(err) || []);

const usersCsv: Promise<any[]> = parseCsv(
  fs.readFileSync(
    path.resolve(__dirname, '../../public/data/users-alt.csv'),
    'utf8',
  ),
).catch((err) => void console.error(err) || []);

// process.on('unhandledRejection', (reason, promise) => {
//   // promise.catch(
//   //   console.error.bind(console, 'UNHANDLED BUSINESS!!! ERROR NOT CAUGHT:'),
//   // );
//   console.log(
//     'Unhandled rejection at ',
//     promise,
//     `reason: ${JSON.stringify(reason)}`,
//   );
//   console.dir(reason);
//   process.exit(1);
// });

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

const isCI = process.env.CI;

describe('handles invalid usage', () => {
  it('handles missing arguments', () => {
    expect(() => schemaAnalyzer('test', [])).toThrowError(/record required/);
    expect(() => schemaAnalyzer('test', ['test'])).toThrowError(
      /must be an Array of Objects/,
    );
    // @ts-ignore
    expect(() => schemaAnalyzer('test', 'test')).toThrowError(
      /must be an Object or Array/,
    );
    // @ts-ignore
    expect(() => schemaAnalyzer('test', null)).toThrowError(
      /must be an Object or Array/,
    );
  });
});

describe('primary use-cases', () => {
  it('analyze users.json', () => {
    return schemaAnalyzer('users', users).then((result) =>
      expect(result).toMatchSnapshot('usersResult'),
    );
  });

  it('analyze properties.json', () => {
    return schemaAnalyzer('properties', properties, {
      disableNestedTypes: true,
    }).then((result) => expect(result).toMatchSnapshot('propertiesResult'));
  });

  it('analyze all 3K+ rows in products.csv', async () => {
    const result = await schemaAnalyzer('products', await productCsv);
    expect(result).toMatchSnapshot('productsResult');
  });

  it('analyze top 1250 rows in products.csv', async () => {
    const result = await schemaAnalyzer(
      'products',
      (await productCsv).slice(0, 1250),
    );
    expect(result).toMatchSnapshot('productsResult_1250');
  });

  it('analyze top 250 rows in products.csv', async () => {
    const result = await schemaAnalyzer(
      'products',
      (await productCsv).slice(0, 250),
    );
    expect(flattenWrapper(result)).toMatchSnapshot('productsResult_250_flat');
    expect(result).toMatchSnapshot('productsResult_250');
  });

  it('analyze inline csv', async () => {
    const sampleCsv = await parseCsv(`id,name,role,email,createdAt,accountConfirmed,rankScore
  1,Eve,poweruser,eve@example.com,2020-01-20,undefined,123.456
  2,Alice,user,ali@example.com,2020-02-02,true,111.23
  3,Bob,user,robert@example.com,2019-12-31,true,1.23
  4,Elliot Alderson,admin,falkensmaze@protonmail.com,2001-01-01,false,1.23
  5,Sam Sepiol,admin,falkensmaze@hotmail.com,9/9/99,true,1.23
`);

    return schemaAnalyzer('sampleCsv', sampleCsv as any[]).then((result) => {
      expect(flattenWrapper(result)).toMatchSnapshot('accountsCsvResult_flat');
      expect(result).toMatchSnapshot('accountsCsvResult');
    });
  });

  it('analyze people.json', async () => {
    // @ts-ignore
    people[0].created = new Date(people[0].created);
    // @ts-ignore
    people[1].created = new Date('0000-01-01');
    // @ts-ignore
    people[2].created = new Date('x');
    const result = await schemaAnalyzer('people', people);
    // if (!isCI) console.log('people', JSON.stringify(result, null, 2))
    expect(result).toMatchSnapshot('peopleResult');
  });

  it('supports enum detection', async () => {
    const results = await schemaAnalyzer('people', people, {
      strictMatching: false,
      enumMinimumRowCount: 10,
      enumAbsoluteLimit: 8,
    });
    expect(results).toMatchSnapshot('peopleWithEnums');
    expect(results.fields?.id?.unique).toBeTruthy();
    expect(results.fields?.eye_color?.enum?.length).toBe(8);
  });

  it('supports typed list/array detection', async () => {
    const results = await schemaAnalyzer('people', people, {
      strictMatching: false,
      enumMinimumRowCount: 1000,
      enumAbsoluteLimit: -1,
    });
    expect(results).toMatchSnapshot('peopleWithEnums');
    console.log('results.fields?.films?.types', results.fields?.films?.types);
    expect(results.fields?.films?.types.Array).toBeTruthy();
    expect(results.fields?.films?.types.Array?.typeAlias).toBe('string');
  });

  it('handles null field data', async () => {
    const data = [
      { id: 997, text: 'hello', sparseField: null },
      { id: 998, text: 'world' },
      { id: 999, text: 'hello' },
    ];

    const results = await schemaAnalyzer('notes', data);
    expect(results.fields?.sparseField?.types?.Null?.count).toBe(1);
    expect(results).toMatchSnapshot('nullFieldsSmall');
  });

  it('can handle nested types', async () => {
    const result = await schemaAnalyzer('users', userNotes);
    expect(result.fields.name).toBeDefined();
    // if (!isCI) console.log('result.fields.id', result.fields.id)
    // if (!isCI) console.log('result.fields.name', result.fields.name)
    // if (!isCI) console.log('result.fields.notes', result.fields.notes)
    // if (!isCI) console.log('result.fields.notes.$ref', result.fields.notes.$ref)
    // if (!isCI) console.log('result.nestedTypes', result.nestedTypes)
    expect(result.fields.name?.nullable).toBeFalsy();
    expect(result.fields.notes).toBeDefined();
    expect(result.fields?.notes?.types?.$ref).toBeDefined();
    expect(result.fields?.notes?.types?.$ref?.typeAlias).toBe('users.notes');
    expect(result?.nestedTypes).toBeDefined();
    expect(result?.nestedTypes!['users.notes']).toBeDefined();
    expect(
      result?.nestedTypes!['users.notes']?.fields?.id?.nullable,
    ).toBeFalsy();
    expect(result).toMatchSnapshot('nestedData');
    expect(flattenWrapper(result)).toMatchSnapshot('nestedData_flat');
  });

  it('can handle sparsely nested types', async () => {
    const result = await schemaAnalyzer('users', userData_SparseSubtypes);
    // console.warn(result);
    expect(result.fields.name).toBeDefined();
    expect(result.fields.name?.nullable).toBeFalsy();
    expect(result.fields.notes).toBeDefined();
    expect(result.fields?.notes?.types?.Array?.count).toBeGreaterThanOrEqual(
      userData_SparseSubtypes.length,
    );
    // expect(result.fields?.notes?.types?.$ref?.count).toBe(6);
    expect(result.nestedTypes!['users.notes']?.totalRows).toBe(6);
    expect(result.fields?.notes?.types?.$ref).toBeDefined();
    expect(result.fields?.notes?.types?.$ref?.typeAlias).toBe('users.notes');
    expect(result?.nestedTypes).toBeDefined();
    expect(result?.nestedTypes!['users.notes']).toBeDefined();
    expect(
      result?.nestedTypes!['users.notes']?.fields?.id?.nullable,
    ).toBeFalsy();
    expect(result).toMatchSnapshot('sparseNestedData');
    expect(flattenWrapper(result)).toMatchSnapshot('sparseNestedData_flat');
  });

  it('can handle dense nested types', async () => {
    const data = userData_SparseSubtypes;
    if (typeof data[0] === 'object') {
      // take the 3 notes in row[0] and copy them 3x. Adds 9 to the total.
      data[0].notes = data[0]!.notes.concat(
        ...data[0]!.notes.slice(0),
        ...data[0]!.notes.slice(0),
        ...data[0]!.notes.slice(0),
      );
    }
    const result = await schemaAnalyzer('users', data);
    // console.warn(result);
    expect(result.fields.name).toBeDefined();
    expect(result.fields.name?.nullable).toBeFalsy();
    expect(result.fields.notes).toBeDefined();
    expect(result.fields?.notes?.types?.Array?.count).toBeGreaterThanOrEqual(
      data.length,
    );
    expect(result.nestedTypes!['users.notes']?.totalRows).toBe(15);
    expect(result.fields?.notes?.types?.$ref).toBeDefined();
    expect(result.fields?.notes?.types?.$ref?.typeAlias).toBe('users.notes');
    expect(result.nestedTypes).toBeDefined();
    expect(result.nestedTypes!['users.notes']).toBeDefined();
    expect(
      result.nestedTypes!['users.notes']?.fields?.id?.nullable,
    ).toBeFalsy();
    expect(result).toMatchSnapshot('denseNestedData');
    expect(flattenWrapper(result)).toMatchSnapshot('denseNestedData_flat');
  });

  it('can analyze schema w/ enum options', () => {
    const lowEnumLimitLoosePct = schemaAnalyzer('properties', properties, {
      enumMinimumRowCount: 10,
      enumAbsoluteLimit: 30,
    }).then((result) => {
      expect(result).toMatchSnapshot('propertiesResult_lowEnumLimitLoosePct');
    });
    const lowEnumLimitLoose = schemaAnalyzer('properties', properties, {
      enumMinimumRowCount: 10,
      enumAbsoluteLimit: 30,
    }).then((result) =>
      expect(result).toMatchSnapshot('propertiesResult_lowEnumLimitLoose'),
    );
    const lowEnumLimit = schemaAnalyzer('properties', properties, {
      enumMinimumRowCount: 10,
    }).then((result) =>
      expect(result).toMatchSnapshot('propertiesResult_lowEnumLimit'),
    );
    const highEnumLimit = schemaAnalyzer('properties', properties, {
      enumMinimumRowCount: 1000,
    }).then((result) =>
      expect(result).toMatchSnapshot('propertiesResult_highEnumLimit'),
    );
    const highNullableLimit = schemaAnalyzer('properties', properties, {
      nullableRowsThreshold: 0.25,
    }).then((result) =>
      expect(result).toMatchSnapshot('propertiesResult_highNullableLimit'),
    );
    const lowNullableLimit = schemaAnalyzer('properties', properties, {
      nullableRowsThreshold: 0,
    }).then((result) =>
      expect(result).toMatchSnapshot('propertiesResult_lowNullableLimit'),
    );
    const notStrict = schemaAnalyzer('properties', properties, {
      strictMatching: false,
    }).then((result) =>
      expect(result).toMatchSnapshot('propertiesResult_notStrict'),
    );
    return Promise.all([
      lowEnumLimitLoosePct,
      lowEnumLimitLoose,
      lowEnumLimit,
      highEnumLimit,
      highNullableLimit,
      lowNullableLimit,
      notStrict,
    ]);
  });
});

describe('progress api', () => {
  it('can run onProgress callback, until done', () => {
    const onProgress = jest.fn();
    return schemaAnalyzer(
      'users',
      userNotes,
      { strictMatching: false },
      onProgress,
    ).then((result) => {
      // const progMock = onProgress.mock.calls
      const mockRunCount = onProgress.mock.instances.length;
      // const lastCall = progMock[progMock.length - 1]
      expect(result.fields.name).toBeDefined();
      expect(mockRunCount).toBeGreaterThan(0);
    });
  });
});

describe('default options', () => {
  it('can run with default options', () => {
    return schemaAnalyzer('users', userNotes).then((result) => {
      expect(result.fields.name).toBeDefined();
    });
  });
});

describe('helper methods', () => {
  it('can flatten types', () => {
    return schemaAnalyzer('users', userNotes).then((analysis) => {
      const result = flattenTypes(analysis, {
        nullableRowsThreshold: 0.0001,
        targetValue: 'p99',
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
      });
      expect(result.fields.name?.nullable).toBeFalsy();
      expect(result.fields.name?.type).toBe('String');
      expect(result.fields.notes).toBeDefined();
      expect(result.fields?.notes?.typeRef).toBe('users.notes');
      expect(result.nestedTypes).toBeDefined();
      // @ts-ignore
      expect(result.nestedTypes['users.notes']).toBeDefined();
      // @ts-ignore
      expect(result.nestedTypes['users.notes'].fields.id.identity).toBeTruthy();
      expect(result).toMatchSnapshot('flattenedTypeInfo');
    });
  });
});

describe('utility & helper methods', () => {
  it('number range analysis handles invalid data', () => {
    // @ts-ignore
    expect(_getNumberRangeStats(null)).toBeUndefined();
  });

  it('parseDate handles invalid input', () => {
    // @ts-ignore
    expect(parseDate('Heyo')).toBeNull();
  });
});
