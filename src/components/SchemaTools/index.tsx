import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import LoadingSpinner from 'components/LoadingSpinner';

import { OutputButtons } from '../OutputButtons/OutputButtons';
// import { AdapterNames, render } from './adapters/writers';
// import { schemaAnalyzer } from '../../schema-analyzer/index';

import { setResults, setSchema, resetAnalysis } from 'store/analysisSlice';
import type { RootState } from 'store/rootReducer';
// import { setOptions } from 'store/optionsSlice';
// import { resetStatusMessage } from 'store/appStateSlice';

import './index.scss';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
import { useAnalytics } from 'hooks/useAnalytics';
import useAppMessages from 'hooks/useAppMessages';
import Header from 'components/Header';
import { CodeEditor } from 'components/CodeEditor';
import useViewportSize from 'hooks/useViewportSize';

const CodeViewer = lazy(() => import('./ResultsView/CodeViewer'));
const SchemaExplorerComponent = lazy<any>(() => import('./ResultsView/SchemaExplorer'));
const AboutPage = lazy(() => import('../../AboutPage'));

export default function SchemaTools() {
  // const dispatch = useDispatch();
  // const { trackCustomEvent } = useAnalytics();
  // const { enqueueSnackbar } = useAutoSnackbar();
  // const messages = useAppMessages();

  const { results, schema } = useSelector((state: RootState) => state.analysisFeature);
  const options = useSelector((state: RootState) => state.optionsActions);
  const { parsedInput, inputData } = useSelector(
    (state: RootState) => state.appStateActions,
  );

  // Once user selects a template / output script...
  // 1. Process the inputData into structured data with parseCsv() or JSON.parse
  // 2. Process the structured data into Schema analysis
  // 3. Convert Schema analysis to flattened types

  let classModifier = '';
  let isStackedViewMode = false;
  const { breakpoint } = useViewportSize();
  if (breakpoint && ['xs', 'sm'].includes(breakpoint)) {
    classModifier = 'stacked-view';
    isStackedViewMode = true;
  } else {
    classModifier = '';
    isStackedViewMode = false;
  }

  if (results) classModifier += ' results-loaded';
  if (parsedInput) classModifier += ' parsed-input-loaded';

  let userInstructions =
    parsedInput == null
      ? `Make sure your input data is valid!`
      : `Choose a code generator button to continue!`;

  return (
    <>
      <main
        className={`${classModifier} current-${breakpoint} shadow-lg p-3 m-3 bg-white rounded`}
      >
        <Router>
          <Header />
          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/" exact>
                <section className="page">
                  <>
                    {/* <InputProcessor className="data-input flex-grow-1" /> */}
                    <CodeEditor
                      value={inputData || undefined}
                      // height="80vh"
                      className="col-12 col-md-5 px-0"
                    />
                    <OutputButtons
                      size={isStackedViewMode ? 'small' : 'large'}
                      className="col-12 col-md-2"
                    />
                    <CodeViewer className="col-12 col-md-5 px-0">
                      {results || `// ${userInstructions}`}
                    </CodeViewer>
                  </>
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
