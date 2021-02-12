import React, { Suspense, lazy } from 'react';
import pkg from '../../../package.json';

import { BrowserRouter as Router, Switch, Route, Link as RouteLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
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

import { setResults, setSchema } from 'store/analysisSlice';
// import { setStatusMessage } from 'store/appStateSlice';

import type { RootState } from 'store/rootReducer';
import { resetAnalysis } from 'store/analysisSlice';
// import { resetOptions } from 'store/optionsSlice';
// import { resetStatusMessage } from 'store/appStateSlice';

import './index.scss';

const CodeViewer = lazy(() => import('./ResultsView/CodeViewer'));
const SchemaExplorerComponent = lazy<any>(() => import('./ResultsView/SchemaExplorer'));
const AboutPage = lazy(() => import('../../AboutPage'));

export default function SchemaTools() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { inputData, results, schemaTimestamp, schemaName, schema } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const options = useSelector((state: RootState) => state.optionsActions);
  // const { statusMessage } = useSelector((state: RootState) => state.appStateActions);

  React.useEffect(() => {
    enqueueSnackbar(
      `© 2020-2021. For educational use. All trademarks, service marks and company names are the property of their respective owners.`,
      { autoHideDuration: 3000, variant: 'default' },
    );
  }, [enqueueSnackbar]);

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
        try {
          // json likely, fast path test using compiled JSON.parse
          const jsonData = JSON.parse(inputData);
          return jsonData;
        } catch (error) {
          enqueueSnackbar(`Data appears to be invalid JSON. Check input and try again.`, {
            variant: 'error',
          });
          return null;
        }
      }
      // try CSV
      const csvData = await parseCsv(inputData); //.catch(() => null);
      return csvData;
    } catch (error) {
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
    if (parsedInputData && parsedInputData.length > 2000) {
      enqueueSnackbar(
        `WARNING: You are processing ${parsedInputData.length} records. It may freeze your browser for a few minutes, this operation has high complexity.`,
        { variant: 'error' },
      );
    } else if (parsedInputData && parsedInputData.length > 500) {
      enqueueSnackbar(
        `Alert: You are trying to process ${parsedInputData.length} records. Your browser may freeze for a moment, but don't worry, it'll finish soon.`,
        { variant: 'warning' },
      );
    }
    return doLoad();
    async function doLoad() {
      const schema = await schemaAnalyzer(schemaName!, parsedInputData!, options).catch((error) => {
        enqueueSnackbar(`${error.message}`, { variant: 'warning' });
      });
      dispatch(setSchema(schema || null));
      return schema ? schema : null;
    }
  }

  async function renderCode() {
    const schema = await getTypeSummary();
    console.log('about to generate code', options.outputAdapter, schema);
    const generatedCode = render({
      schemaName: schemaName!,
      options,
      writer: options.outputAdapter,
    })(schema!);

    dispatch(setResults(generatedCode));
    console.log('generated code', generatedCode);
    return generatedCode;
  }

  async function handleAdapterSelected(adapter?: AdapterNames) {
    const startTime = Date.now();
    console.time(`Processing:${adapter}`);
    try {
      await getTypeSummary();
      await renderCode();
      enqueueSnackbar(`Completed in ${((Date.now() - startTime) / 1000).toFixed(1)} seconds.`, {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      dispatch(setSchema(null));
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error', autoHideDuration: 6000 });
    }
    console.timeEnd(`Processing:${adapter}`);
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
    inputDataMissing:
      inputData == null ? (
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
      enqueueSnackbar(`Copied Source`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(`Error accessing clipboard.`, { variant: 'error' });
    }
  }

  function resetAppState() {
    // dispatch(resetOptions());
    // dispatch(resetStatusMessage());
    dispatch(resetAnalysis());
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
        <TooltipWrapper tooltipContent={<b>Warning: Any input data will be lost</b>}>
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
            <h1 className="col-9 col-sm-10" title="Reset/Load Home Screen" onClick={resetAppState}>
              <a className="brand-link" href="/">
                DataAnalyzer.app
              </a>
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
            {/*  */}
            <Breadcrumbs
              separator={<span className="divider d-md-block d-none">|</span>}
              aria-label="breadcrumb"
              className="col-md-5 col-sm-1 col-12 pb-2 pl-1"
            >
              <Link component={RouteLink} color="inherit" to="/">
                <HomeOutlinedIcon />
                <span className="d-md-inline-block d-none">Code Generator</span>
              </Link>
              <Link component={RouteLink} {...schemaLinkProps} to="/results/explorer">
                <TooltipWrapper tooltipContent={Messages.schemaNeeded}>
                  <div>
                    <AssessmentOutlinedIcon />
                    <span className="d-md-inline-block d-none">Data Visualization</span>
                  </div>
                </TooltipWrapper>
              </Link>
            </Breadcrumbs>
            <DemoDataMenu />
          </nav>

          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/" exact>
                <section>
                  {results == null || results.length < 1 ? (
                    <>
                      <InputProcessor className="flex-grow-1" />
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
