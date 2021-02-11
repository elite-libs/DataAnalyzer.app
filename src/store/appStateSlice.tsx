import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  statusMessage: string | null;
};

let initialState: State = {
  statusMessage:
    '© 2020-2021. For educational use. All trademarks, service marks and company names are the property of their respective owners.',
};

const slice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setStatusMessage(state, action: PayloadAction<string>) {
      const { payload } = action;
      state.statusMessage = payload;
    },
    resetStatusMessage(state) {
      state.statusMessage = initialState.statusMessage;
      return state;
    },
  },
});

const appStateActions = slice.reducer;

export const { setStatusMessage, resetStatusMessage } = slice.actions;

export default appStateActions;
