import { camelCase } from 'lodash';

export const numericSorter = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export const removeBlankLines = (s: string, expectLen: number = -1): string => {
  const newStr = s.replace(/^ +\n/gim, '');
  if (s.length !== newStr.length) return removeBlankLines(newStr, newStr.length);
  return newStr;
};
export const properCase = (s: string) =>
  s[0] && s[0].toUpperCase() + camelCase(s).slice(1);

export const getElementSize = (
  selector: string,
  root: Element = document.body,
): DOMRect => {
  const el$: HTMLBaseElement | null = root.querySelector(selector);
  if (el$ && el$.getBoundingClientRect) {
    return el$.getBoundingClientRect();
  }
  return {
    height: NaN,
    width: NaN,
    x: NaN,
    y: NaN,
    top: NaN,
    right: NaN,
    bottom: NaN,
    left: NaN,
    toJSON: () => '{}',
  };
};

const _percentFormatter = new Intl.NumberFormat(['en-US', 'en'], {
  style: 'percent',
  minimumFractionDigits: 1,
});

export const formatPercent = (number: number | string) =>
  number != null ? _percentFormatter.format(Number(number)) : `0.00`;

export const convertFractionToPercent = (fraction?: number | string) => {
  return Number(fraction) > 0
    ? Math.abs(Number(fraction) * 100.0)
        .toString()
        .concat('%')
    : '0.000%';
};
