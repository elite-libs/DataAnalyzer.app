import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FieldInfo, TypeSummary } from 'schema-analyzer';

type State = {
  code?: string | null;
  schema?: TypeSummary<FieldInfo> | null;
  results?: string | null;
}

let initialState: State = {
  code: '',
  schema: null,
  results: '',
}

const slice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      const { payload } = action;
      state.code = payload;
    },
    setSchema(state, action: PayloadAction<TypeSummary<FieldInfo>>) {
      const { payload } = action;
      state.schema = payload;
    },
    setResults(state, action: PayloadAction<string>) {
      const { payload } = action;
      state.results = payload;
    },
  },
});

export const { setCode, setResults, setSchema } = slice.actions;

export default slice.reducer;
