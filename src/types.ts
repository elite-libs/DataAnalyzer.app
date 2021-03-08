/* eslint-disable @typescript-eslint/no-redeclare */
export type TypeSummary<TFieldDetails = FieldInfo> = {
  schemaName: string;
  fields: KeyValPair<TFieldDetails>;
  totalRows: number;
  nestedTypes?: KeyValPair<TypeSummary<TFieldDetails>>;
};

export type DataAnalysisResults = TypeSummary<FieldInfo> & {
  flatTypeSummary: TypeSummary<CombinedFieldInfo>;
  // denseNestedTypes?: KeyValPair<TypeSummary<CombinedFieldInfo>>;
  denseNestedChanges?: ChangeFieldDescription[];
  debug?: boolean;
  options: ISchemaAnalyzerOptions;
};

export type TypeDescriptorName = 'enum' | 'nullable' | 'unique';
export type TypeNameString =
  | '$ref'
  | 'Unknown'
  | 'ObjectId'
  | 'UUID'
  | 'Boolean'
  | 'Date'
  | 'Timestamp'
  | 'Currency'
  | 'Float'
  | 'Number'
  | 'Email'
  | 'String'
  | 'Array'
  | 'Object'
  | 'Null';

export type TypeNameStringComposite = 'String' | 'Email' | 'Array';

export const TypeNameStringComposite = ['String', 'Email', 'Array'];
export const TypeNameStringDecimal = ['Date', 'Timestamp', 'Currency', 'Float', 'Number'];
export type TypeNameStringDecimal =
  | 'Date'
  | 'Timestamp'
  | 'Currency'
  | 'Float'
  | 'Number';

export interface ISchemaAnalyzerOptions {
  onProgress?: ProgressCallback | undefined;
  /** Required # of rows, default 100 */
  enumMinimumRowCount?: number | undefined;
  /** The maximum # unique enum values allowed before switching to `String` mode. For US States, 50 or so would be appropriate. Default 5. */
  enumAbsoluteLimit?: number | undefined;

  /** Percent of empty records indicating field is still non-null. (Error tolerance for bad data.) Default: 0.001 */
  nullableRowsThreshold?: number | undefined;
  /** */
  uniqueRowsThreshold?: number | undefined;
  /** Match multiple (possibly overlapping) types. For example, `dan@danlevy.net` is both a `String` and an `Email`. */
  strictMatching?: boolean | undefined;
  /** Nested object arrays will return sub-type info by default. */
  disableNestedTypes?: boolean | undefined;
  /** for debugging */
  debug?: boolean;
  consolidateTypes?: IConsolidateTypesOptions['consolidateTypes'];
  flattenOptions?: IFlattenTypesOptions;
  prefixNamingMode?: INamingOptions['prefixNamingMode'];
}
export interface INamingOptions {
  prefixNamingMode?: 'full' | 'trim';
  removePrefixStrings?: string[];
}
export interface IConsolidateTypesOptions {
  /** `consolidateTypes` is a flag/mode to indicate the shape matching behavior. */
  consolidateTypes?: '' | 'field-names' | 'field-names-and-type';
  // limitCompositeTypeNames?: 0 | 1 | 2 | 3 | 4 | 5;
}

export type TypedFieldObject<T> = {
  $ref?: T | undefined;
  Unknown?: T | undefined;
  ObjectId?: T | undefined;
  UUID?: T | undefined;
  Boolean?: T | undefined;
  Date?: T | undefined;
  Timestamp?: T | undefined;
  Currency?: T | undefined;
  Float?: T | undefined;
  Number?: T | undefined;
  Email?: T | undefined;
  String?: T | undefined;
  Array?: T | undefined;
  Object?: T | undefined;
  Null?: T | undefined;
};

/**
 * Details about a field, including potential types discovered.
 * The `types` object will have a `$ref` key if any nested data types were found.
 * See the `nestedTypes` on `TypeSummary`.
 */
export type FieldInfo = {
  identity?: boolean;
  /** field stats organized by type */
  types: TypedFieldObject<FieldTypeSummary>;
  /** is the field nullable */
  nullable?: boolean;
  nullCount?: number;
  /** is the field unique */
  unique?: boolean;
  uniqueCount?: number;
  /** enumeration detected, the values are listed on this property. */
  enum?: string[] | number[] | undefined;
};

/**
 * Similar to FieldInfo, SimpleFieldInfo omits stats & extra types.
 *
 * This provides a simpler structure for traversing and generating code.
 */
export type SimpleFieldInfo = {
  /** field stats organized by type */
  type: TypeNameString;
  /** Should contain any $ref keys */
  typeRef?: string;
  typeRelationship?: 'one-to-one' | 'one-to-many';
  /** indicates unique identifier or primary key */
  identity?: boolean;
  /** is the field nullable */
  nullable?: boolean;
  /** is the field unique */
  unique?: boolean;
  /** enumeration detected, the values are listed on this property. */
  enum?: string[] | number[] | null;

  /** represents a specific value from a numeric set (min, max, mean, median, p50, p99, etc.) */
  value?: number;

  count: number;
};

