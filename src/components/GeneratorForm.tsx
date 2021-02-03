import React, { useState } from 'react';
import { ISchemaAnalyzerOptions, schemaAnalyzer } from '../schema-analyzer';
import { parse } from './SchemaTools/adapters/readers';
import { AdapterNames, render } from './SchemaTools/adapters/writers';
import CodeViewer from './SchemaTools/ResultsView/CodeViewer';
import { PostgresIcon, MongoDbIcon } from './SchemaTools/AppIcons.js';

type GeneratorFormArgs<T> = {
  options: ISchemaAnalyzerOptions & { 
    schemaName: string,
    [key: string]: any
  };
  onSchema: (data: T, schemaName: string) => any
}
/**
 * 
 * @deprecated
 */
export default function GeneratorForm({ options = { schemaName: 'user'}, onSchema }: GeneratorFormArgs<any>) {
  const [schemaName, setSchemaName] = useState(options?.schemaName || 'user');
  const [inputData, setInputData] = useState('');
  const [schemaOutput, setSchemaOutput] = useState('');
  const [progress, setProgress] = useState({
    currentRow: null,
    totalRows: null,
    percent: '0',
  });

  const onProgress = ({ totalRows, currentRow, columns }: any) => {
    const percent = ((currentRow / totalRows) * 100.0).toFixed(2);
    setProgress({ totalRows, currentRow, percent });
  };
  const onSchemaCallback =
    onSchema && onSchema instanceof Function
      ? (value: any) => void onSchema(value, schemaName) || value
      : (value: any) => value;

  const generateSchema = (outputMode: AdapterNames) => {
    return Promise.resolve(inputData)
      .then(parse)
      .then((data) => schemaAnalyzer(schemaName, data, { onProgress }))
      .then(onSchemaCallback)
      .then(render({ schemaName, options, writer: outputMode }))
      .then(setSchemaOutput)
      .catch((error) => {
        setSchemaOutput(
          `Oh noes! We ran into a problem!\n\n  ${error.message}`,
        );
        console.error(error);
      })
      .then(scrollToOutput);
  };

  const scrollToOutput = () => {
    const output = document.querySelector('.output-data');
    if (output) output.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  // @ts-ignore
  // const updateSchemaOutput = (schemaResults) => {
  //   onSchemaCallback(schemaResults, schemaName);
  //   setSchemaOutput(schemaResults);
  // };

  return (
    <form className="form generator w-100" onSubmit={(e) => e.preventDefault()}>
      <section className="input-data">
        <label className="w-100">
          <strong className="field-name">Schema Name:&#160;</strong>
          <input
            className="rounded w-100"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
          />
        </label>
        <label className="w-100">
          <strong className="field-name">
            Paste your JSON or CSV data:&#160;
          </strong>
          <textarea
            className="rounded"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
        </label>
        <label className="w-100">
          <strong className="field-name text-muted">
            Or, select dataset to test:&#160;
          </strong>
          <select
            className="rounded w-100"
            defaultValue=""
            onChange={(e) => console.log('needs loadData():', e.target.value)}
          >
            <option value="">[Or, choose sample data to load]</option>
            <option value="users">Generated/Fake Users</option>
            <option value="people">Star Wars API 'People'</option>
            <option value="products">Products CSV (Public data)</option>
            <option value="listings">Real Estate Listings</option>
          </select>
        </label>
      </section>
      <section className="output-ui">
        <div className="d-flex justify-content-between m-2">
          <button
            onClick={() => generateSchema('mongoose')}
            className="btn btn-success mx-auto"
          >
            <div>
              <MongoDbIcon style={{ width: '50px' }} />
            </div>
            Generate MongoDB
            <br />
            Mongoose Schema
          </button>
          <button
            onClick={() => generateSchema('knex')}
            className="btn btn-info mx-auto"
          >
            <div>
              <PostgresIcon />
            </div>
            Generate Postgres
            <br />
            Knex Schema
          </button>
        </div>
        {/* <button
          onClick={() => setInputData(exampleUsers)}
          className="btn btn-info"
        >
          Sample Data/Reset
        </button> */}
      </section>
      <section className="output-data p-1">
        {progress && progress.currentRow && (
          <div className="progress-message">
            Processing row #{progress.currentRow}/{progress.totalRows}
            <br />
            {progress.percent}%
          </div>
        )}
        <CodeViewer>
          {schemaOutput === ''
            ? '// 1. Paste sample data\n// 2. Click for the desired output'
            : schemaOutput}
        </CodeViewer>
      </section>
    </form>
  );
}
