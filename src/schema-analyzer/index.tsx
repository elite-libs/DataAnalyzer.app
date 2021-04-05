/* eslint-disable @typescript-eslint/no-redeclare */
// import debug from 'debug'
import { detectTypes, MetaChecks } from './utils/type-helpers';
import * as helpers from './utils/helpers';
import type {
  KeyValPair,
  ISchemaAnalyzerOptions,
  DataAnalysisResults,
  FieldInfo,
  TypeSummary,
  TypedFieldObject,
  FieldTypeSummary,
  TypeNameString,
  InternalFieldTypeData,
  AggregateSummary,
  IConsolidateTypesResults,
  INamingOptions,
  ProgressCallback,
} from '../types';
import { consolidateNestedTypes } from './utils/consolidate-nested-types';
import fromPairs from 'lodash/fromPairs';
import mapValues from 'lodash/mapValues';
export { helpers, consolidateNestedTypes };

// const log = debug('schema-builder:main')

// export { schemaAnalyzer, pivotFieldDataByType, getNumberRangeStats, isValidDate }

function isValidDate(date: string | Date | any): false | Date {
  date = date instanceof Date ? date : new Date(date);
  return isNaN(date.getFullYear()) ? false : date;
}

export const parseDate = (date: string | Date | any): string | null => {
  date = isValidDate(date);
  if (date instanceof Date) return date.toISOString();
  return null;
};

const { TYPE_ENUM, TYPE_NULLABLE, TYPE_UNIQUE } = MetaChecks;
/**
 * Returns a fieldName keyed-object with type detection summary data.
 *
 * ### Example `typeSummary.fields`:
 * ```
 * {
 *  "id": {
 *    "UUID": {
 *      "count": 25
 *    },
 *    "Number": {
 *      "count": 1,
 *      "value": { "min": 9, "mean": 9, "max": 9, "p25": 9, "p33": 9, "p50": 9, "p66": 9, "p75": 9, "p99": 9 }
 *    }
 *  }
 * }
 * ```
 */
function schemaAnalyzer(
  schemaName: string,
  input: any[] | { [k: string]: any },
  options: ISchemaAnalyzerOptions | undefined = {
    strictMatching: true,
    disableNestedTypes: false,
    enumMinimumRowCount: 100,
    enumAbsoluteLimit: 5,
    // enumPercentThreshold: 0.01,
    nullableRowsThreshold: 0.001,
    uniqueRowsThreshold: 0.99,
    flattenOptions: {
      nullableRowsThreshold: 0.0001,
      targetValue: 'p99',
      targetLength: 'p99',
      targetPrecision: 'p99',
      targetScale: 'p99',
    },
  },
  onProgress?: ProgressCallback | undefined,
  // _nestedData?: { [key: string]: unknown },
): Promise<DataAnalysisResults> {
  if (!schemaName || schemaName.length < 1)
    return Promise.reject(Error('A SchemaName must be provided.'));
  return _schemaAnalyzer(schemaName, input, options, onProgress)
    .then((nestedSchemaTypes) => {
      const schemaWithUnpackedData = extractNestedTypes(nestedSchemaTypes);
      schemaWithUnpackedData.nestedTypes = mapValues(
        schemaWithUnpackedData.nestedTypes,
        checkAndDeleteDeeplyNestedTypes,
      );
      return schemaWithUnpackedData;
    })
    .then((typeSummary) => {
      let condensedResults: IConsolidateTypesResults | null = null;

      const flatTypeSummary = helpers.flattenTypes(
        typeSummary,
        options.flattenOptions,
      );
      // flatTypeSummary.nestedTypes = typeSummary.nestedTypes
      if (
        options.consolidateTypes &&
        options.consolidateTypes.length > 0 &&
        flatTypeSummary.nestedTypes
      ) {
        condensedResults = consolidateNestedTypes(
          flatTypeSummary.nestedTypes,
          options,
        );
        flatTypeSummary.nestedTypes = condensedResults.nestedTypes;
      }

      return {
        ...typeSummary,
        flatTypeSummary,
        // denseNestedTypes: condensedResults
        //   ? condensedResults.nestedTypes
        //   : undefined,
        renamedTypes: condensedResults
          ? condensedResults.typeNameMap
          : undefined,
        debug: options.debug,
        options,
      };
    });
}

