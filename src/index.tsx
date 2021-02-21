import React from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store/store';
import CustomTheme, { cssVariablesFromMuiTheme } from './CustomTheme';
import { Theme, withStyles } from '@material-ui/core';
import Router from 'Router';
import { SnackbarProvider } from 'notistack';

ReactDOM.render(
  <div className="App container-xl">
    <Provider store={store}>
      <CustomTheme>
        <SnackbarProvider disableWindowBlurListener={false}>
          <Router />
        </SnackbarProvider>
      </CustomTheme>
    </Provider>
  </div>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
