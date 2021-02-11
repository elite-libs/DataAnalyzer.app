import React from 'react';
import Paper from '@material-ui/core/Paper';
// import { Link, useParams, useHistory } from 'react-router-dom';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import Button from '@material-ui/core/Button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'store/rootReducer';
import CodeViewer from './ResultsView/CodeViewer';

import { resetAnalysis, setInputData } from 'store/analysisSlice';
import { resetOptions } from 'store/optionsSlice';
import { resetStatusMessage } from 'store/appStateSlice';

type Props = {
  className?: string;
};

export default function InputProcessor({ className = '' }: Props) {
  const dispatch = useDispatch();
  const { inputData, schema } = useSelector((state: RootState) => state.analysisFeature);

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
    dispatch(resetOptions());
    dispatch(resetStatusMessage());
    dispatch(resetAnalysis());
  }

  return (
    <Paper
      elevation={3}
      className={className}
      style={{ display: 'flex', justifyContent: 'stretch' }}
    >
      {hasParsedInputData ? (
        <>
          <div
            style={{ zIndex: 500, position: 'relative', opacity: 0.88 }}
            className={`d-flex justify-content-center align-items-center position-absolute`}
          >
            <Button
              size="small"
              color="secondary"
              variant={'contained'}
              startIcon={<SyncOutlinedIcon />}
              onClick={resetAppState}
              style={{ transform: 'translateY(1.3rem) translateX(40ch)' }}
            >
              Reset / Start Over
            </Button>
          </div>
          <CodeViewer maxHeight={'15vh'}>{inputData}</CodeViewer>
        </>
      ) : (
        <section
          className="position-relative w-100 d-flex flex-column align-items-center"
          style={{ justifyContent: 'stretch', height: '120px' }}
        >
          <textarea
            style={{ flexGrow: 1, whiteSpace: 'pre-wrap', overflowX: 'auto' }}
            className="w-100 border-0 m-1 p-1"
            aria-label="Input or Paste your CSV or JSON data"
            placeholder="👉 Paste data here!&#160;👈"
            onChange={(e) => dispatch(setInputData(e.target.value))}
            {...textareaOpts}
            value={inputData!}
          >
            {inputData}
          </textarea>
        </section>
      )}
    </Paper>
  );
}

/*
 */
