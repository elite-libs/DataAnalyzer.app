import React from 'react';
import Paper from '@material-ui/core/Paper';
// import { Link, useParams, useHistory } from 'react-router-dom';
// import Button from '@material-ui/core/Button'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { CallbackFn } from 'types';
import { FieldInfo, TypeSummary } from '../../schema-analyzer';
import { JsxElement } from 'typescript';
import { useDispatch } from 'react-redux';
// import { RootState } from 'store/rootReducer';
import {
  setInputData,
  setSchemaName,
} from 'store/analysisSlice';
import { setStatusMessage } from 'store/appStateSlice';

type Props = {
  hasInputData: boolean;
  displayStatus: CallbackFn<TypeSummary<FieldInfo> | undefined, JsxElement | any>;
  inputData: string;
  className?: string;
}

export default function InputProcessor({
  hasInputData,
  displayStatus,
  inputData = '',
  className = '',
}: Props) {
  const dispatch = useDispatch();
  // const { inputData, results, schema, schemaName } = useSelector(
  //   (state: RootState) => state.analysisFeature,
  // );

  // const history = useHistory();

  const loadData = (name: string) => {
    let filePath = '';
    if (/products/i.test(name)) {
      filePath = 'products-3000.csv';
      name = 'products';
    }
    if (/listings/i.test(name)) {
      filePath = 'real-estate.example.json';
      name = 'listings';
    }
    if (/people/i.test(name)) {
      filePath = 'swapi-people.json';
      name = 'people';
    }
    if (/users/i.test(name)) {
      filePath = 'users.example.json';
      name = 'users';
    }
    if (!filePath) return '';
    dispatch(setSchemaName(name));
    dispatch(setStatusMessage(`One moment...\nImporting ${name} dataset...`));
    return fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        // setSchemaName(name)
        dispatch(setInputData(data));
      })
      .catch((error) => {
        console.error('ERROR:', error);
        dispatch(setStatusMessage(`Oh noes! Failed to load the ${name} dataset.
            Please file an issue on the project's GitHub Issues.`));
      });
  };

  // React.useEffect(() => {
  //   loadData()
  // }, [name])

  const textareaOpts = hasInputData ? { rowsMin: 14 } : { rowsMin: 9 };
  if (hasInputData) {
    className += ' appears-valid';
  }
  return (
    <Paper elevation={3} className={className}>
      <section className="position-relative w-100 d-flex flex-column align-items-center justify-content-center ">
        {displayStatus(() => console.log('/results/code/knex'))}

        <TextareaAutosize
          className="col s12 l12 border-0 m-1 p-1"
          aria-label="Input or Paste your CSV or JSON data"
          placeholder='Paste your data here, or click "Start Here" to choose a Sample Data Set'
          value={inputData}
          onChange={(e) => dispatch(setInputData(e.target.value))}
          {...textareaOpts}
        />
        {/* {children} */}
      </section>
    </Paper>
  );
}

/*
 */
