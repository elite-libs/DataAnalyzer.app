import 'helpers/fix-fast-refresh-hmr';
import { schemaAnalyzer } from './schema-analyzer';
import { expose } from 'comlink';
import { DataAnalysisResults, ISchemaAnalyzerOptions, ProgressCallback } from 'types';

export default {} as typeof Worker & { new (): Worker };

/**
 * Comlink/CreateReactApp Guide: https://github.com/dominique-mueller/create-react-app-typescript-web-worker-setup#bonus-using-comlink
 */

console.log('[schemaAnalyzerWorker] Loaded.');

const api = {
  schemaAnalyzer: function (
    schemaName: string,
    input: any[] | { [k: string]: any },
    options: ISchemaAnalyzerOptions | undefined = {
      strictMatching: true,
      disableNestedTypes: false,
      enumMinimumRowCount: 100,
      enumAbsoluteLimit: 5,
      nullableRowsThreshold: 0.001,
      uniqueRowsThreshold: 0.99,
      flattenOptions: {
        nullableRowsThreshold: 0.0001,
        targetValue: 'p99',
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
      },
    },
    onProgress?: ProgressCallback | undefined,
  ): Promise<DataAnalysisResults> {
    console.log('[schemaAnalyzerWorker] Running.');
    return schemaAnalyzer(schemaName, input, options, onProgress);
  },
};

// Expose API
expose(api);
