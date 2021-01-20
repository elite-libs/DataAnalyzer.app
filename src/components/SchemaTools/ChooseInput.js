import React, { useState } from 'react'
// import { useForm, Controller } from 'react-hook-form'
// import PropTypes from 'prop-types';
// import { withStyles, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
// import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import SampleDataMenu from './SampleDataMenu'
import { useHistory } from 'react-router-dom'

export default function ChooseInput ({ text = '', onSelect, reset, children }) {
  const history = useHistory()
  const wrapSelect = (arg) => {
    console.warn('SELECTED:', arg)
    onSelect(arg)
    history.push('/input')
  }
  const wrapReset = () => {
    if (reset) reset() // should clear existing text here
    history.push('/input')
  }

  return (
    <section className='main-panel w-100 h-100 p-3 my-3 d-flex justify-content-around align-items-start'>
      <section className='panel mb-3'>
        <Typography variant='h6' className='mb-3'>Option #1: Your Data</Typography>
        <ButtonGroup orientation='vertical' variant='contained' className='main-options text-left'>
          <Button onClick={wrapReset}>Paste from Clipboard</Button>
          <Button>From File (processed locally)</Button>
        </ButtonGroup>
      </section>
      <section className='panel mb-3'>
        <Typography variant='h6' className='mb-3'>Option #2: Playground &amp; Sample Data</Typography>
        <SampleDataMenu
          onSelect={wrapSelect}
          options={[
            'Sample Users JSON',
            'Sample People JSON',
            'Sample Listings JSON',
            'Sample Products CSV'
          ]}
        />
      </section>

    </section>
  )
}
