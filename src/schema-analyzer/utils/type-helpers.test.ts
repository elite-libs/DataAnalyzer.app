import {
  detectTypes,
  TYPE_UNKNOWN,
  TYPE_OBJECT_ID,
  TYPE_UUID,
  TYPE_BOOLEAN,
  TYPE_DATE,
  TYPE_TIMESTAMP,
  TYPE_CURRENCY,
  TYPE_FLOAT,
  TYPE_NUMBER,
  TYPE_NULL,
  TYPE_EMAIL,
  TYPE_STRING,
  TYPE_ARRAY,
  TYPE_OBJECT,
} from './type-helpers';

describe('Multiple Type Matching', () => {
  it('correctly handles numeric zero w/ exact match', () => {
    const matchResult = detectTypes('0', true);
    expect(matchResult).toContain('Number');
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles numeric zero', () => {
    const matchResult = detectTypes('0', false);
    expect(matchResult).toContain('Number');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(2);
  });
  it('correctly handles ambiguous value(s)', () => {
    const matchResult = detectTypes('');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles Object ID', () => {
    const matchResult = detectTypes('45cbc4a0e4123f6920000002');
    expect(matchResult).toContain('ObjectId');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(2);
  });
  it('correctly handles UUID', () => {
    const matchResult = detectTypes('AB0E1569-B8A1-430F-94BE-B03E5C73FA22');
    expect(matchResult).toContain('UUID');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(2);
  });
  it('correctly handles boolean', () => {
    let matchResult = detectTypes(true);
    expect(matchResult).toContain('Boolean');
    expect(matchResult.length).toBe(1);
    matchResult = detectTypes('true');
    expect(matchResult).toContain('Boolean');
    expect(matchResult.length).toBe(2);
  });
  it('correctly handles dates', () => {
    const matchResult = detectTypes('2020-06-12T02:49:23.473Z', true);
    expect(matchResult).toContain('Date');
    let notADateResult = detectTypes(5266);
    expect(notADateResult).not.toContain('Date');
    expect(notADateResult.length).toBe(1);
  });
  it('correctly handles timestamps', () => {
    let matchResult = detectTypes(1579994163473);
    expect(matchResult).toContain('Timestamp');
    expect(matchResult).toContain('Number');
    expect(matchResult.length).toBe(2);
    matchResult = detectTypes('1579994163473');
    expect(matchResult).toContain('Timestamp');
    expect(matchResult).toContain('String');
    expect(matchResult).toContain('Number');
    expect(matchResult.length).toBe(3);
  });
  it('correctly handles currency', () => {
    const matchResult = detectTypes('$420.42', true);
    expect(matchResult).toContain('Currency');
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles float', () => {
    let matchResult = detectTypes(4.2, true);
    expect(matchResult).toContain('Float');
    expect(matchResult.length).toBe(1);
    matchResult = detectTypes('4.20', true);
    expect(matchResult).toEqual(['Float']);
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles number', () => {
    let matchResult = detectTypes('42');
    expect(matchResult).toContain('Number');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(2);
    matchResult = detectTypes(42);
    expect(matchResult).toContain('Number');
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles null', () => {
    const matchResult = detectTypes('null');
    expect(matchResult).toContain('Null');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(2);
  });
  it('correctly handles email', () => {
    const matchResult = detectTypes('a@example.com');
    expect(matchResult).toEqual(['Email', 'String']);
    expect(matchResult.length).toBe(2);
  });
  it('correctly handles string', () => {
    const matchResult = detectTypes('🚀');
    expect(matchResult).toContain('String');
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles array', () => {
    const matchResult = detectTypes([4, 2, 0]);
    expect(matchResult).toContain('Array');
    expect(matchResult.length).toBe(1);
  });
  it('correctly handles object', () => {
    const matchResult = detectTypes({ oh: 'noes!' });
    expect(matchResult).toContain('Object');
    expect(matchResult.length).toBe(1);
  });
});

