import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FieldInfo, TypeSummary } from '../schema-analyzer';

type State = {
  inputData?: string | null;
  schema?: TypeSummary<FieldInfo> | null;
  results?: string | null;
  schemaName: string | null;
  updatedDate?: Date | null;
};

let initialState: State = {
  inputData: '',
  schema: null,
  schemaName: '',
  results: '',
  updatedDate: null
};

const slice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setInputData(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.inputData = payload;
    },
    setSchemaName(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.schemaName = payload || 'SchemaName';
    },
    setSchema(state, action: PayloadAction<TypeSummary<FieldInfo>>) {
      const { payload } = action;
      state.schema = payload;
    },
    setResults(state, action: PayloadAction<string | undefined | null>) {
      const { payload } = action;
      state.results = payload;
      state.updatedDate = new Date();
    },
  },
});

export const { setInputData, setResults, setSchema, setSchemaName } = slice.actions;

export default slice.reducer;
