import React from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';
import reportWebVitals from './reportWebVitals';
import App from './App';

ReactDOM.render(
  <div className="App container-xl">
    <App />
  </div>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
