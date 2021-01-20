import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
// import { parse } from './adapters/readers.js'
import { render } from '../adapters/writers.js'
import { useParams, useHistory } from 'react-router-dom'

export default function CodeGenerator ({
  schemaName = 'Users',
  schemaResults,
  resultsTimestamp,
  options,
  language = 'javascript',
  children
}) {
  const [generatedCode, setGeneratedCode] = React.useState('')
  const { adapter = 'knex' } = useParams()
  const history = useHistory()

  if (!schemaResults) {
    console.warn('Request denied, reloads not supported.')
    history.push('/')
  }

  React.useEffect(() => {
    const renderCode = () => {
      return Promise.resolve(schemaResults)
        .then(render({ schemaName, options, writer: adapter }))
        .then(setGeneratedCode)
        .catch(error => {
          setGeneratedCode(`Oh noes! We ran into a problem!\n\n  ${error.message}`)
          console.error(error)
        })
    }
    renderCode({})
  }, [resultsTimestamp])

  return (

    <SyntaxHighlighter language={language} style={atomDark}>
      {generatedCode}
    </SyntaxHighlighter>
  )
}
