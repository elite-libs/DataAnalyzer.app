import React, { Suspense, lazy } from 'react';
import pkg from '../../../package.json';

import { BrowserRouter as Router, Switch, Route, Link as RouteLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import copy from 'clipboard-copy';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import FileCopy from '@material-ui/icons/FileCopyOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import GitHubIcon from '@material-ui/icons/GitHub';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

import { parseCsv } from 'helpers/parseCsv';

import AdvancedOptionsForm from './AdvancedOptionsForm';
import InputProcessor from './InputProcessor';

import TooltipWrapper from 'components/TooltipWrapper';
import LoadingSpinner from 'components/LoadingSpinner';

import { OutputButtons } from '../../components/OutputButtons';
import { DemoDataMenu } from '../../components/DemoDataMenu';
import { AdapterNames, render } from './adapters/writers';
import { schemaAnalyzer } from '../../schema-analyzer/index';

import { setResults, setSchema, setSchemaName } from 'store/analysisSlice';
// import { setStatusMessage } from 'store/appStateSlice';

import type { RootState } from 'store/rootReducer';
import { resetAnalysis } from 'store/analysisSlice';
// import { setOptions } from 'store/optionsSlice';
// import { resetStatusMessage } from 'store/appStateSlice';

import './index.scss';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
import { FormControl, Input, InputAdornment, InputLabel } from '@material-ui/core';
import { DatabaseEditIcon } from './AppIcons';
import { useAnalytics } from 'hooks/useAnalytics';

const CodeViewer = lazy(() => import('./ResultsView/CodeViewer'));
const SchemaExplorerComponent = lazy<any>(() => import('./ResultsView/SchemaExplorer'));
const AboutPage = lazy(() => import('../../AboutPage'));

export default function SchemaTools() {
  const { trackCustomEvent } = useAnalytics();
  const { enqueueSnackbar } = useAutoSnackbar();
  const dispatch = useDispatch();
  const { inputData, results, schemaTimestamp, schemaName, schema } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const options = useSelector((state: RootState) => state.optionsActions);
  // const { statusMessage } = useSelector((state: RootState) => state.appStateActions);

  // React.useEffect(() => {
  //   enqueueSnackbar(
  //     ``,
  //     { autoHideDuration: 3000, variant: 'default' },
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Once user selects a template / output script...
  // 1. Process the inputData into structured data with parseCsv() or JSON.parse
  // 2. Process the structured data into Schema analysis
  // 3. Convert Schema analysis to flattened types
  async function parseRawText() {
    try {
      if (inputData && inputData.length < 3) {
        enqueueSnackbar(`Check your input. Must be valid JSON or CSV.`, { variant: 'warning' });
        return null;
      }
      if (inputData != null && (inputData[0] === '[' || inputData[0] === '{')) {
        // console.info('inputData JSON ish...');
        try {
          // json likely, fast path test using compiled JSON.parse
          const jsonData = JSON.parse(inputData);
          // console.info('inputData IS TOTES JSON!!!', jsonData);
          trackCustomEvent({
            category: 'parseData.json',
            action: 'success',
            label: String(inputData.length),
          });

          return jsonData;
        } catch (error) {
          trackCustomEvent({
            category: 'parseData.json',
            action: 'fail',
            value: String(error.message),
          });
          enqueueSnackbar(`Data appears to be invalid JSON. Check input and try again.`, {
            variant: 'error',
          });
          return null;
        }
      }
      // try CSV
      const csvData = await parseCsv(inputData); //.catch(() => null);
      trackCustomEvent({
        category: 'parseData.csv',
        action: 'success',
        label: String(csvData.length),
      });

      return csvData;
    } catch (error) {
      trackCustomEvent({
        category: 'parseData.csv',
        action: 'fail',
        value: String(error.message),
      });
      enqueueSnackbar(`Check your input. Must be valid JSON or CSV. ${error.message}`, {
        variant: 'warning',
      });
      console.log(`Parsing error:`, error);
    }
    enqueueSnackbar(`Check your input. Must be valid JSON or CSV.`, { variant: 'warning' });
    return null;
    //throw Error('Invalid data');
  }

  async function getTypeSummary() {
    const parsedInputData = await parseRawText();
    // warn on big-ish data
    if (parsedInputData && parsedInputData.length > 4000) {
      enqueueSnackbar(
        `WARNING: You are processing ${parsedInputData.length} records. It may freeze your browser for a few minutes, this operation has high complexity.`,
        { variant: 'error' },
      );
      trackCustomEvent({
        category: 'analysis.pre',
        action: 'warn',
        label: `large_data_set_warning`,
        value: String(parsedInputData.length),
      });
    }
    //  else if (parsedInputData && parsedInputData.length > 500) {
    //   enqueueSnackbar(
    //     `Alert: You are trying to process ${parsedInputData.length} records. Your browser may freeze for a moment, but don't worry, it'll finish soon.`,
    //     { variant: 'warning' },
    //   );
    // }
    return doLoad();
    async function doLoad() {
      const schema = await schemaAnalyzer(schemaName!, parsedInputData!, options);
      // .catch((error) => {
      //   enqueueSnackbar(`${error.message}`, { variant: 'warning' });
      // });
      dispatch(setSchema(schema || null));
      return schema ? schema : null;
    }
  }

  async function renderCode(outputAdapter = options.outputAdapter) {
    const schema = await getTypeSummary();
    console.log('about to generate code', outputAdapter, schema);
    const generatedCode = render({
      schemaName: schemaName!,
      options,
      writer: outputAdapter,
    })(schema!);

    dispatch(setResults(generatedCode));
    console.info('generated code', generatedCode);
    return generatedCode;
  }

  async function handleAdapterSelected(adapter?: AdapterNames) {
    const startTime = Date.now();
    // console.time(`Processing:${adapter}`);
    try {
      await renderCode(adapter);
      trackCustomEvent({
        category: 'analysis.results',
        action: 'success',
        label: `${adapter}.runtime`,
        value: ((Date.now() - startTime) / 1000).toFixed(4),
      });

      enqueueSnackbar(`Completed in ${((Date.now() - startTime) / 1000).toFixed(1)} seconds.`, {
        variant: 'success',
      });
    } catch (error) {
      trackCustomEvent({
        category: 'analysis.results',
        action: 'fail',
        value: error.message,
      });
      console.error(`Error: Couldn't process input data!`, error);
      dispatch(setSchema(null));
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error', autoHideDuration: 6000 });
    }
    // console.timeEnd(`Processing:${adapter}`);
  }

  const schemaLinkProps = schemaTimestamp
    ? { className: 'unlocked' }
    : {
        disabled: true,
        className: 'locked disabled',
        onClick: (e: any) => e.preventDefault(),
      };

  // Create any labels & user instructions
  const Messages = {
    inputDataMissing: !inputData ? (
      <div>
        <AnnouncementIcon color="action" />
        <b>No input data.</b>
        <br />
        Either use the Sample Dataset buttons, OR paste your own data in the textbox.
      </div>
    ) : null,
    schemaNeeded:
      schemaTimestamp == null ? (
        <div>
          <AnnouncementIcon color="disabled" />
          <b>Choose a Formatter</b>
          <br />
          Click on one of the code formatter buttons to continue!
        </div>
      ) : null,
  };

  async function handleCopyClick() {
    try {
      if (typeof results === 'string') await copy(results);
      enqueueSnackbar(`Copied Code`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(`Clipboard access denied! Try manually copying the code.`, {
        variant: 'error',
      });
    }
  }

  function resetAppState() {
    dispatch(resetAnalysis());
  }
  function resetResults() {
    dispatch(setSchema(null));
    dispatch(setResults(null));
  }

  const codeToolbarUi = !results ? null : (
    <div
      style={{ zIndex: 50, position: 'relative', opacity: 0.82 }}
      className={`d-flex align-items-start mt-1 ml-1`}
    >
      <Button
        size="small"
        color="secondary"
        variant={'contained'}
        startIcon={<SyncOutlinedIcon />}
        onClick={resetAppState}
        style={{}}
      >
        <TooltipWrapper tooltipContent={<b>Generate a different output!</b>}>
          <div>Reset &amp; Start Over</div>
        </TooltipWrapper>
      </Button>
      <Button
        size="small"
        variant="contained"
        color="primary"
        title="Copy source"
        onClick={handleCopyClick}
        startIcon={<FileCopy />}
      >
        <TooltipWrapper tooltipContent={<b>Copy to clipboard</b>}>
          <div>Copy</div>
        </TooltipWrapper>
      </Button>
    </div>
  );

  return (
    <>
      <main className="shadow-lg p-3 m-3 bg-white rounded">
        <Router>
          <nav className="row row-block w-100">
            <h1 className="col-9 col-sm-10" title="Reset/Load Home Screen">
              <Link className="brand-link" component={RouteLink} to="/" onClick={resetResults}>
                <img src="/images/DataAnalyzerDualColor.svg" alt="Data Analyzer app icon" />
                DataAnalyzer.app
              </Link>
            </h1>
            <aside className="icon-button-box col-3 col-sm-2 text-right">
              <Link className={'py-2 mx-2'} component={RouteLink} to="/about" title="View README">
                <InfoOutlinedIcon fontSize="small" color="action" />
              </Link>
              <Link className={'py-2 mx-2'} target="_blank" href={pkg.repository.url}>
                <GitHubIcon fontSize="small" color="action" />
              </Link>
              <AdvancedOptionsForm />
            </aside>
            {!results ? (
              <FormControl className="col-md-4 col-sm-5 col-12 pb-2 pl-1">
                <TooltipWrapper
                  tooltipContent={
                    <>
                      <b>Label your dataset</b>
                      <br />
                      Used as a prefix for any nested data structures.
                      <br />
                      <b>Examples:</b> Customer, Product, Articles, etc.
                    </>
                  }
                >
                  <InputLabel htmlFor="schema-name">Schema Name</InputLabel>
                </TooltipWrapper>
                <Input
                  id="schema-name"
                  onChange={(e) => dispatch(setSchemaName(e.target.value))}
                  value={schemaName}
                  startAdornment={
                    <InputAdornment position="start">
                      <DatabaseEditIcon width="1.5rem" height="1.5rem" />
                    </InputAdornment>
                  }
                />
              </FormControl>
            ) : (
              <Breadcrumbs
                separator={<span className="divider d-md-block d-none">|</span>}
                aria-label="breadcrumb"
                className="col-md-4 col-sm-5 col-12 pb-2 px-1"
              >
                <Link component={RouteLink} color="inherit" to="/" onClick={resetResults}>
                  <HomeOutlinedIcon />
                  <span className="d-md-inline-block d-none">Code Generator</span>
                </Link>
                <Link component={RouteLink} {...schemaLinkProps} to="/results/explorer">
                  <TooltipWrapper
                    tooltipContent={Messages.inputDataMissing || Messages.schemaNeeded}
                  >
                    <div>
                      <AssessmentOutlinedIcon />
                      <span className="d-md-inline-block d-none">Data Visualization</span>
                    </div>
                  </TooltipWrapper>
                </Link>
              </Breadcrumbs>
            )}
            <DemoDataMenu />
          </nav>

          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/" exact>
                <section>
                  {results == null || results.length < 1 ? (
                    <>
                      <InputProcessor className="data-input flex-grow-1" />
                      <OutputButtons onChange={handleAdapterSelected} />
                    </>
                  ) : (
                    <>
                      {codeToolbarUi}
                      <CodeViewer className="flex-grow-1">
                        {results || '// No code to view, please check your settings.'}
                      </CodeViewer>
                    </>
                  )}
                </section>
              </Route>
              <Route path="/about" exact>
                <section>
                  <AboutPage></AboutPage>
                </section>
              </Route>
              <Route path="/results/explorer">
                <section>
                  <SchemaExplorerComponent schemaResults={schema} />
                </section>
              </Route>
            </Switch>
          </Suspense>
        </Router>
      </main>
    </>
  );
}
