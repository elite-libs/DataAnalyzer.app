import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FieldInfo, TypeSummary } from '../schema-analyzer';

type State = {
  inputData?: string | null;
  inputTimestamp?: string | null;
  results?: string | null;
  resultsTimestamp?: string | null;
  schemaName: string | null;
  schema?: TypeSummary<FieldInfo> | null;
  schemaTimestamp?: string | null;
};

let initialState: State = {
  inputData: '',
  schema: null,
  schemaName: '',
  schemaTimestamp: null,
  results: '',
  resultsTimestamp: null
};

const slice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setInputData(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      if (payload === state.inputData) return;
      state.inputData = payload;
      state.inputTimestamp = new Date().toISOString();
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
    setSchema(state, action: PayloadAction<TypeSummary<FieldInfo>>) {
      const { payload } = action;
      state.schema = payload;
      state.schemaTimestamp = new Date().toISOString();
      state.results = null;
      state.resultsTimestamp = null;
    },
    setResults(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.results = payload;
      state.resultsTimestamp = new Date().toISOString();
    },
  },
});

export const { setInputData, setResults, setSchema, setSchemaName } = slice.actions;

export default slice.reducer;
