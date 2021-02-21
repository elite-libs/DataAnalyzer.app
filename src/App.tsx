import React from 'react';
import Router from './Router';
import { SnackbarProvider } from 'notistack';

export default function App() {
  return (
    <SnackbarProvider disableWindowBlurListener={false}>
      <div className="App container-xl">
        <Router />
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
    </SnackbarProvider>
  );
}
