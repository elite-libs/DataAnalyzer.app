import React, { Suspense, Fragment, lazy } from 'react';
import { BrowserRouter as Router, Switch, Route, Link as RouteLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import GitHubIcon from '@material-ui/icons/GitHub';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

import { parseCsv } from 'helpers/parseCsv';

import AdvancedOptionsForm from './AdvancedOptionsForm';
import InputProcessor from './InputProcessor';

import { OutputButtons } from '../../components/OutputButtons';
import { DemoDataMenu } from '../../components/DemoDataMenu';
import { AdapterNames, render } from './adapters/writers';
import { schemaAnalyzer } from '../../schema-analyzer/index';

import { setResults, setSchema } from 'store/analysisSlice';
import { setStatusMessage } from 'store/appStateSlice';

import type { RootState } from 'store/rootReducer';
import type { Dictionary } from 'types';

import './index.scss';

const CodeViewer = lazy(() => import('./ResultsView/CodeViewer'));
const SchemaExplorer = lazy(() => import('./ResultsView/SchemaExplorer.js'));
const AboutPage = lazy(() => import('../../AboutPage'));

export default function SchemaTools() {
  const dispatch = useDispatch();
  const { inputData, inputTimestamp, results, schemaTimestamp, schemaName, schema } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const options = useSelector((state: RootState) => state.optionsActions);
  const { statusMessage } = useSelector((state: RootState) => state.appStateActions);
  const [parsedInputData, setParsedInputData] = React.useState<Dictionary<any>[] | null>(null);

  // Once user selects a template / output script...
  // 1. Process the inputData into structured data with parseCsv() or JSON.parse
  // 2. Process the structured data into Schema analysis
  // 3. Convert Schema analysis to flattend types
  async function parseRawText(inputData?: string) {
    try {
      if (inputData && inputData.length < 3) {
        dispatch(setStatusMessage(`Check your input. Must be valid JSON or CSV.`));
        setParsedInputData(null);
      }
      if (inputData != null && (inputData[0] === '[' || inputData[0] === '{')) {
        // json likely, fast path test using compiled JSON.parse
        const jsonData = JSON.parse(inputData);
        setParsedInputData(jsonData as any[]);
      }
      // try CSV
      const csvData = await parseCsv(inputData); //.catch(() => null);
      if (csvData != null) setParsedInputData(csvData);
    } catch (error) {
      dispatch(setStatusMessage(`Check your input. Must be valid JSON or CSV. ${error.message}`));
      console.log(`Parsing error:`, error);
    }
    dispatch(setStatusMessage(`Check your input. Must be valid JSON or CSV.`));
    setParsedInputData(null);
    return null;
    //throw Error('Invalid data');
  }

  async function getTypeSummary() {
    const results = await schemaAnalyzer(schemaName!, parsedInputData!, options).catch((error) => {
      dispatch(setStatusMessage(`${error.message}`));
    });
    dispatch(setSchema(results || null));
    return results;
  }

  async function renderCode() {
    const generatedCode = render({
      schemaName: schemaName!,
      options,
      writer: options.outputAdapter,
    })(schema!);

    dispatch(setResults(generatedCode));
    return generatedCode;
  }

  async function handleAdapterSelected(adapter?: AdapterNames) {
    const startTime = Date.now();
    console.time(`Processing:${adapter}`);
    await parseRawText().catch(console.error);
    await getTypeSummary().catch(console.error);
    await renderCode().catch(console.error);
    console.timeEnd(`Processing:${adapter}`);
    dispatch(
      setStatusMessage(`Completed in ${((Date.now() - startTime) / 1000).toFixed(1)} seconds.`),
    );
  }

  const schemaLinkProps = schemaTimestamp
    ? { className: 'unlocked' }
    : {
        disabled: true,
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
              <InfoOutlinedIcon fontSize="large" color="primary" />
            </Button>
            <Button className={'py-2 mr-2'}>
              <GitHubIcon fontSize="large" color="primary" />
            </Button>
            <AdvancedOptionsForm />
          </aside>
          <Breadcrumbs
            separator={<NavigateNextIcon />}
            aria-label="breadcrumb"
            className="col-5 pb-2 pl-4"
          >
            <Link component={RouteLink} color="inherit" to="/">
              <HomeOutlinedIcon />
              Code Generator
            </Link>
            <Link component={RouteLink} {...schemaLinkProps} to="/results/explorer">
              <AssessmentOutlinedIcon />
              Data Visualization
            </Link>
          </Breadcrumbs>
          <DemoDataMenu />
        </nav>

        <Suspense fallback={<Fragment />}>
          <Switch>
            <Route path="/" exact>
              <section>
                <InputProcessor />
                <OutputButtons onChange={handleAdapterSelected} />
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
        </Suspense>
      </Router>
    </main>
  );
}
