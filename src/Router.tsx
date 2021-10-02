import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import HomePage from 'pages/HomePage/HomePage';
import Header from 'components/Header/Header';
import LoadingSpinner from 'components/LoadingSpinner';
import useViewportSize from 'hooks/useViewportSize';
import type { RootState } from 'store/rootReducer';
import SchemaDesigner from 'components/SchemaDesigner/SchemaDesigner';

// import './index.scss';

const AdvancedOptionsForm = lazy<any>(() => import('components/AdvancedOptionsForm'));
const SchemaExplorerComponent = lazy<any>(() => import('components/SchemaExplorer'));
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage'));
const NotFoundPage = lazy<any>(() => import('./pages/NotFoundPage/NotFoundPage'));

function Router() {
  // const dispatch = useDispatch();
  // const { trackCustomEvent } = useAnalytics();
  // const { enqueueSnackbar } = useAutoSnackbar();
  // const messages = useAppMessages();

  const { results } = useSelector((state: RootState) => state.analysisFeature);
  // const options = useSelector((state: RootState) => state.optionsActions);
  const { parsedInput } = useSelector((state: RootState) => state.appStateActions);

  // Once user selects a template / output script...
  // 1. Process the inputData into structured data with parseCsv() or JSON.parse
  // 2. Process the structured data into Schema analysis
  // 3. Convert Schema analysis to flattened types

  let classModifier = '';
  // let isStackedViewMode = false;
  const { breakpoint } = useViewportSize();
  if (breakpoint && ['xs', 'sm'].includes(breakpoint)) {
    classModifier = 'stacked-view';
    // isStackedViewMode = true;
  } else {
    classModifier = '';
    // isStackedViewMode = false;
  }

  if (results) classModifier += ' results-loaded';
  if (parsedInput) classModifier += ' parsed-input-loaded';

  return (
    <Paper
      component="main"
      className={`current-${breakpoint} ${classModifier} shadow-lg p-3 bg-white rounded`}
    >
      <BrowserRouter>
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
              <Route path="/schema/designer">
                <SchemaDesigner />
              </Route>
              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          </section>
        </Suspense>
      </BrowserRouter>
    </Paper>
  );
}

export default Router;
