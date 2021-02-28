import React from 'react';
import { createMuiTheme, Theme, ThemeProvider } from '@material-ui/core/styles';
// import {
//   purple,
//   lightBlue,
//   pink,
//   teal,
//   red,
//   orange,
//   deepPurple,
// } from '@material-ui/core/colors';

export const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#607d8b',
    },
    info: {
      main: '#64b5f6',
    },
    success: {
      main: '#009600',
    },
    error: {
      main: '#f50057cc',
    },
    warning: {
      main: '#ef6c00',
    },
    background: {
      default: '#d0d0d0',
    },
    text: {
      primary: '#3a3a3a',
      secondary: '#414141cc',
      disabled: '#9a9a9add',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  // status: {
  //   danger: orange[500],
  // },
});

// const getObjectPrefix = ({prefix, nextKey, obj}: {prefix: string, nextKey: string, obj: object}) => {
//   [].flatMap()
//   getObjectPrefix('')
// }

export const cssVariablesFromMuiTheme = (theme: Theme = muiTheme) => (
  <style>{`    :root: {
      --color-primary: ${theme.palette.primary.main};
      --color-secondary: ${theme.palette.secondary.main};
      --color-success: ${theme.palette.success.main};
      --color-info: ${theme.palette.info.main};
      --color-warning: ${theme.palette.warning.main};
      --color-error: ${theme.palette.error.main};
      --color-background: ${theme.palette.background.default};
    }
`}</style>
);

export default function CustomTheme({ children }) {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
