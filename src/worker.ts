import * as Comlink from 'comlink';
import { schemaAnalyzer, helpers } from "./schema-analyzer";

const backgroundAnalyzer = {
  analyze: schemaAnalyzer,
  flatten: helpers.flattenTypes,
}
Comlink.expose(backgroundAnalyzer);
