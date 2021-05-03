import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/theme-github';
import { useDispatch, useSelector } from 'react-redux';
import { parse } from 'adapters/readers';
import {
  resetAppState,
  setInputData,
  setParsedInput,
  setParserError,
  setStatusMessage,
} from 'store/appStateSlice';
import filter from 'lodash/filter';
import fromPairs from 'lodash/fromPairs';
import throttle from 'lodash/throttle';

import { RootState } from 'store/rootReducer';
import { CheckCircleIcon, ErrorIcon } from 'components/AppIcons';
import TooltipWrapper from 'components/TooltipWrapper';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
// import { Ace } from 'ace-builds';
import { resetAnalysis, setSchemaName } from 'store/analysisSlice';
// import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import SchemaNameField from 'components/SchemaNameField';
import Panel from 'components/Layouts/Panel';
import useViewportSize from 'hooks/useViewportSize';
import CodeToolbar, { IToolbarButton } from 'components/CodeToolbar/CodeToolbar';
// import ReactAce from 'react-ace/lib/ace';
import { sampleDataSets } from 'components/DemoDataMenu';
import { useAnalytics } from 'hooks/useAnalytics';
import { useHistory } from 'react-router';

import './DataInputEditor.scss';

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
  // let $panelEl = document.querySelector('.data-input-editor');
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useAutoSnackbar();
  // let aceRef: AceEditor | null = null;
  // let aceRef = React.createRef<ReactAce | null | undefined>();

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
  }, 100);

  React.useEffect(() => {
    onChangeParseInput(inputData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData]);

  const viewport = useViewportSize();

  const getEditorLines = () => {
    const isSplitView = viewport.width! >= 800;
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
    return isSplitView ? 18 * getHeightMultiple(viewport.height) : 9;
  };
  const editorLines = getEditorLines();

  // console.warn(`EditorLines:`, editorLines);

  let stepOneMessage = statusIsError
    ? statusMessage
    : !inputData
    ? 'Paste Data Below'
    : parsedInput
    ? 'Input JSON/CSV below'
    : 'Check your data';

  // TODO: make hook/function
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

  //TODO: make into reusable component/class/function
  const { trackCustomEvent } = useAnalytics();
  const history = useHistory();
  const [currentlyLoadingData, setCurrentlyLoadingData] = React.useState<string | null>(
    null,
  );
  const iAmFeelingLucky = () => {
    const rnd = parseInt(`${Math.random() * sampleDataSets.length}`, 10);
    setCurrentlyLoadingData('truthiness');
    setTimeout(() => {
      return loadData(sampleDataSets[rnd]?.schemaName!, sampleDataSets[rnd]?.value!);
    }, 500);
  };

  const loadData = (name: string, filePath: string) => {
    dispatch(setInputData(''));
    setCurrentlyLoadingData(filePath);
    if (!filePath) {
      enqueueSnackbar('Unrecognized option: ' + name + ' ' + filePath, {
        variant: 'warning',
      });
      setCurrentlyLoadingData(null);
      return;
    }
    trackCustomEvent({
      category: 'demoData.import',
      action: 'click',
      label: name,
    });
    // _loadingSnackMessage = enqueueSnackbar(`One moment...\nImporting ${name} dataset...`, {
    //   variant: 'success',
    // });
    return fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        setTimeout(() => (window.location.hash = `demo=${name}`), 1);
        dispatch(setInputData(data));
        dispatch(setSchemaName(name));
        // if (_loadingSnackMessage) closeSnackbar(_loadingSnackMessage);
        // _loadingSnackMessage = null;
        enqueueSnackbar(`Loaded "${name}" Dataset 🎉`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
        });
        history.push('/');
        // setCurrentlyLoadedFile(filePath);
      })
      .catch((error) => {
        console.error('ERROR:', error);
        enqueueSnackbar(
          `Oh noes! Failed to load the ${name} dataset. Please file an issue on the project's GitHub Issues.`,
          { variant: 'error' },
        );
      })
      .finally(() => {
        setCurrentlyLoadingData(null);
      });
  };

  // load specified data set if set in url hash
  React.useLayoutEffect(() => {
    setTimeout(() => {
      const { hash } = window.location;
      const hashParts = fromPairs(
        hash
          .replace(/^#/gm, '')
          .split('&')
          .map((pairs) => pairs.split('=')),
      );
      // console.log({ hash, hashParts });
      if (hashParts['demo']) {
        console.log('loading ', hashParts['demo']);
        const dataToLoad = filter(sampleDataSets, { schemaName: hashParts['demo'] });
        // console.log('dataToLoad', dataToLoad);
        if (dataToLoad && dataToLoad[0])
          loadData(dataToLoad[0].schemaName!, dataToLoad[0].value!);
      }
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buttons: IToolbarButton[] = [
    {
      label: 'Reset All',
      size: 'small',
      color: 'secondary',
      tooltip: <b>Clear all data &amp; keep options!</b>,
      startIcon: <SyncOutlinedIcon />,
      onClick: resetAllAppState,
    },
    {
      label: 'Import Demo Data',
      size: 'small',
      className: 'btn-load-demo',
      tooltip: (
        <>
          <b>Test out random data from real APIs</b>
          <br />
          Roll the dice &amp; see how DataAnalyzer.app handles all kinds of data!
        </>
      ),
      color: 'primary',
      startIcon: (
        <div className="roll-dice-16px-wrapper">
          <div
            className={'roll-dice-16px ' + (currentlyLoadingData ? 'animated' : '')}
          ></div>
        </div>
      ),
      onClick: iAmFeelingLucky,
    },
    // {
    //   label: 'Minimize',
    //   color: 'primary',
    //   tooltip: <b>Hide this panel!</b>,
    //   startIcon: <UnfoldLessIcon />,
    //   onClick: console.log,
    // },
  ];

  function resetAllAppState() {
    // let $aceTextEdit = document.querySelector('.ace_text-input');
    dispatch(resetAnalysis());
    dispatch(resetAppState());
    // $aceTextEdit.va
    dispatch(setInputData('  '));
  }

  return (
    <Panel
      testId="data-input"
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
                <ErrorIcon
                  cssColor="var(--color-error)"
                  className="pulse-error-icon"
                  color="error"
                  fontSize="large"
                />
              </div>
            </TooltipWrapper>
          ) : (
            <CheckCircleIcon
              cssColor="var(--color-success)"
              color={inputData ? 'inherit' : 'disabled'}
              fontSize="large"
            />
          )}
          <span>Step #1/3</span>
        </div>
      }
      subTitle={stepOneMessage}
    >
      <SchemaNameField className="col-md-12 col-sm-12 col-12 pb-2 pl-1" />
      <CodeToolbar buttons={buttons} />
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
        showPrintMargin={true}
        showGutter={true}
        // maxLines={(window.innerHeight * 0.4) / 12}
        // minLines={4}
        // maxLines={6}
        debounceChangePeriod={250}
        highlightActiveLine={true}
        onChange={onChangeUpdateRawData}
        className="ace-editor"
        value={props.value}
        style={{
          // paddingTop: '1.5rem !important',
          // paddingTop: '1.5rem',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'stretch',
          border: '1px solid rgb(221, 221, 221)',
          // cursor: isPanelReadOnly ? 'not-allowed' : 'inherit',
        }}
        // ref={(ref) => void (ref && (aceRef = ref))}
        // onFocus={interceptEditorEvent}
        // onSelection={interceptEditorEvent}
        // onSelectionChange={interceptEditorEvent}
        // onCursorChange={interceptEditorEvent}
        enableBasicAutocompletion={false}
        enableLiveAutocompletion={false}
        enableSnippets={false}
        editorProps={{
          $blockScrolling: true,
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
