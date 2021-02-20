import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Header from 'components/Header';
import HomePage from 'components/HomePage/HomePage';
import LoadingSpinner from 'components/LoadingSpinner';
import useViewportSize from 'hooks/useViewportSize';
import type { RootState } from 'store/rootReducer';

import './index.scss';

const AdvancedOptionsForm = lazy<any>(() => import('./AdvancedOptionsForm'));
const NotFoundPage = lazy<any>(() => import('components/NotFoundPage/NotFoundPage'));
const SchemaExplorerComponent = lazy<any>(() => import('./ResultsView/SchemaExplorer'));
const AboutPage = lazy(() => import('../../AboutPage'));

export default function SchemaTools() {
  // const dispatch = useDispatch();
  // const { trackCustomEvent } = useAnalytics();
  // const { enqueueSnackbar } = useAutoSnackbar();
  // const messages = useAppMessages();

  const { results, schema } = useSelector((state: RootState) => state.analysisFeature);
  // const options = useSelector((state: RootState) => state.optionsActions);
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

  return (
    <>
      <Paper
        className={`current-${breakpoint} ${classModifier} shadow-lg p-3 bg-white rounded`}
      >
        <Router>
          <Header />
          <Suspense fallback={<LoadingSpinner />}>
            <section className="page">
              <Switch>
                <Route path="/" exact>
                  <HomePage />
                </Route>
                <Route path="/options" exact>
                  <AdvancedOptionsForm />
                </Route>
                <Route path="/about" exact>
                  <AboutPage></AboutPage>
                </Route>
                <Route path="/results/explorer">
                  <SchemaExplorerComponent />
                </Route>
                <Route>
                  <NotFoundPage />
                </Route>
              </Switch>
            </section>
          </Suspense>
        </Router>
      </Paper>
    </>
  );
}
