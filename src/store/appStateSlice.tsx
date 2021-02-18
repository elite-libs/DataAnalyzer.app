import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  statusMessage: string | null;
  parsedInput?: any | any[];
  inputData?: string | null;
  // inputTimestamp?: number | null;
};

let initialState: State = {
  statusMessage: 'Ready for your data',
  parsedInput: undefined,
  inputData: '',
};

const slice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setStatusMessage(state, action: PayloadAction<string>) {
      const { payload } = action;
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
      state.parsedInput = action.payload;
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
} = slice.actions;

export default appStateActions;
