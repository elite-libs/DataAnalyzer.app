import React, { useState } from 'react';
// import Header from './components/Header'
// import NavBar from './components/NavBar'
import GeneratorForm from './components/GeneratorForm';
// import SchemaExplorer from './components/SchemaExplorer'
// import AdvancedOptionsForm from './components/AdvancedOptionsForm'
import SchemaTools from './components/SchemaTools';
// import PopoverWrapper from './components/PopoverWrapper'

export default function App() {
  const [options, setOptions] = useState({
    strictMatching: true,
    enumMinimumRowCount: 100,
    enumAbsoluteLimit: 10,
    enumPercentThreshold: 0.01,
    nullableRowsThreshold: 0.02,
    uniqueRowsThreshold: 1.0,
  });
  const [schema, setSchema] = useState('');
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

// const typesList = [
//   'Unknown',
//   'ObjectId',
//   'UUID',
//   'Boolean',
//   'Date',
//   'Timestamp',
//   'Currency',
//   'Float',
//   'Number',
//   'Email',
//   'String',
//   'Array',
//   'Object',
//   'Null'
// ]
