import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import copy from 'clipboard-copy';
import Panel from 'components/Layouts/Panel';
import TooltipWrapper from 'components/TooltipWrapper';
import useViewportSize from 'hooks/useViewportSize';
import GetAppIcon from '@material-ui/icons/GetApp';

import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import FileCopy from '@material-ui/icons/FileCopyOutlined';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
// import InputProcessor from './InputProcessor';

import type { Property } from 'csstype';
import type { RootState } from 'store/rootReducer';
import { resetAnalysis } from 'store/analysisSlice';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';

import './CodePreviewPanel.scss';
import { CheckCircleIcon } from '../AppIcons';

export type ICodeGeneratorArgs = {
  language?: string;
  children: ReactNode;
  maxHeight?: Property.Height;
  className?: string;
};

export default function CodePreviewPanel({
  language = 'typescript',
  children,
  className = '',
}: ICodeGeneratorArgs) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useAutoSnackbar();

  const { results } = useSelector((state: RootState) => state.analysisFeature);

  function resetAppState() {
    dispatch(resetAnalysis());
  }

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

  const codeToolbarUi = !results ? null : (
    <ButtonGroup
      variant="contained"
      className={`generated-code-toolbar d-flex align-items-start mt-1 ml-1`}
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
          <div>Reset</div>
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
    </ButtonGroup>
  );

  const isPanelSuccessState = Boolean(results);
  return (
    <Panel
      className={`code-viewer ${
        isPanelSuccessState ? 'panel-success' : 'panel-error'
      } ${className}`.trim()}
      titleComponent={
        <div>
          {
            <CheckCircleIcon
              htmlColor={isPanelSuccessState ? 'green' : 'inherit'}
              fontSize="large"
            />
          }
          <span>Step #3:</span>
        </div>
      }
      subTitle={isPanelSuccessState ? 'Profit!' : 'Generate Code'}
    >
      {results != null ? codeToolbarUi : null}
      <SyntaxHighlighter
        language={language}
        style={ghcolors}
        showLineNumbers={true}
        customStyle={{ margin: 0, overflowY: 'auto' }}
        codeTagProps={{ style: { fontSize: '0.8rem' } }}
      >
        {children}
      </SyntaxHighlighter>
    </Panel>
  );
}