describe('Type Detectors', () => {
  it('can detect ambiguous data', () => {
    expect(TYPE_UNKNOWN.check('')).toBe(false);
    expect(TYPE_UNKNOWN.check('undefined')).toBe(true);
    expect(TYPE_UNKNOWN.check(undefined)).toBe(true);
    expect(TYPE_UNKNOWN.check(null)).toBe(false);
  });
  it("can detect objectId's", () => {
    expect(TYPE_OBJECT_ID.check('112345679065574883030833')).toBe(true);
    expect(TYPE_OBJECT_ID.check('FFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    expect(TYPE_OBJECT_ID.check('45cbc4a0e4123f6920000002')).toBe(true);
    expect(TYPE_OBJECT_ID.check('45cbc4a0e4123f6920')).toBe(false);
  });

  it('can detect UUID strings', () => {
    expect(TYPE_UUID.check('AB0E1569-B8A1-430F-94BE-B03E5C73FA22')).toBe(true);
    expect(TYPE_UUID.check('60CFE5A5-D301-45B1-BC0D-0D9720AD19CD')).toBe(true);
    expect(TYPE_UUID.check('60CFE5A5-D301-45B1-0D9720AD19CD')).toBe(false);
    expect(TYPE_UUID.check('60CFE5A5D30145B1BC0D0D9720AD19CD')).toBe(false);
  });
  it('can detect boolean', () => {
    expect(TYPE_BOOLEAN.check('true')).toBe(true);
    expect(TYPE_BOOLEAN.check('false')).toBe(true);
    expect(TYPE_BOOLEAN.check(true)).toBe(true);
    expect(TYPE_BOOLEAN.check('FALSE')).toBe(true);
  });
  it('can detect date', () => {
    expect(TYPE_DATE.check(new Date())).toBe(true);
    expect(TYPE_DATE.check('2083-06-12T02:49:23.473Z')).toBe(true);
    expect(TYPE_DATE.check('2020-06-12T02:49:23.473Z')).toBe(true);
    expect(TYPE_DATE.check('2000-01-01')).toBe(true);
    expect(TYPE_DATE.check('2000-01-99')).toBe(false);
    expect(TYPE_DATE.check(5266)).toBe(false);
  });
  it('can detect timestamp', () => {
    expect(TYPE_TIMESTAMP.check(5266)).toBe(false);
    expect(TYPE_TIMESTAMP.check(1579994163473)).toBe(true);
    expect(TYPE_TIMESTAMP.check(2579994163473)).toBe(true);
    expect(TYPE_TIMESTAMP.check('1579994163473')).toBe(true);
    expect(TYPE_TIMESTAMP.check('9999999993473')).toBe(false);
    expect(TYPE_TIMESTAMP.check('999999999473')).toBe(false);
    expect(TYPE_TIMESTAMP.check('99999999993473')).toBe(false);
  });
  it('can detect currency', () => {
    expect(TYPE_CURRENCY.check('$1')).toBeTruthy();
    expect(TYPE_CURRENCY.check('€500')).toBeTruthy();
    expect(TYPE_CURRENCY.check('¥9999')).toBeTruthy();
    expect(TYPE_CURRENCY.check('500€')).toBeTruthy();
    expect(TYPE_CURRENCY.check('9999 ¥')).toBeTruthy();
    expect(TYPE_CURRENCY.check('$1.00')).toBeTruthy();
    expect(TYPE_CURRENCY.check('$1,00')).toBeTruthy();
    expect(TYPE_CURRENCY.check('$42,000,000')).toBeTruthy();
    expect(TYPE_CURRENCY.check(null)).toBeFalsy();
    expect(TYPE_CURRENCY.check('1')).toBeFalsy();
    expect(TYPE_CURRENCY.check('500')).toBeFalsy();
    expect(TYPE_CURRENCY.check('9999')).toBeFalsy();
    expect(TYPE_CURRENCY.check('1.00')).toBeFalsy();
  });
  it('can detect float', () => {
    expect(TYPE_FLOAT.check(null)).toBeFalsy();
    expect(TYPE_FLOAT.check('1.1')).toBeTruthy();
    expect(TYPE_FLOAT.check('1.1234567890')).toBeTruthy();
    expect(TYPE_FLOAT.check('-1.10000')).toBeTruthy();
    expect(TYPE_FLOAT.check(42.1)).toBeTruthy();
    expect(TYPE_FLOAT.check(42)).toBeFalsy();
    expect(TYPE_FLOAT.check(Infinity)).toBeFalsy();
  });
  it('can detect number', () => {
    expect(TYPE_NUMBER.check('42')).toBeTruthy();
    expect(TYPE_NUMBER.check('1.1')).toBeTruthy();
    expect(TYPE_NUMBER.check('1.1234567890')).toBeTruthy();
    expect(TYPE_NUMBER.check('-1.10000')).toBeTruthy();
    expect(TYPE_NUMBER.check(null)).toBeFalsy();
  });
  it('can detect null', () => {
    expect(TYPE_NULL.check(null)).toBeTruthy();
    expect(TYPE_NULL.check('NULL')).toBeTruthy();
    expect(TYPE_NULL.check('null')).toBeTruthy();
    expect(TYPE_NULL.check('nil')).toBeFalsy();
    expect(TYPE_NULL.check('NIL')).toBeFalsy();
    expect(TYPE_NULL.check('Nope')).toBeFalsy();
  });
  it('can detect email address', () => {
    expect(TYPE_EMAIL.check('a@example.com')).toBeTruthy();
    expect(TYPE_EMAIL.check('a@example.com.')).toBeFalsy();
    expect(TYPE_EMAIL.check('a@example..com')).toBeFalsy();
  });
  it('can detect string', () => {
    expect(TYPE_STRING.check('abc')).toBeTruthy();
    expect(TYPE_STRING.check('123')).toBeTruthy();
    expect(TYPE_STRING.check('TEST')).toBeTruthy();
    expect(TYPE_STRING.check('')).toBeTruthy(); // too little entropy data
    expect(TYPE_STRING.check(42)).toBeFalsy(); // too little entropy data
  });
  it('can detect array', () => {
    expect(TYPE_ARRAY.check([''])).toBeTruthy();
    expect(TYPE_ARRAY.check(['', 123])).toBeTruthy();
    expect(TYPE_ARRAY.check({})).toBeFalsy();
  });
  it('can detect object', () => {
    expect(TYPE_OBJECT.check({})).toBeTruthy();
    expect(TYPE_OBJECT.check({ goat: [] })).toBeTruthy();
    expect(TYPE_OBJECT.check([])).toBeFalsy();
    expect(TYPE_OBJECT.check(null)).toBeFalsy();
  });
});