function _schemaAnalyzer(
  schemaName: string,
  input: any[] | { [k: string]: any },
  options: ISchemaAnalyzerOptions,
  onProgress?: ProgressCallback | undefined,
): Promise<TypeSummary<FieldInfo>> {
  if (!input) throw Error('Input Data must be an Object or Array of Objects');
  if (!Array.isArray(input) && typeof input !== 'object')
    throw Error('Input Data must be an Object or Array of Objects');
  // Auto wrap array
  if (!Array.isArray(input)) input = [input];
  if (input.length < 1) throw Error('1 record required. 100+ recommended.');
  if (typeof input[0] !== 'object')
    throw Error('Input Data must be an Array of Objects');
  const {
    strictMatching = true,
    disableNestedTypes = false,
    enumMinimumRowCount = 25,
    enumAbsoluteLimit = 10,
    prefixNamingMode = 'full',
    // // enumPercentThreshold = 0.01,
    // nullableRowsThreshold = 0.001,
  } = options;
  const isEnumEnabled = input.length >= enumMinimumRowCount;
  // #debug: log`isEnumEnabled: ${isEnumEnabled}`)
  const nestedData = {};

  const pivotRowsGroupedByType = _pivotRowsGroupedByType({
    schemaName,
    isEnumEnabled,
    disableNestedTypes,
    prefixNamingMode,
    nestedData,
    strictMatching,
    onProgress,
  });

  // #debug: log`Processing '${schemaName}', found ${input.length} rows...`)
  return (
    Promise.resolve(input)
      // @ts-ignore
      .then(pivotRowsGroupedByType)
      // .then((result) => {
      //   // console.log(result);
      //   return result;
      // })
      .then(condenseFieldData({ enumAbsoluteLimit, isEnumEnabled }))
      .then(async (schema) => {
        // #debug//log('Built summary from Field Type data.')
        // console.log('Schema', JSON.stringify(schema, null, 2))

        const fields = Object.keys(schema.fields).reduce(
          (fieldTypesResults, fieldName) => {
            const typesInfo = schema.fields[fieldName]!.types;
            const jobState = {
              rowCount: input.length,
              uniques: schema.uniques[fieldName] ?? [],
            };
            let f = schema.fields[fieldName]!;

            let fInfo: FieldInfo = {
              identity: f.identity || false,
              types: f.types!,
              enum: f.enum,
              nullable: f.nullable,
              nullCount: f.nullCount || 0,
              unique: f.unique,
              uniqueCount: f.uniqueCount || 0,
            };

            fInfo = TYPE_ENUM.check(fInfo, jobState, options);
            fInfo = TYPE_NULLABLE.check(fInfo, jobState, options);
            fInfo = TYPE_UNIQUE.check(fInfo, jobState, options);

            const isIdentity =
              (typesInfo.Number || typesInfo.UUID || typesInfo.ObjectId) &&
              /^(gu|uu|_)?id/i.test(fieldName);

            if (isIdentity && (!fInfo.unique || fInfo.nullable)) {
              // TODO: Verify uniqueness & totalRow checks are coming out correct.
              // console.warn(
              //   options.uniqueRowsThreshold,
              //   jobState.rowCount,
              //   jobState.uniques.length,
              //   input.length,
              //   fieldName,
              //   fInfo,
              // );
            }
            if (isIdentity) fInfo.identity = true;

            if (schema.uniques && schema.uniques[fieldName]) {
              fInfo.uniqueCount = schema.uniques[fieldName]!.length;
              fInfo.unique = fInfo.uniqueCount === jobState.rowCount;
            }

            fieldTypesResults[fieldName] = fInfo;

            return fieldTypesResults;
          },
          {} as { [fieldName: string]: FieldInfo },
        );

        return {
          schemaName,
          fields,
          totalRows: schema.totalRows,
          nestedTypes: disableNestedTypes
            ? undefined
            : await nestedSchemaAnalyzer(nestedData),
        };
      })
  );

  function nestedSchemaAnalyzer(nestedData: { [s: string]: any[] }) {
    return Promise.all(
      Object.entries(nestedData).map(([fullTypeName, data]) => {
        // const nameParts = fullTypeName.split('.');
        // const nameSuffix = nameParts[nameParts.length - 1];

        return _schemaAnalyzer(fullTypeName!, data, options).then((result): [
          string,
          TypeSummary<FieldInfo>,
        ] => [fullTypeName, result]);
      }),
    ).then((resultPairs) => {
      return fromPairs(resultPairs);
    });
  }
}

