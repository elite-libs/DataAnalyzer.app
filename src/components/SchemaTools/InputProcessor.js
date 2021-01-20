import React from 'react'
import Paper from '@material-ui/core/Paper'
import { Link, useParams, useHistory } from 'react-router-dom'
// import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
// import ChevronRight from '@material-ui/icons/ChevronRightOutlined'

export default function InputProcessor ({
  hasInputData,
  displayStatus,
  inputData = '',
  setInputData,
  setStatusMessage,
  setSchemaName,
  className = ''
}) {
  // const { source: name } = useParams()
  const history = useHistory()

  const loadData = (name) => {
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
    if (!filePath) return ''
    setSchemaName(name)
    setStatusMessage(`One moment...\nImporting ${name} dataset...`)
    return fetch(filePath)
      .then(response => response.text())
      .then(data => {
        // setSchemaName(name)
        setInputData(data)
      })
      .catch(error => {
        console.error('ERROR:', error)
        setStatusMessage(`Oh noes! Failed to load the ${name} dataset.
            Please file an issue on the project's GitHub Issues.`)
      })
  }

  // React.useEffect(() => {
  //   loadData()
  // }, [name])

  const textareaOpts = hasInputData ? { rowsMin: 14 } : { rowsMin: 9 }
  if (hasInputData) {
    className += ' appears-valid'
  }
  return <Paper elevation={3} className={className}>
    <section className='position-relative w-100 h-100 d-flex flex-column align-items-center justify-content-center '>
      {displayStatus(() => history.push('/results/code/knex'))}

      <TextareaAutosize
        className='w-100 h-100 border-0 m-1 p-1'
        aria-label='Input or Paste your CSV or JSON data'
        placeholder='Paste your data here, or click "Start Here" to choose a Sample Data Set'
        value={inputData}
        onChange={e => setInputData(e.target.value)}
        {...textareaOpts}
      />
      {/* <textarea
        className='muted w-100 h-100'

      /> */}
      {/* {children} */}
    </section>
  </Paper>
}

/*
*/
