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
  shapeBasedName: string;
  prefixMatches: string[];
  suffixMatches: string[];
  pathSplitByLastCommonSubstring: string[] | null;
  // trailing string matches
  exactMatches: {
    lastCommonKey: null | string;
    nextToLastCommonKey: null | string;
  };

  setOperations: {
    // uses lodash.intersection
    intersection: null | string;
    difference: string[];
    union: null | string;
    xor: null | string;
  };

  alternatePrefixes: null | {
    initials: null | string;
    abbreviated: null | string;
    truncated: null | string;
  };
};
