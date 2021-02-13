import { isDate } from 'lodash';
export {
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
};

const currencies = [
  '$',
  '¢',
  '£',
  '¤',
  '¥',
  '֏',
  '؋',
  '߾',
  '߿',
  '৲',
  '৳',
  '৻',
  '૱',
  '௹',
  '฿',
  '៛',
  '₠',
  '₡',
  '₢',
  '₣',
  '₤',
  '₥',
  '₦',
  '₧',
  '₨',
  '₩',
  '₪',
  '₫',
  '€',
  '₭',
  '₮',
  '₯',
  '₰',
  '₱',
  '₲',
  '₳',
  '₴',
  '₵',
  '₶',
  '₷',
  '₸',
  '₹',
  '₺',
  '₻',
  '₼',
  '₽',
  '₾',
  '₿',
  '꠸',
  '﷼',
  '﹩',
  '＄',
  '￠',
  '￡',
  '￥',
  '￦',
  '𑿝',
  '𑿞',
  '𑿟',
  '𑿠',
  '𞋿',
  '𞲰',
];

const boolishPattern = /^([YN]|(TRUE)|(FALSE))$/i;
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const objectIdPattern = /^[a-f\d]{24}$/i;
const dateStringPattern = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
const timestampPattern = /^[12]\d{12}$/;
// const currencyPatternUS = /^\p{Sc}\s?[\d,.]+$/uig
// const currencyPatternEU = /^[\d,.]+\s?\p{Sc}$/uig
const numberishPattern = /^-?[\d.,]+$/;
const floatPattern = /\d\.\d/;
// const emailPattern = /^[^@]+@[^@]{2,}\.[^@]{2,}[^.]$/
const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const nullishPattern = /null/i;
// const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/igm

/**
 * @param {string | any[] | null} value
 * @param {any} fieldName
 */
function isBoolish(value: string | any[] | null, fieldName?: string): boolean {
  if (value == null) return false;
  value = String(value).trim();
  return value.length <= 6 && boolishPattern.test(String(value));
}

/**
 * @param {string | any[] | null} value
 * @param {any} fieldName
 */
function isUuid(value: string | any[] | null, fieldName?: string): boolean {
  if (value == null) return false;
  value = String(value).trim();
  return value.length < 40 && uuidPattern.test(value);
}
/**
 * @param {string | any | null} value
 * @param {any} fieldName
 */
function isObjectId(value: string | any[] | null, fieldName?: string): boolean {
  if (value == null) return false;
  value = String(value).trim();
  return value.length < 40 && objectIdPattern.test(value);
}

/**
 * Unix timestamps will match as Timestamp, not a Date
 * @param {string | any | null} value
 * @param {any} fieldName
 */
function isDateString(
  value: string | any[] | null,
  fieldName?: string,
): boolean {
  // not bullet-proof, meant to sniff intention in the data
  if (value == null) return false;
  // This has corresponding lines in the isTimestamp function:
  if (isNumeric(value)) {
    // && String(value).length < 10 && String(value).length > 13) return false;
    // check if timestamp match, return false here.
    // ///// if (isTimestamp(value))
    return false;
  }
  if (isDate(value)) return true;
  value = String(value).trim();
  return value.length < 30 && dateStringPattern.test(value);
}

/**
 * Timestamps will match on numbers between:
 *
 * ```
 * 10 digits:    1000000000:    new Date(1000000000) // "1970-01-12T13:46:40.000Z"
 * 13 digits: 9999999999999: new Date(9999999999999) // "2286-11-20T17:46:39.999Z"
 * ```
 *
 * @param {string | any | null} value
 */
function isTimestamp(value: string | any | null): boolean {
  if (value == null) return false;
  // This has corresponding line in the Timestamp matcher:
  if (
    isNumeric(value) &&
    Number(value) % 2 === 0 &&
    String(value).length >= 10 &&
    String(value).length < 14
  )
    return true;
  value = String(value).trim();
  return timestampPattern.test(value);
}

/**
 * @param {string | null} value
 */
function isCurrency(value: string | null): boolean {
  if (value == null) return false;
  value = String(value).trim();
  const valueSymbol = currencies.find(
    (curSymbol) => value && value.indexOf(curSymbol) > -1,
  );
  if (!valueSymbol) return false;
  value = value.replace(valueSymbol, '');
  return isNumeric(value);
  // console.log(value, 'currencyPatternUS', currencyPatternUS.test(value), 'currencyPatternEU', currencyPatternEU.test(value));
  // return currencyPatternUS.test(value) || currencyPatternEU.test(value)
}

/**
 * @param {string | any[]} value
 * @param {undefined} [fieldName]
 */
function isNumeric(
  value: string | any[],
  fieldName?: string | undefined,
): boolean {
  // if (value == null) return false
  value = String(value).trim();
  return value.length < 30 && numberishPattern.test(value);
}

/**
 * @param {unknown} value
 */
function isFloatish(value: unknown): boolean {
  return !!(
    isNumeric(String(value)) &&
    floatPattern.test(String(value)) &&
    !Number.isInteger(value)
  );
}

/**
 * @param {string | string[] | null} value
 */
function isEmailShaped(value: string | string[] | null): boolean {
  if (value == null) return false;
  value = String(value).trim();
  if (value.includes(' ') || !value.includes('@')) return false;
  return value.length >= 5 && value.length < 80 && emailPattern.test(value);
}

/**
 * @param {null} value
 */
function isNullish(value: any): boolean {
  return value === null || nullishPattern.test(String(value).trim());
}
