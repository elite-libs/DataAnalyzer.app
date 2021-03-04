import {
  isBoolish,
  isCurrency,
  isDateString,
  isEmailShaped,
  isFloatish,
  isNullish,
  isNumeric,
  isObjectId,
  isTimestamp,
  isUuid,
} from './type-detectors';
import { FieldInfo, TypeDescriptorName, TypeNameString } from '../../types';

const hasLeadingZero = /^0+\d/;

export interface ITypeMatcher {
  type: TypeNameString;
  check: (value: any, fieldName?: string) => boolean | void | undefined;
  supersedes?: TypeNameString[];
}

export interface IAdvancedTypeMatcher {
  type: TypeDescriptorName;
  check: (
    value: FieldInfo,
    state: IProcessState<any>,
    options: IAdvancedMatcherOptions,
  ) => FieldInfo;
  matchBasicTypes?: TypeNameString[];
}

export interface IProcessState<T> {
  rowCount: number;
  uniques: T[];
}

export type IAdvancedMatcherOptions = Partial<
  IAdvancedMatcherOptionsEnum &
    IAdvancedMatcherOptionsUnique &
    IAdvancedMatcherOptionsNullable
>;
export type IAdvancedMatcherOptionsEnum = {
  /** the maximum # unique enum values allowed before switching to `String` mode. For US States, 50 or so would be appropriate. */
  enumAbsoluteLimit: number;
  // enumPercentThreshold: number
  enumMinimumRowCount: number;
};
export type IAdvancedMatcherOptionsUnique = {
  uniqueRowsThreshold: number;
};
export type IAdvancedMatcherOptionsNullable = {
  nullableRowsThreshold: number;
};

/**
 * Returns an array of TypeName.
 */
function detectTypes(value: any, strictMatching = false) {
  const excludedTypes: TypeNameString[] = [];
  const matchedTypes = prioritizedTypes.reduce(
    (types: TypeNameString[], typeHelper) => {
      if (typeHelper.check(value)) {
        if (typeHelper.supersedes) excludedTypes.push(...typeHelper.supersedes);
        types.push(typeHelper.type);
      }
      return types;
    },
    [],
  );
  return strictMatching ? [matchedTypes[0]] : matchedTypes;
  // : matchedTypes.filter((type) => excludedTypes.indexOf(type) === -1);
}

/**
 * MetaChecks are used to analyze the intermediate results, after the Basic (discreet) type checks are complete.
 * They have access to all the data points before it is finally processed.
 */
const TYPE_ENUM: IAdvancedTypeMatcher = {
  type: 'enum',
  matchBasicTypes: ['String', 'Number'],
  /**
   *
   * @param typeInfo
   * @param {IProcessState} jobState
   * @param {IAdvancedMatcherOptions} matcherOptions Defaults: `enumAbsoluteLimit = 20` `enumPercentThreshold = 0.9`
   */
  check: (
    typeInfo,
    { rowCount, uniques },
    { enumAbsoluteLimit = 5, enumMinimumRowCount = 100 },
  ) => {
    if (rowCount < enumMinimumRowCount) return typeInfo;
    if (!uniques || uniques.length === 0) return typeInfo;
    // TODO: calculate uniqueness using ALL uniques combined from ALL types, this only sees consistently typed data
    if (uniques.length <= enumAbsoluteLimit)
      return { ...typeInfo, enum: uniques };

    return typeInfo;
    // TODO: calculate entropy using a sum of all non-null detected types, not just typeCount
  },
};
const TYPE_NULLABLE: IAdvancedTypeMatcher = {
  type: 'nullable',
  // matchBasicTypes: ['String', 'Number'],
  check: (typeInfo, { rowCount, uniques }, { nullableRowsThreshold }) => {
    if (!uniques || uniques.length === 0) return typeInfo;
    let nullishTypeCount = typeInfo.nullCount || 0;
    // if (typeInfo && typeInfo.types && typeInfo.types.Null) console.warn('Unexpected type info structure! (.types. key!)');

    if (typeInfo.types.Null) {
      nullishTypeCount += typeInfo.types.Null.count;
    }
    // if (typeInfo?.types.Unknown) nullishTypeCount += typeInfo?.types?.Unknown?.count || 0

    const nullLimit = nullableRowsThreshold
      ? rowCount * nullableRowsThreshold
      : 0;
    const isNullable = nullishTypeCount > 0 && nullishTypeCount >= nullLimit;
    // TODO: Look into specifically checking 'Null' or 'Unknown' type stats
    return { ...typeInfo, nullable: isNullable, nullCount: nullishTypeCount };
    // TODO: calculate entropy using a sum of all non-null detected types, not just typeCount
  },
};
const TYPE_UNIQUE: IAdvancedTypeMatcher = {
  type: 'unique',
  // matchBasicTypes: ['String', 'Number'],
  check: (typeInfo, { rowCount, uniques }, { uniqueRowsThreshold = 0.99 }) => {
    if (!uniques || uniques.length === 0) return typeInfo;
    // const uniqueness = rowCount / uniques.length
    const isUnique = uniques.length >= rowCount * uniqueRowsThreshold!;
    // TODO: Look into specifically checking 'Null' or 'Unknown' type stats
    return { ...typeInfo, unique: isUnique, uniqueCount: uniques.length };
    // return {unique: uniqueness >= uniqueRowsThreshold, ...typeInfo}
    // TODO: calculate entropy using a sum of all non-null detected types, not just typeCount
  },
};

