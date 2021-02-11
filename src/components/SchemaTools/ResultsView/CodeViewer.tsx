import React, { ReactNode } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Property } from 'csstype';

export type ICodeGeneratorArgs = {
  language?: string;
  children: ReactNode;
  maxHeight?: Property.Height;
};

function VerticalScrollWrapper({
  children,
  maxHeight = null,
}: {
  children: React.ReactNode;
  maxHeight?: Property.Height | null;
}) {
  if (!maxHeight) return <>{children}</>;
  return <section style={{ overflowY: 'auto', width: '100%', maxHeight }}>{children}</section>;
}

export default function CodeViewer({
  language = 'typescript',
  maxHeight = undefined,
  children,
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
    <VerticalScrollWrapper maxHeight={maxHeight}>
      <SyntaxHighlighter language={language} style={atomDark} showLineNumbers={true}>
        {children}
      </SyntaxHighlighter>
    </VerticalScrollWrapper>
  );
}
