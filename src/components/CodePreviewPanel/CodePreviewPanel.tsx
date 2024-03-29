import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ts from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import golang from 'react-syntax-highlighter/dist/cjs/languages/prism/go';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';

import ghColors from 'react-syntax-highlighter/dist/cjs/styles/prism/ghcolors';
// import { ghColors } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import copy from 'clipboard-copy';
import Panel from 'components/Layouts/Panel';
// import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import FileCopy from '@material-ui/icons/FileCopyOutlined';
import { CodeOutputIcon } from '../AppIcons';
// import { resetAnalysis } from 'store/analysisSlice';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
import type { Property } from 'csstype';
import type { RootState } from 'store/rootReducer';
import type { SupportedTargetLanguages } from 'types';

import './CodePreviewPanel.scss';
import CodeToolbar, { IToolbarButton } from 'components/CodeToolbar/CodeToolbar';

export type ICodePreviewPanelProps = {
  language?: SupportedTargetLanguages;
  children: ReactNode;
  maxHeight?: Property.Height;
  className?: string;
};

SyntaxHighlighter.registerLanguage('javascript', jsx);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('go', golang);
SyntaxHighlighter.registerLanguage('sql', sql);

export default function CodePreviewPanel({
  language = 'typescript',
  children,
  className = '',
}: ICodePreviewPanelProps) {
  // const dispatch = useDispatch();
  const { enqueueSnackbar } = useAutoSnackbar();

  const { results } = useSelector((state: RootState) => state.analysisFeature);
  const { outputLanguage = 'typescript' } = useSelector(
    (state: RootState) => state.optionsActions,
  );

  // function resetAppState() {
  //   dispatch(resetAnalysis());
  // }

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
  const buttons: IToolbarButton[] = [
    // {
    //   label: 'Clear',
    //   color: 'secondary',
    //   size: 'small',
    //   tooltip: <b>Generate a different output!</b>,
    //   startIcon: <SyncOutlinedIcon />,
    //   onClick: resetAppState,
    // },
    {
      label: 'Copy',
      color: 'primary',
      size: 'small',
      tooltip: <b>Copy to clipboard!</b>,
      startIcon: <FileCopy />,
      onClick: handleCopyClick,
    },
  ];

  const isPanelSuccessState = Boolean(results);
  return (
    <Panel
      disabled={!isPanelSuccessState}
      className={`code-viewer lang-${outputLanguage} ${
        isPanelSuccessState ? 'panel-success' : 'panel-error'
      } ${className}`.trim()}
      titleComponent={
        <div>
          {
            <CodeOutputIcon
              // color={isPanelSuccessState ? 'action' : 'inherit'}
              // htmlColor={isPanelSuccessState ? 'green' : 'inherit'}
              fontSize="large"
              cssColor={
                isPanelSuccessState
                  ? 'var(--color-success)'
                  : 'var(--text-color-disabled)'
              }
            />
          }
          <span>Step #3/3</span>
        </div>
      }
      subTitle={isPanelSuccessState ? 'Profit!' : 'Generate Code'}
    >
      <CodeToolbar buttons={buttons} disabled={isPanelSuccessState ? false : true} />

      <SyntaxHighlighter
        language={outputLanguage}
        style={ghColors}
        showLineNumbers={true}
        customStyle={{ margin: 0, overflowY: 'auto', paddingTop: '1.5rem' }}
        codeTagProps={{ style: { fontSize: '0.8rem' } }}
      >
        {children}
      </SyntaxHighlighter>
    </Panel>
  );
}
