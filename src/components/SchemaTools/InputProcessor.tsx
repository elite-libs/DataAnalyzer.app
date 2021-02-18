import React from 'react';
import Paper from '@material-ui/core/Paper';
// import { Link, useParams, useHistory } from 'react-router-dom';
// import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
// import Button from '@material-ui/core/Button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'store/rootReducer';
// import CodeViewer from './ResultsView/CodeViewer';

import { resetAnalysis } from 'store/analysisSlice';
import { setInputData } from 'store/appStateSlice';
// import { resetOptions } from 'store/optionsSlice';
// import { resetStatusMessage } from 'store/appStateSlice';

type Props = {
  className?: string;
};

export default function InputProcessor({
  className = 'position-relative w-100 d-flex flex-column align-items-center',
}: Props) {
  const dispatch = useDispatch();
  const { schema } = useSelector((state: RootState) => state.analysisFeature);
  const { parsedInput, inputData } = useSelector(
    (state: RootState) => state.appStateActions,
  );

  const hasParsedInputData = Boolean(schema);
  const hasInputData: boolean =
    inputData != null &&
    (String(inputData).length > 40 || String(inputData).split('\n').length > 5);

  if (hasInputData) className += ' appears-valid';

  // check if we need to show the input disabled, until user resets input.
  if (hasParsedInputData) className += ' disabled';

  const textareaOpts = {
    // rowsMin: hasParsedInputData ? 5 : 10,
    // rowsMax: hasParsedInputData ? 5 : undefined,
    disabled: hasParsedInputData,
  };

  function resetAppState() {
    // dispatch(resetOptions());
    // dispatch(resetStatusMessage());
    dispatch(resetAnalysis());
  }

  return (
    <Paper elevation={3} className={className} style={{ justifyContent: 'stretch' }}>
      <textarea
        style={{ flexGrow: 1, whiteSpace: 'pre-wrap', overflowX: 'auto' }}
        className="w-100 m-0"
        aria-label="Input or Paste your CSV or JSON data"
        placeholder="👉 Paste data here!&#160;👈"
        onChange={(e) => dispatch(setInputData(e.target.value))}
        {...textareaOpts}
        value={inputData!}
      >
        {inputData}
      </textarea>
    </Paper>
  );
}

/*
 */
