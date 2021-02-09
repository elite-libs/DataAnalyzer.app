import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  statusMessage: string | null;
};

let initialState: State = {
  statusMessage: '© 2020-2021. All trademarks, service marks and company names are the property of their respective owners.',
};

const slice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setStatusMessage(state, action: PayloadAction<string>) {
      const { payload } = action;
      state.statusMessage = payload;
    },
  },
});

const appStateActions = slice.reducer;

export const { setStatusMessage } = slice.actions;

export default appStateActions;
