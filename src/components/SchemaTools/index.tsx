import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouteLink,
} from 'react-router-dom';

// import { parse } from './adapters/readers';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SchemaExplorer from './ResultsView/SchemaExplorer.js';
// import ChooseInput from './ChooseInput';
import AdvancedOptionsForm from './AdvancedOptionsForm';
import InputProcessor from './InputProcessor';
import CodeViewer from './ResultsView/CodeViewer';
// import { CallbackFn } from 'types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/rootReducer';
// import {
//   // setInputData,
//   // setSchemaName,
//   // setResults,
//   // setSchema,
// } from 'store/analysisSlice';
// import { setStatusMessage } from 'store/appStateSlice';
// import DropdownMenu from './DropdownMenu';
// import { render } from './adapters/writers';

import './index.scss';
import { OutputButtons } from '../../components/OutputButtons';
import { DemoDataMenu } from '../../components/DemoDataMenu';
import AboutPage from '../../AboutPage';
// import { GitHubIcon } from './AppIcons.js';
import { InfoOutlined, GitHub } from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import { render } from './adapters/writers.js';
import { schemaAnalyzer } from '../../schema-analyzer/index';
import { setResults, setSchema } from 'store/analysisSlice.js';

export default function SchemaTools() {
  const dispatch = useDispatch();
  const { inputData, inputTimestamp, results, schemaTimestamp, schemaName } = useSelector(
    (state: RootState) => state.analysisFeature,
    );
    const options = useSelector((state: RootState) => state.optionsActions);
    const { statusMessage } = useSelector(
      (state: RootState) => state.appStateActions,
      );

      // TODO: 1. Process the inputData into structured data with parseCsv() or JSON.parse
      // TODO: 2. Process the structured data into Schema analysis
      // TODO: 3. Convert Schema analysis to flattend types
      // Now ready to choose a template / output script
      useEffect(() => {
        async function fetchData() {
          // You can await here
          const results = await schemaAnalyzer(schemaName!, inputData!, options);
          dispatch(setSchema(results));
        }
        fetchData();
      
        

      }, [inputTimestamp])

      useEffect(() => {
        render({ schemaName, options, writer: options.outputAdapter })()
      }, [inputTimestamp])

  // const [schemaResults, setResults] = React.useState<
  //   TypeSummary<FieldInfo>
  // >();
  // const [schemaName, setSchemaName] = React.useState('Users');
  // const [inputData, setInputData] = React.useState('');
  // const [statusMessage, setStatusMessage] = React.useState('');
  // const [resultsTimestamp, setResultsTimestamp] = React.useState('');

  const schemaLinkProps = schemaTimestamp
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
          <h1 className="col-9">DataStep.io</h1>
          <aside className="icon-button-box col-3 text-right">
            <Button className={'py-2'}>
              <InfoOutlined fontSize="large" color="primary" />
            </Button>
            <Button className={'py-2'}>
              <GitHub fontSize="large" color="primary" />
            </Button>
            <AdvancedOptionsForm />
          </aside>
          <Breadcrumbs
            separator={<NavigateNextIcon />}
            aria-label="breadcrumb"
            className="col-5 pb-2 pl-4"
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
          <DemoDataMenu />
        </nav>

        <Switch>
          <Route path="/" exact>
            <section>
              <InputProcessor />
              <OutputButtons />
              <CodeViewer>
                {results || '// No code to view, please check your settings.'}
              </CodeViewer>
              <footer>{statusMessage}</footer>
            </section>
          </Route>
          <Route path="/about" exact>
            <AboutPage></AboutPage>
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
