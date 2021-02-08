import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouteLink,
} from 'react-router-dom';

import {
  FieldInfo,
  schemaAnalyzer,
  TypeSummary,
  helpers,
} from '../../schema-analyzer/index';
import { parse } from './adapters/readers';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SchemaExplorer from './ResultsView/SchemaExplorer.js';
// import ChooseInput from './ChooseInput';
import AdvancedOptionsForm from './AdvancedOptionsForm';
import InputProcessor from './InputProcessor';
import CodeViewer from './ResultsView/CodeViewer';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { CallbackFn } from 'types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/rootReducer';
import {
  setInputData,
  setSchemaName,
  setResults,
  setSchema,
} from 'store/analysisSlice';
import { setStatusMessage } from 'store/appStateSlice';
import DropdownMenu from './DropdownMenu';
import { render } from './adapters/writers';
import {
  PostgresIcon,
  MongoDbIcon,
  TypeScriptIcon,
  KnexIcon,
} from './AppIcons.js';
import { setOptions } from 'store/optionsSlice';

import './index.scss';

export default function SchemaTools() {
  const dispatch = useDispatch();
  const { inputData, results, schema, schemaName } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const options = useSelector((state: RootState) => state.optionsActions);
  const { statusMessage } = useSelector(
    (state: RootState) => state.appStateActions,
  );

  // const [schemaResults, setResults] = React.useState<
  //   TypeSummary<FieldInfo>
  // >();
  // const [schemaName, setSchemaName] = React.useState('Users');
  // const [inputData, setInputData] = React.useState('');
  // const [statusMessage, setStatusMessage] = React.useState('');
  // const [resultsTimestamp, setResultsTimestamp] = React.useState('');

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
    if (!filePath) {
      dispatch(setStatusMessage(''));
      dispatch(setInputData(''));
      return;
    }
    dispatch(setInputData(''));
    dispatch(setStatusMessage(`One moment...\nImporting ${name} dataset...`));
    return fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        dispatch(setInputData(data));
        dispatch(setSchemaName(name));
        dispatch(setStatusMessage('Loaded Sample Dataset 🎉'));
      })
      .catch((error) => {
        console.error('ERROR:', error);
        dispatch(
          setStatusMessage(`Oh noes! Failed to load the ${name} dataset.
          Please file an issue on the project's GitHub Issues.`),
        );
      });
  };

  const hasSchemaResults = !!(schema != null && schema?.fields);
  const hasInputData: boolean =
    inputData != null &&
    (String(inputData).length > 40 || String(inputData).split('\n').length > 5);

  const updateSchemaResults = (
    onComplete: CallbackFn<TypeSummary<FieldInfo>, any>,
  ) => {
    return (
      hasInputData &&
      Promise.resolve(inputData!)
        .then(parse)
        .then((data) =>
          schemaAnalyzer(schemaName!, data, {
            onProgress: () => ({}),
            ...options,
          }),
        )
        // .then((value) => console.log(value) || value)
        .then((results) => {
          dispatch(setSchema(results));
          return results;
        })
        .then((results) => {
          setTimeout(() => {
            dispatch(
              setResults(
                render({
                  schemaName: schemaName!,
                  options,
                  writer: options.outputAdapter || 'knex',
                })(results),
              ),
            );
            dispatch(setStatusMessage(`Success!`));
            console.log(results);
            if (onComplete) onComplete(results);
          }, 50);
          return results;
        })
        .catch((error) => {
          dispatch(
            setStatusMessage(
              `Oh noes! We ran into a problem!\n\n  ${error.message}`,
            ),
          );
          console.error(error);
        })
    );
  };

  const schemaLinkProps = hasSchemaResults
    ? {
        // style: { cursor: 'pointer', color: '#469408', fontWeight: '500' },
        className: 'unlocked',
      }
    : {
        disabled: true,
        // style: {
        //   cursor: 'not-allowed',
        //   color: '#77777766',
        //   fontWeight: '200',
        //   textDecoration: 'none',
        // },
        className: 'locked disabled',
        onClick: (e: any) => e.preventDefault(),
      };

  return (
    <main className="shadow-lg p-3 m-5 bg-white rounded">
      <Router>
        <nav className="row row-block w-100">
          <h1 className="col-6">DataStep.io</h1>
          <div className="col-5 text-right">
            <DropdownMenu
              buttonTextOverride="Demo: Choose a Dataset"
              onSelect={loadData}
              options={[
                'Sample Users JSON',
                'Sample People JSON',
                'Sample Listings JSON',
                'Sample Products CSV',
              ]}
            />
          </div>
          <aside className="col-1 text-right">
            <AdvancedOptionsForm options={options} />
          </aside>
          <Breadcrumbs
            separator={<NavigateNextIcon />}
            aria-label="breadcrumb"
            className="col-12 pb-2 pl-4"
          >
            <Link component={RouteLink} color="inherit" to="/">
              Input &amp; Code Generator
            </Link>
            <Link
              component={RouteLink}
              {...schemaLinkProps}
              to="/results/explorer"
            >
              Data Visualization
            </Link>
          </Breadcrumbs>
        </nav>

        <Switch>
          <Route path="/" exact>
            <section>
              <InputProcessor
                inputData={inputData!}
                hasInputData={hasInputData}
              />
              <aside className="output-buttons" style={{ height: '80px' }}>
                <div className="d-flex justify-content-between m-2">
                  <Button
                    onClick={() =>
                      dispatch(
                        setOptions({ ...options, outputAdapter: 'typescript' }),
                      )
                    }
                    variant="outlined"
                    size="medium"
                    color="primary"
                  >
                    <TypeScriptIcon />
                    <div>TypeScript</div>
                  </Button>

                  <button
                    onClick={() =>
                      dispatch(
                        setOptions({ ...options, outputAdapter: 'mongoose' }),
                      )
                    }
                    className="btn btn-success mx-auto"
                  >
                    <MongoDbIcon />
                    <div>
                      MongoDB
                      <br />
                      Mongoose
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      dispatch(
                        setOptions({ ...options, outputAdapter: 'knex' }),
                      )
                    }
                    className="btn btn-info mx-auto"
                  >
                    <KnexIcon />
                    <div>Knex</div>
                  </button>
                  <button
                    onClick={() =>
                      dispatch(
                        setOptions({ ...options, outputAdapter: 'knex' }),
                      )
                    }
                    className="btn btn-info mx-auto"
                  >
                    <PostgresIcon />
                    <div>SQL</div>
                  </button>
                </div>
              </aside>
              <CodeViewer>
                {results
                  ? results
                  : '// No code to view, please check your settings.'}
              </CodeViewer>
              <footer>{statusMessage}</footer>
            </section>
          </Route>
          <Route path="/results/explorer">
            <section>
              <SchemaExplorer schemaResults={results} />
            </section>
          </Route>
        </Switch>
      </Router>
    </main>
  );
}
