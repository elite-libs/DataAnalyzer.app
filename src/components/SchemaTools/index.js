import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouteLink
} from 'react-router-dom'

import { schemaBuilder } from 'schema-analyzer'
import { parse } from './adapters/readers.js'
import { render } from './adapters/writers.js'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import SchemaExplorer from './ResultsView/SchemaExplorer.js'

import ChooseInput from './ChooseInput'
import AdvancedOptionsForm from './AdvancedOptionsForm'
import InputProcessor from './InputProcessor.js'
import CodeViewer from './ResultsView/CodeViewer.js'
import Button from '@material-ui/core/Button'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'

export default function SchemaTools ({}) {
  const [schemaResults, setSchemaResults] = React.useState(null)
  const [schemaName, setSchemaName] = React.useState('Users')
  const [inputData, setInputData] = React.useState('')
  const [statusMessage, setStatusMessage] = React.useState('')
  const [resultsTimestamp, setResultsTimestamp] = React.useState(null)

  const [options, setOptions] = React.useState({
    strictMatching: true,
    enumMinimumRowCount: 100,
    enumAbsoluteLimit: 10,
    enumPercentThreshold: 0.01,
    nullableRowsThreshold: 0.02,
    uniqueRowsThreshold: 1.0
  })

  const loadData = name => {
    let filePath = ''
    if (/products/i.test(name)) {
      filePath = 'products-3000.csv'
      name = 'products'
    }
    if (/listings/i.test(name)) {
      filePath = 'real-estate.example.json'
      name = 'listings'
    }
    if (/people/i.test(name)) {
      filePath = 'swapi-people.json'
      name = 'people'
    }
    if (/users/i.test(name)) {
      filePath = 'users.example.json'
      name = 'users'
    }
    if (!filePath) {
      setStatusMessage('')
      setInputData('')
      return
    }
    setInputData('')
    setStatusMessage(`One moment...\nImporting ${name} dataset...`)
    return fetch(filePath)
      .then(response => response.text())
      .then(data => {
        setSchemaName(name)
        setInputData(data)
        setStatusMessage('Loaded Sample Dataset 🎉')
      })
      .catch(error => {
        console.error('ERROR:', error)
        setStatusMessage(`Oh noes! Failed to load the ${name} dataset.
          Please file an issue on the project's GitHub Issues.`)
      })
  }

  const hasSchemaResults = !!(schemaResults && schemaResults.fields)
  const hasInputData = inputData && (String(inputData).length > 40 || String(inputData).split('\n').length > 5)

  const displayStatusOverlay = onComplete => {
    if (hasInputData) {
      return <Button variant='contained' startIcon={<CheckCircleIcon style={{ color: '#339999', transform: 'scale(5) translateX(-8px)' }} size='large' />} className='field-overlay success-message position-absolute' onClick={() => updateSchemaResults(onComplete)}>Click to Process this Data</Button>
    }
    return <Typography
      style={{ height: 60 }} variant='h3'
      className='field-overlay help-message position-absolute w-100 text-center flex-shrink-1'
    >
        👉 Paste data here!&#160;👈
           </Typography>
  }

  const updateSchemaResults = (onComplete) => {
    return hasInputData &&
      Promise.resolve(inputData)
        .then(parse)
        .then(data => schemaBuilder(data, { onProgress: () => ({}), ...options }))
        .then(value => console.log(value) || value)
        .then(setSchemaResults)
        .then((results) => {
          setResultsTimestamp(Date.now())
          setTimeout(() => {
            if (onComplete) onComplete(results)
          }, 50)
        })
        .catch(error => {
          setStatusMessage(`Oh noes! We ran into a problem!\n\n  ${error.message}`)
          console.error(error)
        })
  }

  const schemaLinkProps = hasSchemaResults ? {
    style: { cursor: 'pointer', color: '#469408', fontWeight: '500' },
    className: 'unlocked'
  } : {
    disabled: true,
    style: { cursor: 'not-allowed', color: '#77777766', fontWeight: '200', textDecoration: 'none' },
    className: 'locked disabled',
    onClick: (e) => e.preventDefault()
  }

  return <main className='shadow-lg p-3 m-5 bg-white rounded'>
    <Router>
      <nav className='row w-100 '>
        <h1 className='col-11'>Dan's Schema Generator</h1>
        <aside className='col-1 text-right'>
          <AdvancedOptionsForm options={options} onSave={opts => setOptions(opts)} />
        </aside>
        <Breadcrumbs separator={<NavigateNextIcon />} aria-label='breadcrumb' className='col-12 pb-2 pl-4'>
          <Link component={RouteLink} color='inherit' to='/'>Start Here</Link>
          <Link component={RouteLink} color='inherit' to='/input'>1. Input Data</Link>
          <Link component={RouteLink} {...schemaLinkProps} to='/results/code'>2. Generate Code</Link>
          <Link component={RouteLink} {...schemaLinkProps} to='/results/explorer'>3. Charts &amp; Summary</Link>
        </Breadcrumbs>
      </nav>

      <Switch>
        <Route exact path='/'>
          <h4 className='my-3'>Choose an Option Below</h4>
          <ChooseInput
            onSelect={loadData} reset={() => {
              setInputData('')
              setSchemaResults(null)
            }}
          />
        </Route>
        <Route path='/input/:source?'>
          <InputProcessor
            displayStatus={displayStatusOverlay}
            inputData={inputData}
            setInputData={setInputData}
            setStatusMessage={setStatusMessage}
            setSchemaName={setSchemaName}
            hasInputData={hasInputData}
          />
        </Route>

        <Route path='/results/code/:adapter?'>
          <CodeViewer
            schemaName={schemaName}
            schemaResults={schemaResults}
            resultsTimestamp={resultsTimestamp}
          >
            {schemaResults ? null : '// No code to view, please check your settings.'}
          </CodeViewer>
        </Route>
        <Route path='/results/explorer'>
          <SchemaExplorer schemaResults={schemaResults} />
        </Route>

      </Switch>

    </Router>
  </main>
}
