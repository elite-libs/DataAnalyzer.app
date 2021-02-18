import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
// import ReactResizeDetector from 'react-resize-detector';
// import { Ace } from 'ace-builds';
// import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
// import 'ace-builds/src-noconflict/theme-github';
import { useDispatch, useSelector } from 'react-redux';
import { parse } from 'components/SchemaTools/adapters/readers';
import {
  setInputData,
  setParsedInput,
  setParserError,
  setStatusMessage,
} from 'store/appStateSlice';
import { throttle } from 'lodash';

import './CodeEditor.scss';
import { RootState } from 'store/rootReducer';
import { CheckCircleIcon, ErrorIcon } from 'components/SchemaTools/AppIcons';
import TooltipWrapper from 'components/TooltipWrapper';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
// import { Ace } from 'ace-builds';
import { resetAnalysis } from 'store/analysisSlice';

function getJsonParsingErrorLocation(message: string) {
  const lineAndColumnRegEx = /.*line (\d+).+column (\d+).*/;
  const lineAndColNumbers = message
    .replace(lineAndColumnRegEx, '$1,$2')
    .split(',')
    .map(Number);

  return {
    error: message,
    line: lineAndColNumbers[0] || -1,
    column: lineAndColNumbers[1] || -1,
  };
}

export function CodeEditor(props: IAceEditorProps) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useAutoSnackbar();
  let aceRef: AceEditor | null = null;

  // const [dimensions, setDimensions] = React.useState({ height: 'auto', width: 'auto' });
  const { results, schema } = useSelector((state: RootState) => state.analysisFeature);
  const {
    inputData,
    parsedInput,
    parserError,
    statusMessage,
    statusIsError,
  } = useSelector((state: RootState) => state.appStateActions);

  // const getContainerSize = throttle((selector = '.resizable-editor'): DOMRect => {
  //   const el$: HTMLBaseElement = document.querySelector(selector);
  //   if (el$ && el$.getBoundingClientRect) {
  //     return el$.getBoundingClientRect();
  //   }
  //   return {
  //     height: NaN,
  //     width: NaN,
  //     x: NaN,
  //     y: NaN,
  //     top: NaN,
  //     right: NaN,
  //     bottom: NaN,
  //     left: NaN,
  //     toJSON: () => '{}',
  //   };
  // }, 60);

  // const onResize = (w, h) => {
  //   const dim = getContainerSize('.resizable-editor');
  //   setDimensions({
  //     height: `${dim?.height}px` || h,
  //     width: `${dim?.width! - 30}px` || w,
  //   });
  //   console.log({ dimensions });
  // };

  const onChangeUpdateRawData = (newValue) => {
    dispatch(setInputData(newValue));
    // console.log('Updated ', newValue);
    dispatch(resetAnalysis());
    // SEE useEffect below: onChangeParseInput(newValue);
  };
  const onChangeParseInput = throttle(async (newValue) => {
    // reset status & data
    dispatch(setStatusMessage(``));
    dispatch(setParsedInput(null));
    let parsedData: any = null;
    try {
      parsedData = await parse(newValue);
      dispatch(setParsedInput(parsedData));
      if (Array.isArray(parsedData)) {
        dispatch(setStatusMessage(`Success! Parsed ${parsedData.length} rows.`));
      } else if (typeof parsedData === 'object') {
        dispatch(
          setStatusMessage(
            `Success! Parsed Object with ${
              Object.keys(parsedData).length
            } top-level key(s).`,
          ),
        );
      }
    } catch (error) {
      dispatch(setParserError(error.message));
      console.warn('[Normal behavior] Auto-parser failed:', error);
      dispatch(setParsedInput(null));
      dispatch(setStatusMessage(`Invalid input: ${error.message}`));
    }
  }, 200);

  // const interceptEditorEvent = () => {
  //   if (isPanelReadOnly) aceRef?.editor.clearSelection();
  // };

  React.useEffect(() => {
    onChangeParseInput(inputData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData]);

  // const isPanelReadOnly = Boolean(schema && results);
  let stepOneMessage = statusIsError
    ? statusMessage
    : !inputData
    ? 'Paste Data Below'
    : parsedInput
    ? 'Input JSON/CSV below:'
    : 'Verify data is valid';

  let markers: any[] = [];
  if (typeof parserError === 'string' && parserError?.includes('at line ')) {
    const errorMarkerInfo = getJsonParsingErrorLocation(parserError);
    if (errorMarkerInfo.line >= 0) {
      markers.push({
        startRow: errorMarkerInfo.line,
        startCol: 0, //Math.max(errorMarkerInfo.column, 0),
        endRow: errorMarkerInfo.line,
        endCol: errorMarkerInfo.column + 1,
        className: 'error-marker',
        type: 'text',
      });
    }
    console.warn('MARKERS', ...markers);
  }

  return (
    <section
      className={`resizable-editor ${props.className} `}
      // style={{ flex: results ? '1 1 100%' : '1 0 100%' }}
    >
      <legend>
        <div>
          {statusIsError ? (
            <TooltipWrapper tooltipContent={statusMessage}>
              <div
                className="d-inline-block cursor-error"
                onClick={() =>
                  enqueueSnackbar(statusMessage, {
                    variant: 'error',
                    autoHideDuration: 6000,
                  })
                }
              >
                <ErrorIcon className="pulse-error-icon" color="error" fontSize="large" />
              </div>
            </TooltipWrapper>
          ) : (
            <CheckCircleIcon htmlColor="green" fontSize="large" />
          )}
          Step #1:
        </div>
        {stepOneMessage}
      </legend>
      <AceEditor
        placeholder="Paste your JSON or CSV data here!"
        mode="javascript"
        ref={(ref) => (aceRef = ref)}
        markers={markers}
        // theme={isPanelReadOnly ? 'github' : 'monokai'}
        theme={'github'}
        name="code-edit"
        // readOnly={isPanelReadOnly ? true : false}
        // width={dimensions.width}
        width={'100%'}
        height={'100%'}
        fontSize={'0.8rem'}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        onChange={onChangeUpdateRawData}
        className="ace-editor"
        value={props.value}
        style={{
          height: '100%',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'stretch',
          border: '1px solid rgb(221, 221, 221)',
          // cursor: isPanelReadOnly ? 'not-allowed' : 'inherit',
        }}
        // onFocus={interceptEditorEvent}
        // onSelection={interceptEditorEvent}
        // onSelectionChange={interceptEditorEvent}
        // onCursorChange={interceptEditorEvent}
        enableBasicAutocompletion={false}
        enableLiveAutocompletion={false}
        enableSnippets={false}
        editorProps={{
          $blockScrolling: 1,
        }}
        setOptions={{
          maxLines: 50,
          // readOnly: isPanelReadOnly ? true : false,
          useWorker: false,
          wrap: false,
          autoScrollEditorIntoView: false,
          showLineNumbers: true,
          tabSize: 2,
          hScrollBarAlwaysVisible: false,
        }}
      />
    </section>
  );
}
