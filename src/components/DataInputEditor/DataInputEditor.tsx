import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import { useDispatch, useSelector } from 'react-redux';
import { parse } from 'adapters/readers';
import {
  setInputData,
  setParsedInput,
  setParserError,
  setStatusMessage,
} from 'store/appStateSlice';
import { throttle } from 'lodash';

import './DataInputEditor.scss';
import { RootState } from 'store/rootReducer';
import { CheckCircleIcon, ErrorIcon } from 'components/AppIcons';
import TooltipWrapper from 'components/TooltipWrapper';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
// import { Ace } from 'ace-builds';
import { resetAnalysis } from 'store/analysisSlice';
// import { DemoDataMenu } from 'components/DemoDataMenu';
import SchemaNameField from 'components/SchemaNameField';
import Panel from 'components/Layouts/Panel';
import useViewportSize from 'hooks/useViewportSize';

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

export function DataInputEditor(props: IAceEditorProps) {
  let $panelEl = document.querySelector('.data-input-editor');
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useAutoSnackbar();
  // let aceRef: AceEditor | null = null;

  // const [dimensions, setDimensions] = React.useState({ height: 'auto', width: 'auto' });
  // const { results, schema } = useSelector((state: RootState) => state.analysisFeature);
  const {
    inputData,
    parsedInput,
    parserError,
    statusMessage,
    statusIsError,
  } = useSelector((state: RootState) => state.appStateActions);

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

  React.useEffect(() => {
    onChangeParseInput(inputData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData]);

  const viewport = useViewportSize();

  // const getEditorLines = () => {
  //   if ($panelEl) {
  //     const $panelSize = getElementSize('.MuiPaper-root', $panelEl);
  //     const $panelHeader = getElementSize('.panel-header', $panelEl);
  //     const $inputField = getElementSize('.schema-name-input', $panelEl);
  //     const totalHeight = $panelSize?.height;
  //     const panelHeaderHeight = $panelHeader?.height;
  //     const inputFieldHeight = $inputField?.height;
  //     const availableHeight = totalHeight - panelHeaderHeight - inputFieldHeight;
  //     console.info({
  //       lines: availableHeight / 18,
  //       totalHeight,
  //       panelHeaderHeight,
  //       inputFieldHeight,
  //     });
  //     return availableHeight / 18;
  //   } else {
  //     const isSplitView = viewport.width! >= 768;
  //     const heightModifier = isSplitView ? 0.9 : 0.75;
  //     const editorLines = viewport.height! * heightModifier - 132.6;
  //     return editorLines;
  //   }
  // };

  const getEditorLines = () => {
    const isSplitView = viewport.width! >= 768;
    // const heightModifier = isSplitView ? 0.9 : 0.75;
    // const editorLines = viewport.height! * heightModifier - 132.6;
    const getHeightMultiple = (height: number) => {
      if (height > 1200) return 2.5;
      if (height > 1000) return 2;
      if (height > 800) return 1.75;
      if (height > 600) return 1.5;
      if (height > 400) return 1.125;
      return 1;
    };
    return isSplitView ? 18 * getHeightMultiple(viewport.height) : 10;
  };
  const editorLines = getEditorLines();
  console.warn(`EditorLines:`, editorLines);
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
  }

  return (
    <Panel
      className={`data-input-editor ${props.className || ''}`}
      titleComponent={
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
            <CheckCircleIcon
              htmlColor="green"
              color={inputData ? 'inherit' : 'disabled'}
              fontSize="large"
            />
          )}
          <span>Step #1:</span>
        </div>
      }
      subTitle={stepOneMessage}
    >
      <SchemaNameField className="col-md-12 col-sm-12 col-12 pb-2 pl-1" />
      <AceEditor
        placeholder="Paste your JSON or CSV data here!"
        mode="javascript"
        // ref={(ref) => (aceRef = ref)}
        markers={markers}
        // theme={isPanelReadOnly ? 'github' : 'monokai'}
        theme={'github'}
        name="code-edit"
        // readOnly={isPanelReadOnly ? true : false}
        // width={dimensions.width}
        width={'100%'}
        // height={'80vh'}
        fontSize={'0.8rem'}
        showPrintMargin={false}
        showGutter={true}
        // maxLines={(window.innerHeight * 0.4) / 12}
        minLines={4}
        maxLines={6}
        debounceChangePeriod={250}
        highlightActiveLine={true}
        onChange={onChangeUpdateRawData}
        className="ace-editor"
        value={props.value}
        style={{
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
          minLines: 4,
          maxLines: editorLines,
          // maxLines: 50,
          // readOnly: isPanelReadOnly ? true : false,
          useWorker: false,
          wrap: false,
          autoScrollEditorIntoView: false,
          showLineNumbers: true,
          tabSize: 2,
          hScrollBarAlwaysVisible: false,
        }}
      />
    </Panel>
  );
}