const MetaChecks = {
  TYPE_UNIQUE,
  TYPE_ENUM,
  TYPE_NULLABLE,
};
// Basic Type Filters - rudimentary data sniffing used to tally up "votes" for a given field
/**
 * Detect ambiguous field type.
 * Will not affect weighted field analysis.
 */
const TYPE_UNKNOWN: ITypeMatcher = {
  type: 'Unknown',
  check: (value) => value === undefined || value === 'undefined',
};
const TYPE_OBJECT_ID: ITypeMatcher = {
  type: 'ObjectId',
  supersedes: ['String'],
  check: isObjectId,
};
const TYPE_UUID: ITypeMatcher = {
  type: 'UUID',
  supersedes: ['String'],
  check: isUuid,
};
const TYPE_BOOLEAN: ITypeMatcher = {
  type: 'Boolean',
  supersedes: ['String'],
  check: isBoolish,
};
const TYPE_DATE: ITypeMatcher = {
  type: 'Date',
  supersedes: ['String'],
  check: isDateString,
};
const TYPE_TIMESTAMP: ITypeMatcher = {
  type: 'Timestamp',
  supersedes: ['String', 'Number'],
  check: isTimestamp,
};
const TYPE_CURRENCY: ITypeMatcher = {
  type: 'Currency',
  supersedes: ['String', 'Number'],
  check: isCurrency,
};
const TYPE_FLOAT: ITypeMatcher = {
  type: 'Float',
  supersedes: ['String', 'Number'],
  check: isFloatish,
};
const TYPE_NUMBER: ITypeMatcher = {
  type: 'Number',
  check: (value, fieldName) => {
    if (hasLeadingZero.test(String(value))) return false;
    return !!(
      value !== null &&
      !Array.isArray(value) &&
      (Number.isInteger(value) || isNumeric(value, fieldName))
    );
  },
};
const TYPE_EMAIL: ITypeMatcher = {
  type: 'Email',
  supersedes: ['String'],
  check: isEmailShaped,
};
const TYPE_STRING: ITypeMatcher = {
  type: 'String',
  check: (value) => typeof value === 'string', // && value.length >= 1
};
const TYPE_ARRAY: ITypeMatcher = {
  type: 'Array',
  check: (value) => {
    return Array.isArray(value);
  },
};
const TYPE_OBJECT: ITypeMatcher = {
  type: 'Object',
  check: (value) => {
    return !Array.isArray(value) && value != null && typeof value === 'object';
  },
};
const TYPE_NULL: ITypeMatcher = {
  type: 'Null',
  check: isNullish,
};

const prioritizedTypes = [
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
];

/**
 * Type Rank Map: Use to sort Lowest to Highest
 */
const typeRankings = {
  [TYPE_UNKNOWN.type]: -1,
  [TYPE_OBJECT_ID.type]: 1,
  [TYPE_UUID.type]: 2,
  [TYPE_BOOLEAN.type]: 3,
  [TYPE_DATE.type]: 4,
  [TYPE_TIMESTAMP.type]: 5,
  [TYPE_CURRENCY.type]: 6,
  [TYPE_FLOAT.type]: 7,
  [TYPE_NUMBER.type]: 8,
  [TYPE_NULL.type]: 10,
  [TYPE_EMAIL.type]: 11,
  [TYPE_STRING.type]: 12,
  [TYPE_ARRAY.type]: 13,
  [TYPE_OBJECT.type]: 14,
};

export {
  typeRankings,
  prioritizedTypes,
  detectTypes,
  MetaChecks,
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
};
// const TYPE_ENUM = {
//   type: "String",
//   check: (value, fieldInfo, schemaInfo) => {
//     // Threshold set to 5% - 5 (or fewer) out of 100 unique strings should enable 'enum' mode
//     if (schemaInfo.inputRowCount < 100) return false; // disabled if set too small
//   }
// };
