import React from 'react';
import { createMuiTheme, Theme, ThemeProvider } from '@material-ui/core/styles';
import { purple, lightBlue, pink, teal, red } from '@material-ui/core/colors';

export const muiTheme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: lightBlue['500'],
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      // light: teal['500'],
      // light: '#0066ff',
      main: purple['500'], //'#0044ff',
      // // dark: will be calculated from palette.secondary.main,
      // contrastText: '#ffcc00',
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
