import React, { ReactNode } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { parse } from './adapters/readers.js'
// import { AdapterNames, render } from '../adapters/writers';
// import { useParams, useHistory } from 'react-router-dom';
// import { TypeSummary, FieldInfo } from 'schema-analyzer';

export type ICodeGeneratorArgs = {
  language?: string;
  children: ReactNode;
}

export default function CodeGenerator({
  language = 'typescript',
  children
}: ICodeGeneratorArgs) {
  // const [generatedCode, setGeneratedCode] = React.useState('');
  // const { adapter = 'knex' } = useParams<{adapter: AdapterNames}>();
  // const history = useHistory();

  // if (!schemaResults) {
  //   console.warn('Request denied, reloads not supported.');
  //   history.push('/');
  // }
  // console.log(arguments, children)
  return (
    <SyntaxHighlighter language={language} style={atomDark}>
      {children}
    </SyntaxHighlighter>
  );
}
