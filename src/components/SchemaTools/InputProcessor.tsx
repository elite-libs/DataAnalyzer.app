import React from 'react';
import Paper from '@material-ui/core/Paper';
// import { Link, useParams, useHistory } from 'react-router-dom';
// import Button from '@material-ui/core/Button'
import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from 'store/rootReducer';
import { setInputData, setSchemaName } from 'store/analysisSlice';
import { setStatusMessage } from 'store/appStateSlice';
import { RootState } from 'store/rootReducer';

type Props = {
  className?: string;
};

export default function InputProcessor({ className = '' }: Props) {
  const dispatch = useDispatch();
  const { inputData, results, schema, schemaName } = useSelector(
    (state: RootState) => state.analysisFeature,
  );

  const hasInputData: boolean =
    inputData != null &&
    (String(inputData).length > 40 || String(inputData).split('\n').length > 5);

  // React.useEffect(() => {
  //   loadData()
  // }, [name])

  const textareaOpts = hasInputData ? { rowsMin: 14 } : { rowsMin: 9 };
  if (hasInputData) {
    className += ' appears-valid';
  }
  return (
    <Paper
      elevation={3}
      className={className}
      style={{ display: 'flex', justifyContent: 'stretch' }}
    >
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
    </Paper>
  );
}

/*
 */
