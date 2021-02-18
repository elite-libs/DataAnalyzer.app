import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
// import ReactResizeDetector from 'react-resize-detector';
// import { Ace } from 'ace-builds';
// import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { useDispatch, useSelector } from 'react-redux';
import { parse } from 'components/SchemaTools/adapters/readers';
import { setInputData, setParsedInput, setStatusMessage } from 'store/appStateSlice';
import { throttle } from 'lodash';

import './CodeEditor.scss';
import { RootState } from 'store/rootReducer';

export function CodeEditor(props: IAceEditorProps) {
  const dispatch = useDispatch();
  const [dimensions, setDimensions] = React.useState({ height: 'auto', width: 'auto' });
  const { results, schema } = useSelector((state: RootState) => state.analysisFeature);
  const { inputData } = useSelector((state: RootState) => state.appStateActions);

  const getContainerSize = throttle((selector = '.resizable-editor'): DOMRect => {
    const el$: HTMLBaseElement = document.querySelector(selector);
    if (el$ && el$.getBoundingClientRect) {
      return el$.getBoundingClientRect();
    }
    return {
      height: NaN,
      width: NaN,
      x: NaN,
      y: NaN,
      top: NaN,
      right: NaN,
      bottom: NaN,
      left: NaN,
      toJSON: () => '{}',
    };
  }, 60);

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
    console.log('Updated ', newValue);
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
      console.warn('[Normal behavior] Auto-parser failed:', error);
      dispatch(setParsedInput(null));
      dispatch(setStatusMessage(`Invalid JSON or CSV input: ${error.message}`));
    }
  }, 1000);

  React.useEffect(() => {
    onChangeParseInput(inputData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData]);

  return (
    <section
      className={`resizable-editor ${props.className}`}
      style={{ flex: results ? '0 0 20%' : '1 0 40%' }}
    >
      <legend>
        <div>Step #1:</div>Paste Data Here
      </legend>
      <AceEditor
        placeholder="Paste your JSON or CSV data here!"
        mode="javascript"
        theme="monokai"
        name="code-edit"
        readOnly={schema && results ? true : false}
        // width={dimensions.width}
        width={'100%'}
        height={dimensions.height}
        fontSize={12}
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
        }}
        enableBasicAutocompletion={false}
        enableLiveAutocompletion={false}
        enableSnippets={false}
        setOptions={{
          useWorker: false,
          wrap: true,
          autoScrollEditorIntoView: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </section>
  );
}
