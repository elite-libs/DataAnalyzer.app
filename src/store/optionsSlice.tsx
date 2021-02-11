import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdapterNames } from 'components/SchemaTools/adapters/writers';

type State = {
  outputAdapter: AdapterNames;
  strictMatching: boolean;
  enumMinimumRowCount: number;
  enumAbsoluteLimit: number;
  enumPercentThreshold: number;
  nullableRowsThreshold: number;
  uniqueRowsThreshold: number;
  readonly _timestamp: number;
};

let initialState: State = {
  outputAdapter: 'typescript',
  strictMatching: false,
  enumMinimumRowCount: 100,
  enumAbsoluteLimit: 10,
  enumPercentThreshold: 0.01,
  nullableRowsThreshold: 0.001,
  uniqueRowsThreshold: 1.0,
  _timestamp: Date.now(),
};

const slice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setOptions(state, action: PayloadAction<Partial<State>>) {
      const { payload } = action;
      state = { ...state, ...payload, _timestamp: Date.now() };
    },
    resetOptions(state) {
      state = { ...initialState };
      return state;
    },
  },
});

const appStateActions = slice.reducer;

export const { setOptions, resetOptions } = slice.actions;

export default appStateActions;