export type NumericFieldInfo = SimpleFieldInfo & {
  type: 'Date' | 'Timestamp' | 'Currency' | 'Float' | 'Number';
  scale: number;
  precision: number;
};

export type ScalarFieldInfo = SimpleFieldInfo & {
  type: 'String' | 'Email' | 'Array';
  length: number;
};

export type CombinedFieldInfo = NumericFieldInfo | ScalarFieldInfo | SimpleFieldInfo;

/**
 * Contains stats for a given field's (potential) type.
 *
 * TODO: Add string property for the type name.
 *    We currently uses object key structure: {"String": FieldTypeSummary}
 */
export type FieldTypeSummary = {
  /** Used to indicate a non-array nested type (one-to-one relationship) */
  typeRelationship?: 'one-to-one' | 'one-to-many';
  /** for nested type support. */
  typeAlias?: string | TypeNameString;
  /** extracted field values, placed into an array. This simplifies (at expense of memory) type analysis and summarization when creating the `AggregateSummary`. */
  value?: AggregateSummary | number;
  /** summary of array of string (or decimal) sizes, pre processing into an AggregateSummary */
  length?: AggregateSummary;
  /** only applies to Float types. Summary of array of sizes of the value both before and after the decimal. */
  precision?: AggregateSummary;
  /** only applies to Float types. Summary of array of sizes of the value after the decimal. */
  scale?: AggregateSummary;
  /** if enum rules were triggered will contain the detected unique values. */
  enum?: string[] | number[];
  /** number of times the type was matched */
  count: number;
  /** absolute priority of the detected TypeName, defined in the object `typeRankings` */
  // rank: number
};
/**
 * This is an internal intermediate structure.
 * It mirrors the `FieldSummary` type it will become.
 */
export type InternalFieldTypeData = {
  /** Used to indicate a non-array nested type (one-to-one relationship) */
  typeRelationship?: 'one-to-one' | 'one-to-many';
  /** for nested type support. */
  typeAlias?: string | undefined;
  /** array of values, pre processing into an AggregateSummary */
  value?: any[] | undefined;
  /** array of string (or decimal) sizes, pre processing into an AggregateSummary */
  length?: number[] | undefined;
  /** only applies to Float types. Array of sizes of the value both before and after the decimal. */
  precision?: number[] | undefined;
  /** only applies to Float types. Array of sizes of the value after the decimal. */
  scale?: number[] | undefined;
  /** number of times the type was matched */
  count?: number | undefined;
  /** absolute priority of the detected TypeName, defined in the object `typeRankings` */
  // rank?: number | undefined
};
/**
 * Used to represent a number series of any size.
 * Includes the lowest (`min`), highest (`max`), mean/average (`mean`) and measurements at certain `percentiles`.
 */
export type AggregateSummary<T = number> = {
  min: T | undefined;
  max: T | undefined;
  mean: T | undefined;
  p25: T | undefined;
  p33: T | undefined;
  p50: T | undefined;
  p66: T | undefined;
  p75: T | undefined;
  p99: T | undefined;
};
/**
 * This callback is displayed as a global member.
 */
export type ProgressCallback = (progress: {
  totalRows: number;
  currentRow: number;
  nestedTypes?: string[];
}) => any;

export interface IConsolidateTypesResults {
  nestedTypes: KeyValPair<TypeSummary<CombinedFieldInfo>>;
  changes: ChangeFieldDescription[];
}
export interface ChangeFieldDescription {
  alias: string;
  shape: string;
  targetTypes: string[];
}

export interface Dictionary<T> {
  [id: string]: T | undefined | null;
  [id: number]: T | undefined | null;
}

export type CallbackFn<TArgs, TReturn = void> = (args?: TArgs | any) => TReturn | any;

export interface KeyValPair<TValue> {
  [id: string]: TValue;
}

export type SupportedTargetLanguages = 'typescript' | 'go' | 'json' | 'javascript';

export type TypeNameSuggestion = {
  readonly typePaths: string[];
  shape: string;
  shapeBasedName: string | null;
  prefixMatches: Array<string | null>;
  suffixMatches: Array<string | null>;
  pathSplitByLastCommonSubstring: string[] | null;
  // trailing string matches
  exactMatches: {
    lastCommonKey?: null | string;
    nextToLastCommonKey?: null | string;
  };

  setOperations: {
    // uses lodash.intersection
    intersection: null | string;
    difference?: string[];
    union: null | string;
    xor: null | string;
  };

  alternatePrefixes: null | {
    initials: null | string;
    abbreviated: null | string;
    truncated: null | string;
  };
};

export interface IFlattenTypesOptions {
  /** Percent of empty records indicating field is still non-null. (Error tolerance for bad data.) Default: 0.001 */
  nullableRowsThreshold: number;
  targetLength: keyof AggregateSummary;
  targetScale: keyof AggregateSummary;
  targetPrecision: keyof AggregateSummary;
  targetValue: keyof AggregateSummary;
}
