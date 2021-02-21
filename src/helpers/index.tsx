import { camelCase } from 'lodash';

export const removeBlankLines = (s: string, expectLen: number = -1): string => {
  const newStr = s.replace(/^ +\n/gim, '');
  if (s.length !== newStr.length) return removeBlankLines(newStr, newStr.length)
  return newStr;
}
export const properCase = (s: string) => s[0] && s[0].toUpperCase() + camelCase(s).slice(1);
