import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdapterNames } from 'adapters/writers';
import type {
  INamingOptions,
  IConsolidateTypesOptions,
  SupportedTargetLanguages,
} from 'types';

export interface OptionsState {
  outputLanguage: SupportedTargetLanguages;
  outputAdapter: AdapterNames;
  strictMatching: boolean;
  enumMinimumRowCount: number;
  enumAbsoluteLimit: number;
  enumPercentThreshold: number;
  nullableRowsThreshold: number;
  uniqueRowsThreshold: number;
  consolidateTypes: IConsolidateTypesOptions['consolidateTypes'];
  prefixNamingMode: INamingOptions['prefixNamingMode'];
  readonly _timestamp?: number;
  readonly debug?: boolean;
}

let initialState: Readonly<OptionsState> = {
  outputLanguage: 'typescript',
  outputAdapter: 'typescript',
  strictMatching: false,
  enumMinimumRowCount: 50,
  enumAbsoluteLimit: 10,
  enumPercentThreshold: 0.01,
  nullableRowsThreshold: 0.001,
  uniqueRowsThreshold: 1.0,
  consolidateTypes: 'field-names',
  prefixNamingMode: 'full',
  // _timestamp: Date.now(),
};

export { initialState as _initialOptions };
const slice = createSlice({
  name: 'options',
  initialState: getSavedOptions() || initialState,
  reducers: {
    setOptions(state, action: PayloadAction<Partial<OptionsState>>) {
      const { payload } = action;
      Object.assign(state, payload, { _timestamp: Date.now() });
    },
    resetOptions(state) {
      state = { ...initialState, _timestamp: Date.now() };
      return state;
    },
  },
});

const appStateActions = slice.reducer;

export const { setOptions, resetOptions } = slice.actions;

export default appStateActions;

export function getSavedOptions() {
  try {
    const optionsJson = localStorage.getItem('analyzer.options');
    if (optionsJson && optionsJson.length > 1) {
      let opts = JSON.parse(optionsJson);
      // console.log('restoring saved settings:', optionsJson, opts);
      return opts;
    }
  } catch (error) {
    // ignore localStorage fails
  }
  return null;
}
