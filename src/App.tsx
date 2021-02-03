import React from 'react';
import SchemaTools from './components/SchemaTools';

export default function App() {
  return (
    <div className="App container">
      <SchemaTools />
      {/* <NavBar />  */}
      {/* <Header /> */}
      {/* <AdvancedOptionsForm
        onSave={options => {
          setOptions(options)
        }}
        options={options}
        className='options-ui'
      />
      <GeneratorForm className='generator-form' options={options} onSchema={(schema, title) => setSchema(schema)} />
      <SchemaExplorer schemaResults={schema} /> */}
    </div>
  );
}
