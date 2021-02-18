import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  statusMessage: string | null;
  statusIsError?: boolean;
  parsedInput?: any | any[];
  inputData?: string | null;
  parserError?: string;
  // inputTimestamp?: number | null;
};

let initialState: State = {
  statusMessage: 'Ready for your data',
  statusIsError: false,
  parsedInput: undefined,
  inputData: '',
  parserError: undefined,
};

const slice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setStatusMessage(state, action: PayloadAction<string>) {
      const { payload } = action;
      state.statusIsError =
        /Invalid/gim.test(`${payload}`) || /Error/gim.test(`${payload}`);
      state.statusMessage = payload;
    },
    setInputData(state, action: PayloadAction<string | undefined | null>) {
      let { payload } = action;
      payload = `${payload}`.trim();
      if (payload === state.inputData) return;
      state.inputData = payload;
      return state;
    },
    setParsedInput(state, action: PayloadAction<any>) {
      if (action.payload != null) {
        state.parsedInput = action.payload;
        state.parserError = undefined;
      }
      return state;
    },
    setParserError(state, action: PayloadAction<string>) {
      state.parserError = action.payload;
      return state;
    },
    resetAppState(state) {
      state = { ...initialState };
      return state;
    },
  },
});

const appStateActions = slice.reducer;

export const {
  setStatusMessage,
  resetAppState,
  setParsedInput,
  setInputData,
  setParserError,
} = slice.actions;

export default appStateActions;
