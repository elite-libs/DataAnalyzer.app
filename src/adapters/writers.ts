import typescriptWriter from './writer.typescript';
import mongooseWriter from './writer.mongoose';
import knexWriter from './writer.knex';
import golangWriter from './writer.golang';
import sqlWriter from './writer.sql';
import pkg from '../../package.json';
import type {
  ISchemaAnalyzerOptions,
  // TypeSummary,
  CombinedFieldInfo,
  FieldInfo,
  DataAnalysisResults,
  KeyValPair,
} from 'types';
import snakeCase from 'lodash/snakeCase';
import omit from 'lodash/omit';

export interface IDataAnalyzerWriter<TRenderOptions = unknown> {
  render(
    results: DataAnalysisResults,
    renderOptions?: TRenderOptions | undefined,
  ): string;
}
// export interface IRenderArgs {
//   schemaName: string;
//   results: DataAnalysisResults;
//   options?: ISchemaAnalyzerOptions;
// }

const writers = {
  typescript: typescriptWriter,
  golang: golangWriter,
  mongoose: mongooseWriter,
  knex: knexWriter,
  sql: sqlWriter,
  zod: zodWriter,
};

export type AdapterNames = keyof typeof writers;

export function render(adapter: AdapterNames, results: DataAnalysisResults) {
  const { options } = results;
  const renderer = writers[adapter];
  if (!renderer) throw new Error(`Invalid Render Adapter Specified: ${adapter}`);

  const header = `/*
@generator: DataAnalyzer.app / @justsml
@version ${pkg.version}
@debug ${Boolean(options.debug) ? 'on' : 'off'}
*/\n${getSummary(results, options)}\n`;

  return header + renderer.render(results);
}

function getSummary(typeSummary: DataAnalysisResults, options: ISchemaAnalyzerOptions) {
  const { debug } = options;
  const { nestedTypes } = typeSummary;
  const nestedTypeNames: string[] = nestedTypes != null ? Object.keys(nestedTypes) : [];
  const nestedCount = nestedTypeNames.length;
  const consolidatedTypes = typeSummary.renamedTypes
    ? typeSummary.flatTypeSummary.nestedTypes
    : null;
  const consolidatedTypeNames = consolidatedTypes ? Object.keys(consolidatedTypes) : null;
  const consolidatedCount = consolidatedTypeNames ? consolidatedTypeNames.length : 0;

  const getOptions = () =>
    debug
      ? `@options:
${Object.entries(omit(options, 'outputAdapter', 'outputLanguage', '_timestamp'))
  .map((opt) => '  ' + opt.join(': '))
  .join('\n')}\n`
      : '\n';

  const getSubTypes = (typeNames: string[]) =>
    `@subTypes: ${typeNames.length} found${
      debug
        ? '\n' +
          typeNames
            .slice()
            .sort()
            .filter((name) => name[0] !== '_')
            .map(
              (name) =>
                '  ' +
                snakeCase(name) +
                ' ' +
                getDebugFieldsInfo(typeSummary.flatTypeSummary.nestedTypes![name]!),
            )
            .join('\n')
        : ''
    }`;

  return `\n/*
${debug ? '#### DEBUG INFO ####\n' : ''}@schemaName: ${typeSummary.schemaName}
@totalRows: ${typeSummary.totalRows}
${debug ? getOptions() : ''}${`@condensedTypes: ${
    options.consolidateTypes && options.consolidateTypes.length > 0
      ? `De-duplicated ${nestedCount - consolidatedCount} of ${nestedCount} subtypes (${
          options.consolidateTypes
        })`
      : 'off'
  }\n`}${getSubTypes(consolidatedTypeNames || nestedTypeNames)}
*/\n`;
}

function getDebugFieldsInfo({
  fields,
  totalRows,
}: {
  fields: KeyValPair<FieldInfo | CombinedFieldInfo>;
  totalRows: number;
}) {
  return `// ${Object.keys(fields).length} fields; ${totalRows} rows processed.`;
}

// function getDebugInfoCondensedTypes(
//   typeSummary: TypeSummary<CombinedFieldInfo>,
//   condensedSummary: TypeSummary<CombinedFieldInfo>,
// ) {
//   return ``;
// }