/**
 * @//returns {{ totalRows: number; uniques: { [x: string]: any[]; }; fieldsData: { [x: string]: InternalFieldTypeData[]; }; }} schema
 */
const _pivotRowsGroupedByType = ({
  schemaName,
  isEnumEnabled,
  disableNestedTypes,
  prefixNamingMode,
  nestedData,
  strictMatching,
  onProgress,
}: {
  schemaName: string;
  isEnumEnabled: boolean;
  disableNestedTypes: boolean;
  prefixNamingMode: INamingOptions['prefixNamingMode'];
  nestedData: KeyValPair<unknown[]>;
  strictMatching: boolean;
  onProgress?: ProgressCallback;
}) =>
  function pivotRowsGroupedByType(docs: any[]) {
    const detectedSchema = {
      uniques: isEnumEnabled ? {} : null,
      fieldsData: {},
      totalRows: null,
    };
    // #debug: log`  About to examine every row & cell. Found ${docs.length} records...`)
    const pivotedSchema = docs.reduce(function evaluateSchemaLevel(
      schema: {
        totalRows: number;
        uniques: { [x: string]: any[] };
        fieldsData: { [x: string]: TypedFieldObject<FieldTypeSummary>[] };
      },
      row: { [x: string]: any },
      index: number,
      array: string | any[],
    ) {
      // eslint-disable-line
      schema.totalRows = schema.totalRows || array.length;
      schema.uniques = schema.uniques || {};
      const fieldNames: string[] = Object.keys(row || {});
      // #debug: log
      //   `Processing Row # ${index + 1}/${
      //     schema.totalRows
      //   } {isEnumEnabled: ${isEnumEnabled}, disableNestedTypes: ${disableNestedTypes}}`,
      // )
      // #debug: log`Found ${fieldNames.length} Column(s)!`)
      fieldNames.forEach((fieldName, index) => {
        const value = row[fieldName];
        const typeFingerprint = getFieldMetadata({ value, strictMatching });
        const typeNames = Object.keys(typeFingerprint) as TypeNameString[];
        const isPossibleEnumOrUniqueType =
          typeNames.includes('Number') ||
          typeNames.includes('String') ||
          typeNames.includes('UUID') ||
          typeNames.includes('ObjectId');

        const isObjectArray =
          Array.isArray(value) &&
          value.length >= 1 &&
          typeof value[0] === 'object';
        const isObjectWithKeys =
          !Array.isArray(value) &&
          value != null &&
          typeof value === 'object' &&
          Object.keys(value).length >= 1;

        if (!disableNestedTypes) {
          // TODO: Review hack pattern here (buffers too much, better association of custom types, see `$ref`)
          // Steps: 1. Check if Array of Objects, 2. Add to local `nestedData` to hold data for post-processing.
          if (isObjectArray || isObjectWithKeys) {
            const keyPath = `${
              prefixNamingMode === 'full' ? `${schemaName}.` : ''
            }${fieldName}`;
            nestedData[keyPath] = nestedData[keyPath] || [];
            nestedData[keyPath]!.push(...(isObjectArray ? value : [value]));
            typeFingerprint.$ref = typeFingerprint.$ref || {
              count: index,
              typeRelationship: isObjectArray ? 'one-to-many' : 'one-to-one',
            };
            typeFingerprint.$ref.typeAlias = keyPath;
          }
        }

        if (isPossibleEnumOrUniqueType) {
          schema.uniques = schema.uniques || {};
          schema.uniques[fieldName] = schema.uniques[fieldName] || [];
          if (!schema.uniques[fieldName]!.includes(value))
            schema.uniques[fieldName]!.push(row[fieldName]);
          // } else {
          //   schema.uniques[fieldName] = null
        }
        schema.fieldsData[fieldName] = schema.fieldsData[fieldName] || [];
        schema.fieldsData[fieldName]!.push(typeFingerprint);
      });

      const totalRows = schema.totalRows;
      const isDone = index + 1 === totalRows;
      const progressFrequencyModulo =
        totalRows >= 2500 ? 50 : totalRows >= 1000 ? 25 : 10;
      const showProgress = !isDone && index % progressFrequencyModulo === 0;

      if (onProgress && showProgress) {
        onProgress(totalRows, index + 1);
      }
      return schema;
    }, detectedSchema);
    // #debug//log('  Extracted data points from Field Type analysis')
    return pivotedSchema;
  };

