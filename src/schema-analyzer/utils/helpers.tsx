// import debug from 'debug'
import { mapValues } from 'lodash';
import {
  AggregateSummary,
  FieldInfo,
  CombinedFieldInfo,
  TypeNameString,
  TypeSummary,
  ScalarFieldInfo,
  NumericFieldInfo,
  FieldTypeSummary,
} from '..';

// const log = debug('schema-builder:helpers')
interface IHelperOptions {
  /** Percent of empty records indicating field is still non-null. (Error tolerance for bad data.) Default: 0.001 */
  nullableRowsThreshold: number;
  targetLength: keyof AggregateSummary;
  targetScale: keyof AggregateSummary;
  targetPrecision: keyof AggregateSummary;
  targetValue: keyof AggregateSummary;
}

type CombinedFieldsDict = { [key: string]: CombinedFieldInfo };

export function flattenTypes(
  results: TypeSummary<FieldInfo>,
  options: IHelperOptions = {
    nullableRowsThreshold: 0.001,
    targetLength: 'max',
    targetPrecision: 'max',
    targetScale: 'max',
    targetValue: 'max',
  },
): TypeSummary<CombinedFieldInfo> {
  const fields = mapValues(results.fields, (fieldInfo, name) => {
    if (results.nestedTypes && fieldInfo.types.$ref) {
      const { typeAlias } = fieldInfo.types.$ref;
      // lookup real count, set it on the $ref
      const { totalRows } = results.nestedTypes[typeAlias!]!;
      // log(
      //   `SubType Count Adjustment, from ${fieldInfo.types.$ref.count} to ${totalRows}`,
      // )
      fieldInfo.types.$ref.count = totalRows;
    }
    return _simplifyFieldInfo(fieldInfo, options, name);
  });

  return {
    schemaName: results.schemaName,
    fields,
    // @ts-ignore
    nestedTypes: (mapValues(results.nestedTypes, (value) =>
      flattenTypes(value, options),
    ) as unknown) as CombinedFieldsDict,
    totalRows: results.totalRows,
  };
}

function _simplifyFieldInfo(
  fieldInfo: FieldInfo,
  options: IHelperOptions,
  name: string,
): CombinedFieldInfo {
  // fieldInfo.types
  // @ts-ignore
  let arrayOfTypes = Object.entries<FieldTypeSummary>(fieldInfo.types); //as [n: TypeNameString, summary?: FieldTypeSummary][]
  if (arrayOfTypes.length === 0)
    throw new Error(
      `Error: The ${name} Field has no matching types! Check your data & try again.`,
    );
  arrayOfTypes = arrayOfTypes
    .slice(0)
    .filter((f) => f[0] !== 'Null' && f[0] !== 'Unknown')
    .sort((a, b) =>
      a[1]!.count > b[1]!.count ? -1 : a[1]!.count === b[1]!.count ? 0 : 1,
    );
  // get info about Null fields
  // const nullCount = fieldInfo.types.Null?.count || 0
  // fieldInfo.nullCount = nullCount
  // if (nullCount != null) {
  //   fieldInfo.nullable = nullCount === 0 ? false : true;
  //   // console.error(`WARN: Field cannot have nullable!==true AND nullCount `)
  // }
  // get the 'winning' type from sorted array
  let topType = arrayOfTypes[0]![0];
  let typeRef: string | undefined = undefined;

  // check for under-counted $ref due to empty arrays in the rows
  if (
    topType === 'Array' &&
    arrayOfTypes.length > 1 &&
    arrayOfTypes[1] != null &&
    arrayOfTypes[1][0] === '$ref'
  ) {
    typeRef = arrayOfTypes[1]![1]!.typeAlias;
  }

  if (topType === '$ref') {
    typeRef = arrayOfTypes[0]![1]!.typeAlias;
  }

  const fieldTypeDetails = fieldInfo.types[topType as TypeNameString]!;

  let result: CombinedFieldInfo = {
    type: topType as TypeNameString,
    typeRef,
    identity: fieldInfo.identity || false,
    enum: fieldInfo.enum || null,
    nullable: Boolean(fieldInfo.nullable),
    unique: fieldInfo.unique || false,
    count: fieldTypeDetails.count,
  };

  // // keep desired value
  // if (fieldTypeDetails.value) {
  //   const { value } = fieldTypeDetails
  //   return {
  //     ...result,
  //     value: value![options.targetValue],
  //   } as SimpleFieldInfo
  // }

  // keep length for composite fields
  if (fieldTypeDetails.length) {
    // if (TypeNameStringComposite.includes(topType)) {
    const { length } = fieldTypeDetails;
    return {
      ...result,
      length: length![options.targetLength],
    } as ScalarFieldInfo;
  }

  // keep scale & precision for decimal fields
  if (fieldTypeDetails.scale || fieldTypeDetails.precision) {
    // if (TypeNameStringDecimal.includes(topType)) {
    const { scale, precision } = fieldTypeDetails;
    return {
      ...result,
      scale: scale![options.targetScale],
      precision: precision![options.targetPrecision],
    } as NumericFieldInfo;
  }

  return result;
}
