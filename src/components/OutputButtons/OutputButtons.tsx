import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/rootReducer';
import Button from '@material-ui/core/Button';
import {
  PostgresIcon,
  MongoDbIcon,
  TypeScriptIcon,
  KnexIcon,
  GoLangIcon,
  GetAppIcon,
} from 'components/AppIcons';

import { AdapterNames, render } from 'adapters/writers';
// import { schemaAnalyzer } from 'schema-analyzer/index';
import { OptionsState, setOptions } from 'store/optionsSlice';
import { setResults, setSchema } from 'store/analysisSlice';
import { setParserError, setAnalysisProgress } from 'store/appStateSlice';
import { useAnalytics } from 'hooks/useAnalytics';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
import { ButtonGroup } from '@material-ui/core';

import Panel from 'components/Layouts/Panel';
import TooltipWrapper from 'components/TooltipWrapper';
import useViewportSize from 'hooks/useViewportSize';
// import GetAppIcon from '@material-ui/icons/GetApp';
import { SupportedTargetLanguages } from 'types';

import './OutputButtons.scss';
import { schemaAnalyzerWorker } from 'schema-analyzer/schema-analyzer-worker';
// import LinearWithValueLabel from 'components/ProgressBar';

type OutputMode = [
  adapterKey: AdapterNames,
  label: string,
  highlightLanguage: SupportedTargetLanguages,
  icon: React.ReactNode,
];

const outputOptions: OutputMode[] = [
  ['typescript', 'TypeScript', 'typescript', <TypeScriptIcon />],
  ['golang', 'GoLang', 'go', <GoLangIcon />],
  ['knex', 'Knex', 'typescript', <KnexIcon />],
  ['mongoose', 'Mongoose (MongoDB)', 'typescript', <MongoDbIcon />],
  ['sql', 'SQL "CREATE"', 'sql', <PostgresIcon />],
];

type Props = {
  // onChange?: (adapter?: AdapterNames) => any;
  className?: string;
  size?: 'small' | 'medium' | 'large';
};

export const OutputButtons = ({ size = 'medium', className = '' }: Props) => {
  const { breakpoint } = useViewportSize();
  const { trackCustomEvent } = useAnalytics();
  const { enqueueSnackbar } = useAutoSnackbar();

  const dispatch = useDispatch();
  const { inputData, parsedInput } = useSelector(
    (state: RootState) => state.appStateActions,
  );
  const { results, schemaName } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const options = useSelector<RootState, OptionsState>(
    (state: RootState) => state.optionsActions,
  );
  const hasParsedInputData = Boolean(results);
  // console.log({ hasParsedInputData });
  const schemaLinkProps = inputData
    ? {
        className: 'unlocked',
      }
    : {
        disabled: true,
        className: 'locked disabled',
        onClick: (e: any) => e.preventDefault(),
      };
  async function getTypeSummary() {
    const parsedInputData = parsedInput;
    // warn on big-ish data
    if (Array.isArray(parsedInputData) && parsedInputData.length > 4000) {
      enqueueSnackbar(
        `WARNING: You are processing ${parsedInputData.length} records. It may freeze your browser for a few minutes, this operation has high complexity.`,
        { variant: 'error' },
      );
      trackCustomEvent({
        action: 'warn',
        category: 'analysis.results',
        label: `large_data_set_warning`,
        value: parsedInputData.length,
      });
    }
    const schema = await schemaAnalyzerWorker(
      schemaName!,
      parsedInputData!,
      {
        ...options,
      },
      (totalRows, currentRow) => {
        const completionPercent = (currentRow / totalRows) * 100;
        if (completionPercent % 2 === 0) console.log(`progress ${completionPercent}`);
        dispatch(setAnalysisProgress(completionPercent || 0));
      },
    );
    dispatch(setSchema(schema || null));
    return schema ? schema : null;
  }
  async function renderCode(outputAdapter = options.outputAdapter) {
    const schema = await getTypeSummary();
    console.log('about to generate', outputAdapter, schema?.flatTypeSummary);
    const generatedCode = render(outputAdapter, schema!);

    dispatch(setResults(generatedCode));
    // console.info('generated code', generatedCode);
    return generatedCode;
  }
  async function handleAdapterSelected(adapter?: AdapterNames) {
    const startTime = Date.now();
    // console.time(`Processing:${adapter}`);
    try {
      await renderCode(adapter);
      trackCustomEvent({
        action: 'success',
        category: 'code.results',
        label: `${adapter}.runtime`,
        value: (Date.now() - startTime) / 1000,
      });

      enqueueSnackbar(
        `Completed in ${((Date.now() - startTime) / 1000).toFixed(3)} seconds.`,
        {
          autoHideDuration: 750,
          variant: 'success',
        },
      );
    } catch (error) {
      trackCustomEvent({
        action: 'fail',
        category: 'code.results',
        value: error.message,
      });
      console.error(`Error: Couldn't process input data!`, error);
      dispatch(setParserError(error.message));
      dispatch(setSchema(null));
      enqueueSnackbar(`Error: ${error.message}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
    }
    // console.timeEnd(`Processing:${adapter}`);
  }
  const onAdapterClicked = ({
    adapter,
    highlightLanguage,
  }: {
    adapter: AdapterNames;
    highlightLanguage: SupportedTargetLanguages;
  }) => {
    dispatch(setOptions({ outputAdapter: adapter, outputLanguage: highlightLanguage }));
    setTimeout(() => handleAdapterSelected(adapter), 10);
  };
  const isPanelSuccessState = Boolean(parsedInput);
  const isResultsLoaded = Boolean(results);

  let isStackedViewMode = ['xs', 'sm'].includes(breakpoint!);

  return (
    <Panel
      disabled={!isPanelSuccessState}
      className={`output-buttons-panel ${
        isPanelSuccessState ? 'panel-success' : 'panel-error'
      } ${className}`.trim()}
      titleComponent={
        <div>
          {
            <GetAppIcon
              cssColor={isPanelSuccessState ? 'var(--color-success)' : 'inherit'}
              // htmlColor={isPanelSuccessState ? 'green' : 'inherit'}
              fontSize="large"
              className={`choose-output-indicator ${
                isResultsLoaded ? 'rotate-point-right' : ''
              }`}
            />
          }
          <span>Step #2/3</span>
        </div>
      }
      subTitle={'Select Output'}
    >
      <ButtonGroup
        className="output-buttons"
        variant="outlined"
        orientation={'horizontal'}
        disabled={!isPanelSuccessState}
        color="secondary"
      >
        {outputOptions.map(([adapter, label, highlightLanguage, icon]) => {
          return (
            <Button
              key={adapter}
              onClick={() => onAdapterClicked({ adapter, highlightLanguage })}
              variant={
                hasParsedInputData && options.outputAdapter === adapter
                  ? 'contained'
                  : 'outlined'
              }
              size={isStackedViewMode ? 'medium' : 'large'}
              color={
                hasParsedInputData && options.outputAdapter === adapter
                  ? 'default'
                  : 'secondary'
              }
              {...schemaLinkProps}
              aria-label={`Output to ${label}`}
            >
              <TooltipWrapper tooltipContent={label}>
                <>
                  <div>{icon}</div>
                  <div className="target-name">{label}</div>
                </>
              </TooltipWrapper>
              {/* <div className="text-left d-md-block d-none"></div> */}
            </Button>
          );
        })}
      </ButtonGroup>
      {/* {parsedInput && currentAnalysisProgress !== undefined && (
        <LinearWithValueLabel progress={currentAnalysisProgress} />
      )} */}
    </Panel>
  );
};