function condenseFieldData({
  enumAbsoluteLimit,
  isEnumEnabled,
}: {
  enumAbsoluteLimit: number;
  isEnumEnabled: boolean;
}) {
  return (schema: {
    fieldsData: {
      [x: string]: TypedFieldObject<InternalFieldTypeData>[];
    };
    uniques: {
      [x: string]: any[];
    };
    totalRows: number;
  }) => {
    const { fieldsData } = schema;
    const fieldNames = Object.keys(fieldsData);

    const fieldSummary: { [key: string]: FieldInfo } = {};
    // #debug: log
    //   `Pre-condenseFieldSizes(fields[fieldName]) for ${fieldNames.length} columns`,
    // )
    fieldNames.forEach((fieldName) => {
      const pivotedData = pivotFieldDataByType(fieldsData[fieldName]!);
      fieldSummary[fieldName] = fieldSummary[fieldName] || { types: {} };
      fieldSummary[fieldName]!.types = condenseFieldSizes(pivotedData);

      if (pivotedData.Null?.count != null && pivotedData.Null.count >= 0) {
        fieldSummary[fieldName]!.nullCount = pivotedData.Null.count;
      }

      if (pivotedData.$ref?.count ?? 0 > 1) {
        // Prevent overriding the $ref type label
        // 1. Find the first $ref
        const refType = fieldsData[fieldName]!.find(
          (typeRefs) => typeRefs.$ref,
        );
        // if (!fieldSummary[fieldName]?.types?.$ref) {
        //   throw new Error(`Invalid nested type $ref: fieldSummary[${fieldName}].types.$ref`)
        // }
        fieldSummary[
          fieldName
        ]!.types.$ref!.typeAlias = refType!.$ref!.typeAlias;
        fieldSummary[
          fieldName
        ]!.types.$ref!.typeRelationship = refType!.$ref!.typeRelationship;
      }

      // check for enum fields
      if (
        isEnumEnabled &&
        schema.uniques[fieldName] != null &&
        schema.uniques[fieldName]!.length! <= enumAbsoluteLimit
      ) {
        fieldSummary[fieldName]!.enum = schema.uniques[fieldName];
      }

      // console.// #debug: log`fieldSummary[${fieldName}]`, fieldSummary[fieldName])
    });
    // #debug//log('Post-condenseFieldSizes(fields[fieldName])')
    // #debug//log('Replaced fieldData with fieldSummary')
    return {
      fields: fieldSummary,
      uniques: schema.uniques,
      totalRows: schema.totalRows,
    };
  };
}

// interface IPivotData {
//   typeName: string;
//   length: number;
//   scale: number;
//   precision: number;
//   value: number;
//   count: number;
// }

function pivotFieldDataByType(
  typeSizeData: TypedFieldObject<InternalFieldTypeData>[],
) {
  // const blankTypeSums = () => ({ length: 0, scale: 0, precision: 0 })
  // #debug: log`Processing ${typeSizeData.length} type guesses`)
  return typeSizeData.reduce((pivotedData, currentTypeGuesses) => {
    Object.entries(currentTypeGuesses).map(
      ([typeName, { value, length, scale, precision }]: [
        typeName: string,
        data: any,
      ]) => {
        pivotedData[typeName] = pivotedData[typeName] || { typeName, count: 0 };
        // if (!pivotedData[typeName].count) pivotedData[typeName].count = 0
        if (Number.isFinite(length) && !pivotedData[typeName].length)
          pivotedData[typeName].length = [];
        if (Number.isFinite(scale) && !pivotedData[typeName].scale)
          pivotedData[typeName].scale = [];
        if (Number.isFinite(precision) && !pivotedData[typeName].precision)
          pivotedData[typeName].precision = [];
        if (
          (Number.isFinite(value) || typeof value === 'string') &&
          !pivotedData[typeName].value
        )
          pivotedData[typeName].value = [];

        pivotedData[typeName].count++;
        // if (invalid != null) pivotedData[typeName].invalid++
        if (length) pivotedData[typeName].length.push(length);
        if (scale) pivotedData[typeName].scale.push(scale);
        if (precision) pivotedData[typeName].precision.push(precision);
        if (value) pivotedData[typeName].value.push(value);
        // pivotedData[typeName].rank = typeRankings[typeName]
        return pivotedData[typeName];
      },
    );
    return pivotedData;
  }, {} as TypedFieldObject<InternalFieldTypeData>);
  /*
  > Example of sumCounts at this point
  {
    Float: { count: 4, scale: [ 5, 5, 5, 5 ], precision: [ 2, 2, 2, 2 ] },
    String: { count: 3, length: [ 2, 3, 6 ] },
    Number: { count: 1, length: [ 6 ] }
  }
*/
}

