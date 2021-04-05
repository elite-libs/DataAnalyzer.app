import * as Comlink from 'comlink';
import {
  DataAnalysisResults,
  ISchemaAnalyzerOptions,
  ProgressCallback,
  schemaAnalyzerFn,
} from 'types';
// import AnalyzerWorker from '../analyzer.worker';
/**
 * Comlink/CreateReactApp Guide: https://github.com/dominique-mueller/create-react-app-typescript-web-worker-setup#bonus-using-comlink
 */
// Instantiate worker

export const schemaAnalyzerWorker = (
  schemaName: string,
  input: any[] | { [k: string]: any },
  options: ISchemaAnalyzerOptions | undefined,
  onProgress?: ProgressCallback | undefined,
): Promise<DataAnalysisResults> => {
  return import('../analyzer.worker').then(({ default: AnalyzerWorker }) => {
    const analyzerWorkerInstance: Worker = new AnalyzerWorker();
    const analyzerWorkerApi: {
      schemaAnalyzer: schemaAnalyzerFn;
    } = Comlink.wrap(analyzerWorkerInstance);
    // console.trace('Starting schemaAnalyzerWorker for', schemaName);
    if (onProgress) {
      // console.log('[schemaAnalyzerWorker] Proxying onProgress...');
      onProgress = Comlink.proxy(onProgress);
    } else {
      // console.log('[schemaAnalyzerWorker] No onProgress handler...');
    }
    return analyzerWorkerApi.schemaAnalyzer(
      schemaName,
      input,
      options,
      onProgress,
    );
  });
};
