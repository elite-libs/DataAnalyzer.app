// export type TypeDescriptorName = 'enum' | 'nullable' | 'unique';
// export type TypeNameString = '$ref' |
//     'Unknown' |
//     'ObjectId' |
//     'UUID' |
//     'Boolean' |
//     'Date' |
//     'Timestamp' |
//     'Currency' |
//     'Float' |
//     'Number' |
//     'Email' |
//     'String' |
//     'Array' |
//     'Object' |
//     'Null'

// export interface ISchemaAnalyzerOptions {
//     onProgress?: progressCallback | undefined;
//     enumMinimumRowCount?: number | undefined;
//     enumAbsoluteLimit?: number | undefined;
//     enumPercentThreshold?: number | undefined;
//     nullableRowsThreshold?: number | undefined;
//     uniqueRowsThreshold?: number | undefined;
//     strictMatching?: boolean | undefined;
//     disableNestedTypes?: boolean | undefined;
//     bogusSizeThreshold?: number | undefined,
// }

// /**
//  * Includes the results of main top-level schema.
//  */
// export type TypeSummary = {
//     fields: {
//         [x: string]: FieldInfo;
//     };
//     totalRows: number;
//     nestedTypes?: {
//         [x: string]: TypeSummary;
//     } | undefined;
// };
// /**
//  * Describes one or more potential types discovered for a field. The `types` object will have a `$ref` key if any nested structures were found.
//  */
// export type FieldInfo = {
//     /**
//      * - field stats organized by type
//      */
//     types: {
//         [x: TypeNameString]: FieldTypeSummary;
//     };
//     /**
//      * - is the field nullable
//      */
//     nullable: boolean;
//     /**
//      * - is the field unique
//      */
//     unique: boolean;
//     /**
//      * - enumeration detected, the values are listed on this property.
//      */
//     enum?: string[] | number[] | undefined;
// };
// /**
//  * Contains stats for a given field's (potential) type.
//  *
//  * TODO: Add string property for the type name.
//  *    We currently uses object key structure: {"String": FieldTypeSummary}
//  */
// export type FieldTypeSummary = {
//     /**
//      * - for nested type support.
//      */
//     typeAlias?: string | undefined;
//     /**
//      * - extracted field values, placed into an array. This simplifies (at expense of memory) type analysis and summarization when creating the `AggregateSummary`.
//      */
//     value?: AggregateSummary | undefined;
//     /**
//      * - summary of array of string (or decimal) sizes, pre processing into an AggregateSummary
//      */
//     length?: AggregateSummary | undefined;
//     /**
//      * - only applies to Float types. Summary of array of sizes of the value both before and after the decimal.
//      */
//     precision?: AggregateSummary | undefined;
//     /**
//      * - only applies to Float types. Summary of array of sizes of the value after the decimal.
//      */
//     scale?: AggregateSummary | undefined;
//     /**
//      * - if enum rules were triggered will contain the detected unique values.
//      */
//     enum?: string[] | number[] | undefined;
//     /**
//      * - number of times the type was matched
//      */
//     count: number;
//     /**
//      * - absolute priority of the detected TypeName, defined in the object `typeRankings`
//      */
//     rank: number;
// };
// /**
//  * This is an internal intermediate structure.
//  * It mirrors the `FieldSummary` type it will become.
//  */
// export type InternalFieldTypeData = {
//     /**
//      * - array of values, pre processing into an AggregateSummary
//      */
//     value?: any[] | undefined;
//     /**
//      * - array of string (or decimal) sizes, pre processing into an AggregateSummary
//      */
//     length?: number[] | undefined;
//     /**
//      * - only applies to Float types. Array of sizes of the value both before and after the decimal.
//      */
//     precision?: number[] | undefined;
//     /**
//      * - only applies to Float types. Array of sizes of the value after the decimal.
//      */
//     scale?: number[] | undefined;
//     /**
//      * - number of times the type was matched
//      */
//     count?: number | undefined;
//     /**
//      * - absolute priority of the detected TypeName, defined in the object `typeRankings`
//      */
//     rank?: number | undefined;
// };
// /**
//  * Used to represent a number series of any size.
//  * Includes the lowest (`min`), highest (`max`), mean/average (`mean`) and measurements at certain `percentiles`.
//  */
// export type AggregateSummary = {
//     min: number;
//     max: number;
//     mean: number;
//     p25: number;
//     p33: number;
//     p50: number;
//     p66: number;
//     p75: number;
//     p99: number;
// };
// /**
//  * This callback is displayed as a global member.
//  */
// export type progressCallback = (progress: {
//     totalRows: number;
//     currentRow: number;
// }) => any;
// /**
//  * Includes the results of main top-level schema.
//  * @typedef TypeSummary
//  * @type {{
//  *  fields: Object.<string, FieldInfo>;
//  *  totalRows: number;
//  *  nestedTypes?: Object.<string, TypeSummary>;
//  * }}
//  */
// /**
//  * Describes one or more potential types discovered for a field. The `types` object will have a `$ref` key if any nested structures were found.
//  * @typedef FieldInfo
//  * @type {object}
//  * @property {Object.<string, string | FieldTypeSummary>} types - field stats organized by type
//  * @property {boolean} nullable - is the field nullable
//  * @property {boolean} unique - is the field unique
//  * @property {string[]|number[]} [enum] - enumeration detected, the values are listed on this property.
//  */
// /**
//  * Contains stats for a given field's (potential) type.
//  *
//  * TODO: Add string property for the type name.
//  *    We currently uses object key structure: {"String": FieldTypeSummary}
//  * @typedef FieldTypeSummary
//  * @type {Object}
//  * @property {string} [typeAlias] - for nested type support.
//  * @property {AggregateSummary} [value] - extracted field values, placed into an array. This simplifies (at expense of memory) type analysis and summarization when creating the `AggregateSummary`.
//  * @property {AggregateSummary} [length] - summary of array of string (or decimal) sizes, pre processing into an AggregateSummary
//  * @property {AggregateSummary} [precision] - only applies to Float types. Summary of array of sizes of the value both before and after the decimal.
//  * @property {AggregateSummary} [scale] - only applies to Float types. Summary of array of sizes of the value after the decimal.
//  * @property {string[]|number[]} [enum] - if enum rules were triggered will contain the detected unique values.
//  * @property {number} count - number of times the type was matched
//  * @property {number} rank - absolute priority of the detected TypeName, defined in the object `typeRankings`
//  */
// /**
//  * This is an internal intermediate structure.
//  * It mirrors the `FieldSummary` type it will become.
//  * @private
//  * @typedef InternalFieldTypeData
//  * @type {Object}
//  * @property {any[]} [value] - array of values, pre processing into an AggregateSummary
//  * @property {number[]} [length] - array of string (or decimal) sizes, pre processing into an AggregateSummary
//  * @property {number[]} [precision] - only applies to Float types. Array of sizes of the value both before and after the decimal.
//  * @property {number[]} [scale] - only applies to Float types. Array of sizes of the value after the decimal.
//  * @property {number} [count] - number of times the type was matched
//  * @property {number} [rank] - absolute priority of the detected TypeName, defined in the object `typeRankings`
//  *
//  */
// /**
//  * Used to represent a number series of any size.
//  * Includes the lowest (`min`), highest (`max`), mean/average (`mean`) and measurements at certain `percentiles`.
//  * @typedef AggregateSummary
//  * @type {{min: number, max: number, mean: number, p25: number, p33: number, p50: number, p66: number, p75: number, p99: number}}
//  */
// /**
//  * This callback is displayed as a global member.
//  * @callback progressCallback
//  * @param {{totalRows: number, currentRow: number}} progress - The current progress of processing.
//  */
// /**
//  * schemaAnalyzer() is the main function and where all the analysis & processing happens.
//  * @param {string} schemaName The name, or name prefix to use when assembling results. Helpful with nested types (aka sub-types.)
//  * @param {Array<Object>} input - The input data to analyze. Must be an array of objects.
//  * @param {ISchemaAnalyzerOptions} [options] - Optional parameters
//  * @returns {Promise<TypeSummary>} Returns and
//  */
// export function schemaAnalyzer(schemaName: string, input: Array<Object>, options?: ISchemaAnalyzerOptions | undefined): Promise<TypeSummary>;

