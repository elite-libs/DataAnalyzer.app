// see https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/176#issuecomment-683150213

// @ts-expect-error
global.$RefreshReg$ = () => {};
// @ts-expect-error
global.$RefreshSig$ = () => () => {};
