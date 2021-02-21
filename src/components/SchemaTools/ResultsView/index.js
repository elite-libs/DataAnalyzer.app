import React from 'react';
import SchemaExplorer from '../../SchemaExplorer/SchemaExplorer';
import CodePreviewPanel from './CodePreviewPanel';
import { parse } from '../../../adapters/readers.js';
import { render } from '../../../adapters/writers.js';
import SchemaFieldsList from './SchemaFieldsList';
import { Typography } from '@material-ui/core';

export default function ResultsView({
  options = {},
  schemaResults,
  schemaName,
  displayView = 'chart',
  setDisplayView,
  onSchema,
}) {
  // const [schemaOutput, setSchemaOutput] = React.useState('')
  // const [progress, setProgress] = React.useState({ currentRow: null, totalRows: null, percent: '0' })
  // // const onProgress = ({ totalRows, currentRow, columns }) => {
  // //   const percent = ((currentRow / totalRows) * 100.0).toFixed(2)
  // //   setProgress({ totalRows, currentRow, percent })
  // // }
  // const onSchemaCallback = onSchema && onSchema instanceof Function
  //   ? (value) => void onSchema(value, schemaName) || value
  //   : (value) => value

  const opts = { schemaResults, schemaName };
  const view =
    displayView === 'chart' ? (
      <SchemaExplorer {...opts} />
    ) : displayView === 'list' ? (
      <SchemaFieldsList {...opts} />
    ) : displayView === 'code' ? (
      <CodePreviewPanel {...opts} />
    ) : (
      <Typography variant="subheader">Invalid Viewer. Try again.</Typography>
    );
  return <>{view}</>;
}