// export function pivotFieldDataByType(typeSizeData: any): any;
// /**
//  * Accepts an array of numbers and returns summary data about
//  *  the range & spread of points in the set.
//  *
//  * @param {number[]} numbers - sequence of unsorted data points
//  * @returns {AggregateSummary}
//  */
// export function getNumberRangeStats(numbers: number[], useSortedDataForPercentiles?: boolean): AggregateSummary;
// export function isValidDate(date: any): any;
// /**
//  * Returns a fieldName keyed-object with type detection summary data.
//  *
//  * ### Example `fieldSummary`:
//  * ```
//  * {
//  *  "id": {
//  *    "UUID": {
//  *      "rank": 2,
//  *      "count": 25
//  *    },
//  *    "Number": {
//  *      "rank": 8,
//  *      "count": 1,
//  *      "value": {
//  *        "min": 9999999,
//  *        "mean": 9999999,
//  *        "max": 9999999,
//  *        "p25": 9999999,
//  *        "p33": 9999999,
//  *        "p50": 9999999,
//  *        "p66": 9999999,
//  *        "p75": 9999999,
//  *        "p99": 9999999
//  *      }
//  *    }
//  *  }
//  * }
//  * ```
//  *
//  * @param {{ fieldsData: Object.<string, InternalFieldTypeData[]>, uniques: Object.<string, any[]>, totalRows: number}} schema
//  * @returns {{
//  *  fields: Object.<string, Object.<string, FieldTypeSummary>>,
//  *  uniques: Object.<string, any[]>,
//  *  totalRows: number
//  * }}
//  */
// declare function condenseFieldData(schema: {
//     fieldsData: {
//         [x: string]: InternalFieldTypeData[];
//     };
//     uniques: {
//         [x: string]: any[];
//     };
//     totalRows: number;
// }): {
//     fields: {
//         [x: string]: {
//             [x: TypeNameString]: FieldTypeSummary;
//         };
//     };
//     uniques: {
//         [x: string]: any[];
//     };
//     totalRows: number;
// };
// /**
//  *
//  */
// declare function formatRangeStats(stats: any, formatter: any): {
//     min: any;
//     mean: any;
//     max: any;
//     p25: any;
//     p33: any;
//     p50: any;
//     p66: any;
//     p75: any;
//     p99: any;
// };
// export { condenseFieldData as _condenseFieldData, pivotFieldDataByType as _pivotFieldDataByType, getNumberRangeStats as _getNumberRangeStats, formatRangeStats as _formatRangeStats };
