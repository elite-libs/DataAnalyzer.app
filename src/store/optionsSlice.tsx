import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdapterNames } from 'components/SchemaTools/adapters/writers';

type State = {
  outputAdapter: AdapterNames,
  strictMatching: boolean,
  enumMinimumRowCount: number,
  enumAbsoluteLimit: number,
  enumPercentThreshold: number,
  nullableRowsThreshold: number,
  uniqueRowsThreshold: number,
};

let initialState: State = {
  outputAdapter: 'knex',
  strictMatching: true,
  enumMinimumRowCount: 100,
  enumAbsoluteLimit: 10,
  enumPercentThreshold: 0.01,
  nullableRowsThreshold: 0.02,
  uniqueRowsThreshold: 1.0,
};

const slice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setOptions(state, action: PayloadAction<Partial<State>>) {
      const { payload } = action;
      state = {...state, ...payload};
    },
  },
});

const appStateActions = slice.reducer;

export const { setOptions } = slice.actions;

export default appStateActions;
