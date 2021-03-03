import React, { lazy } from 'react';
import type { RootState } from 'store/rootReducer';
import useViewportSize from 'hooks/useViewportSize';
import { OutputButtons } from 'components/OutputButtons/OutputButtons';
import { DataInputEditor } from 'components/DataInputEditor';
import { useSelector } from 'react-redux';
import './HomePage.scss';
const CodePreviewPanel = lazy(() => import('components/CodePreviewPanel'));

/**
 * 3 column layout, where the last 2 can stack vertically on mid-size screens
 * top level has 2 columns with 1/3 and 2/3, so the next child has 50%
 */
export default function HomePage() {
  const { results } = useSelector((state: RootState) => state.analysisFeature);
  // const options = useSelector((state: RootState) => state.optionsActions);
  const { inputData, parsedInput } = useSelector(
    (state: RootState) => state.appStateActions,
  );

  // let classModifier = '';
  let isStackedViewMode = false;
  const { breakpoint } = useViewportSize();
  if (breakpoint && ['xs', 'sm'].includes(breakpoint)) {
    // classModifier = 'stacked-view';
    isStackedViewMode = true;
  } else {
    // classModifier = '';
    isStackedViewMode = false;
  }

  let userInstructions =
    parsedInput == null
      ? `Make sure your input data is valid!`
      : `Click an Output button\n to see some code!`;

  return (
    <section className="home-layout">
      <DataInputEditor value={inputData || undefined} />
      <OutputButtons size={isStackedViewMode ? 'small' : 'large'} className="" />
      <CodePreviewPanel className="">
        {results || `/*\n\n${userInstructions}\n\n*/`}
      </CodePreviewPanel>
    </section>
  );
}
