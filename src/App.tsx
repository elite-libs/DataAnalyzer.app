import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import CustomTheme from './theme/CustomTheme';
import Router from 'Router';
import { SnackbarProvider } from 'notistack';

export default function App() {
  return (
    <Provider store={store}>
      <CustomTheme>
        <SnackbarProvider disableWindowBlurListener={false}>
          <Router />
        </SnackbarProvider>
      </CustomTheme>
    </Provider>
  );
}
