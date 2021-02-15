import React from 'react';
import { Button } from '@material-ui/core';
import {
  OptionsObject,
  ProviderContext,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar,
} from 'notistack';
export function useAutoSnackbar(): ProviderContext {
  let snackbar = useSnackbar();
  const enqueueSnackbar: ProviderContext['enqueueSnackbar'] = React.useCallback(
    function enqueueSnackbar(message: SnackbarMessage, options?: OptionsObject) {
      let snackId: SnackbarKey = '';
      options = options || {};

      if (!options.anchorOrigin) {
        options.anchorOrigin = { horizontal: 'right', vertical: 'top' };
      }
      if (!options?.action) {
        options.action = (
          <Button
            className="snack-close"
            aria-label="Close"
            onClick={() => snackbar.closeSnackbar(snackId)}
          >
            X
          </Button>
        );
      }
      snackId = snackbar.enqueueSnackbar(message, options);
      return snackId;
    },
    [snackbar],
  );
  return {
    closeSnackbar: snackbar.closeSnackbar,
    enqueueSnackbar,
  };
}
