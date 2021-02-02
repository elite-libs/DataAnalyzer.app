import mongooseWriter from './writer.mongoose';
import knexWriter from './writer.knex';
import {
  ISchemaAnalyzerOptions,
  SimpleFieldInfo,
  TypeSummary,
  helpers,
  CombinedFieldInfo,
  FieldInfo,
} from '../../../schema-analyzer/index';

export interface IDataStepWriter {
  render(options: IRenderArgs): string;
}
export interface IRenderArgs {
  schemaName: string;
  results: TypeSummary<CombinedFieldInfo>;
  options?: ISchemaAnalyzerOptions;
}

const writers = {
  mongoose: mongooseWriter,
  knex: knexWriter,
};

export type AdapterNames = keyof typeof writers;

export function render({
  schemaName,
  options,
  writer,
}: {
  schemaName: string;
  options: ISchemaAnalyzerOptions;
  writer: AdapterNames;
}) {
  return (results: TypeSummary<FieldInfo>) => {
    const renderer = writers[writer];
    if (!renderer) throw new Error(`Invalid Render Adapter Specified: ${writer}`);
  
    return renderer.render({
      schemaName,
      options,
      results: helpers.flattenTypes(results),
    });
  };
}