/**
 * Internal function which analyzes and summarizes each columns data by type. Sort of a histogram of significant points.
 */
function condenseFieldSizes(
  pivotedDataByType: { [k in TypeNameString]?: InternalFieldTypeData },
) {
  const aggregateSummary: { [k in TypeNameString]?: FieldTypeSummary } = {};
  // #debug//log('Starting condenseFieldSizes()')
  Object.keys(pivotedDataByType).map(
    (typeName: TypeNameString | string, idx: number, arr: any[]) => {
      aggregateSummary[typeName] = {
        // typeName,
        // rank: typeRankings[typeName] || -42,
        count: pivotedDataByType[typeName]!.count,
      };

      if (typeName === '$ref' && aggregateSummary[typeName]) {
        // console.log(
        //   'pivotedDataByType.$ref',
        //   JSON.stringify(pivotedDataByType.$ref, null, 2),
        // );
        aggregateSummary[
          typeName
        ]!.typeAlias = pivotedDataByType.$ref!.typeAlias;
        aggregateSummary[
          typeName
        ]!.typeRelationship = pivotedDataByType.$ref!.typeRelationship;
      } else {
        if (typeName !== 'String' && pivotedDataByType[typeName]!.value)
          aggregateSummary[typeName]!.value = getNumberRangeStats(
            pivotedDataByType[typeName].value,
          );
        if (pivotedDataByType[typeName]!.length)
          aggregateSummary[typeName]!.length = getNumberRangeStats(
            pivotedDataByType[typeName].length,
            true,
          );
        if (pivotedDataByType[typeName]!.scale)
          aggregateSummary[typeName]!.scale = getNumberRangeStats(
            pivotedDataByType[typeName].scale,
            true,
          );
        if (pivotedDataByType[typeName]!.precision)
          aggregateSummary[typeName]!.precision = getNumberRangeStats(
            pivotedDataByType[typeName].precision,
            true,
          );
      }
      if (
        aggregateSummary[typeName] &&
        ['Timestamp', 'Date'].indexOf(typeName) > -1
      ) {
        aggregateSummary[typeName].value! = formatRangeStats(
          aggregateSummary[typeName]!.value! as any,
          parseDate,
        );
      }
      return aggregateSummary[typeName]; // not used
    },
  );
  // #debug//log('Done condenseFieldSizes()...')
  return aggregateSummary;
}

function getFieldMetadata({
  value,
  strictMatching,
}: {
  value?: any;
  strictMatching?: boolean;
}) {
  // Get initial pass at the data with the TYPE_* `.check()` methods.
  const typeGuesses = detectTypes(value, strictMatching);

  // Assign initial metadata for each matched type below
  return typeGuesses.reduce(
    (analysis: TypedFieldObject<FieldTypeSummary>, typeGuess, index) => {
      let length;
      let precision;
      let scale;
      // let rank = index + 1
      let count = 1;

      typeGuess = typeGuess!;
      analysis[typeGuess] = { count };

      if (typeGuess === 'Array') {
        length = value.length;
        analysis[typeGuess] = { ...analysis[typeGuess], count, length };
      }
      if (typeGuess === 'Float') {
        value = parseFloat(`${value}`);
        analysis[typeGuess] = { ...analysis[typeGuess], count, value };
        const significandAndMantissa = `${value}`.split('.');
        if (significandAndMantissa.length === 2) {
          // Note: To future self, the following is correct: 'precision' is the total # of digits!
          precision = significandAndMantissa.join('').length; // total # of numeric positions before & after decimal
          scale = significandAndMantissa[1]!.length;
          analysis[typeGuess] = {
            ...analysis[typeGuess],
            count,
            // @ts-ignore
            precision,
            // @ts-ignore
            scale,
          };
        }
      }
      if (typeGuess === 'Number') {
        value = Number(value);
        analysis[typeGuess] = { ...analysis[typeGuess], count, value };
      }
      if (typeGuess === 'Date' || typeGuess === 'Timestamp') {
        const checkedDate = isValidDate(value);
        if (checkedDate) {
          analysis[typeGuess] = {
            ...analysis[typeGuess],
            count,
            value: checkedDate.getTime(),
          };
          // } else {
          //   analysis[typeGuess] = { ...analysis[typeGuess], invalid: true, value: value }
        }
      }
      if (typeGuess === 'String' || typeGuess === 'Email') {
        length = `${value}`.length;
        // @ts-ignore
        analysis[typeGuess] = { ...analysis[typeGuess], count, length, value };
      }
      return analysis;
    },
    {},
  );
}

