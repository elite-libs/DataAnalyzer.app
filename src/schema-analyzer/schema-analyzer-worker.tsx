import * as Comlink from 'comlink';
import {
  DataAnalysisResults,
  ISchemaAnalyzerOptions,
  ProgressCallback,
  schemaAnalyzerFn,
} from 'types';
import AnalyzerWorker from '../analyzer.worker';
/**
 * Comlink/CreateReactApp Guide: https://github.com/dominique-mueller/create-react-app-typescript-web-worker-setup#bonus-using-comlink
 */
// Instantiate worker
const analyzerWorkerInstance: Worker = new AnalyzerWorker();
const analyzerWorkerApi: { schemaAnalyzer: schemaAnalyzerFn } = Comlink.wrap(
  analyzerWorkerInstance,
);

export const schemaAnalyzerWorker = (
  schemaName: string,
  input: any[] | { [k: string]: any },
  options: ISchemaAnalyzerOptions | undefined,
  onProgress?: ProgressCallback | undefined,
): Promise<DataAnalysisResults> => {
  if (onProgress) {
    onProgress = Comlink.proxy(onProgress);
  }
  return analyzerWorkerApi.schemaAnalyzer(
    schemaName,
    input,
    options,
    onProgress,
  );
};
