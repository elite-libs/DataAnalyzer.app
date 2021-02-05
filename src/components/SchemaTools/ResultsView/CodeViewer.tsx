import React, { ReactNode } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