/**
 * Accepts an array of numbers and returns summary data about
 *  the range & spread of points in the set.
 *
 * @param {number[]} numbers - sequence of unsorted data points
 */
function getNumberRangeStats(
  numbers?: number[],
  useSortedDataForPercentiles = false,
) {
  if (!numbers || numbers.length < 1) return undefined;
  const sortedNumbers = numbers
    .slice()
    .sort((a, b) => (a < b ? -1 : a === b ? 0 : 1));
  const sum = numbers.reduce((a, b) => a + b, 0);
  if (useSortedDataForPercentiles) numbers = sortedNumbers;
  return {
    // size: numbers.length,
    min: sortedNumbers[0],
    mean: sum / numbers.length,
    max: sortedNumbers[numbers.length - 1],
    p25: numbers[parseInt((numbers.length * 0.25).toString(), 10)],
    p33: numbers[parseInt((numbers.length * 0.33).toString(), 10)],
    p50: numbers[parseInt((numbers.length * 0.5).toString(), 10)],
    p66: numbers[parseInt((numbers.length * 0.66).toString(), 10)],
    p75: numbers[parseInt((numbers.length * 0.75).toString(), 10)],
    p99: numbers[parseInt((numbers.length * 0.99).toString(), 10)],
  };
}

/**
 *
 */
function formatRangeStats<T, TFormatReturn>(
  stats: AggregateSummary<T>,
  formatter: (n?: T) => TFormatReturn,
) {
  return {
    // size: stats.size,
    min: formatter(stats?.min),
    mean: formatter(stats?.mean),
    max: formatter(stats?.max),
    p25: formatter(stats?.p25),
    p33: formatter(stats?.p33),
    p50: formatter(stats?.p50),
    p66: formatter(stats?.p66),
    p75: formatter(stats?.p75),
    p99: formatter(stats?.p99),
  };
}

function unpackNestedTypes(nestedTypes: KeyValPair<TypeSummary<FieldInfo>>) {
  return Object.entries(nestedTypes).reduce((nested, keyAndType) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [typePath, nestedTypeSummary] = keyAndType;
    if (nestedTypeSummary) {
      // append this level's nested types
      nested = {
        ...nested,
        ...unpackNestedTypes(nestedTypeSummary.nestedTypes || {}),
      };
    }
    return nested;
  }, nestedTypes);
}

function checkAndDeleteDeeplyNestedTypes(
  typeSummary: TypeSummary<FieldInfo>,
): TypeSummary<FieldInfo> {
  // let nestedTypes = typeSummary.nestedTypes
  typeSummary.nestedTypes = undefined;
  return typeSummary;
}

// const recurseIntoNestedTypes
function extractNestedTypes(typeSummary: TypeSummary<FieldInfo>) {
  if (typeSummary.nestedTypes) {
    typeSummary.nestedTypes = unpackNestedTypes(typeSummary.nestedTypes);
  }
  return typeSummary;
}

export {
  schemaAnalyzer,
  extractNestedTypes,
  // private-ish methods:
  condenseFieldData as _condenseFieldData,
  pivotFieldDataByType as _pivotFieldDataByType,
  getNumberRangeStats as _getNumberRangeStats,
  formatRangeStats as _formatRangeStats,
  getFieldMetadata as _getFieldMetadata,
  isValidDate as _isValidDate,
};
