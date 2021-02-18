import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FieldInfo, TypeSummary } from '../schema-analyzer';

type State = {
  results?: string | null;
  resultsTimestamp?: number | null;
  schemaName: string | null;
  schema?: TypeSummary<FieldInfo> | null;
  schemaTimestamp?: number | null;
};

let initialState: State = {
  schema: null,
  schemaName: 'Users',
  schemaTimestamp: null,
  results: null,
  resultsTimestamp: null,
};

const slice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setSchemaName(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.schemaName = payload || 'SchemaName';
      state.results = null;
      state.resultsTimestamp = null;
      return state;
    },
    setSchema(state, action: PayloadAction<TypeSummary<FieldInfo> | null>) {
      const { payload } = action;
      state.schema = payload;
      state.schemaTimestamp = payload != null ? Date.now() : null;
      state.results = null;
      state.resultsTimestamp = null;
      return state;
    },
    setResults(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.results = payload;
      state.resultsTimestamp = payload != null ? Date.now() : null;
      return state;
    },
    resetAnalysis(state) {
      state = { ...initialState };
      return state;
    },
  },
});

export const { setResults, setSchema, setSchemaName, resetAnalysis } = slice.actions;

export default slice.reducer;
