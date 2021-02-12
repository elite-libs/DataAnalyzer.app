import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FieldInfo, TypeSummary } from '../schema-analyzer';

type State = {
  inputData?: string | null;
  inputTimestamp?: number | null;
  results?: string | null;
  resultsTimestamp?: number | null;
  schemaName: string | null;
  schema?: TypeSummary<FieldInfo> | null;
  schemaTimestamp?: number | null;
};

let initialState: State = {
  inputData: '',
  schema: null,
  schemaName: '',
  schemaTimestamp: null,
  results: null,
  resultsTimestamp: null,
};

const slice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setInputData(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      if (payload === state.inputData) return;
      state.inputData = payload;
      state.inputTimestamp = payload != null ? Date.now() : null;
      state.schema = null;
      state.schemaTimestamp = null;
      state.results = null;
      state.resultsTimestamp = null;
    },
    setSchemaName(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.schemaName = payload || 'SchemaName';
      state.results = null;
      state.resultsTimestamp = null;
    },
    setSchema(state, action: PayloadAction<TypeSummary<FieldInfo> | null>) {
      const { payload } = action;
      state.schema = payload;
      state.schemaTimestamp = payload != null ? Date.now() : null;
      state.results = null;
      state.resultsTimestamp = null;
    },
    setResults(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.results = payload;
      state.resultsTimestamp = payload != null ? Date.now() : null;
    },
    resetAnalysis(state) {
      state = { ...initialState };
      return state;
    },
  },
});

export const { setInputData, setResults, setSchema, setSchemaName, resetAnalysis } = slice.actions;

export default slice.reducer;
