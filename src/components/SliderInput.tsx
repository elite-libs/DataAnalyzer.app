import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import Input from '@material-ui/core/Input'
import VolumeUp from '@material-ui/icons/VolumeUp'
import { Controller } from 'react-hook-form'

const useStyles = makeStyles({
  root: {
    width: 250
  },
  input: {
    width: 42
  }
})

export default function SliderInput ({
  defaultValue = 0,
  step, min, max

}) {
  const classes = useStyles()
  const [value, setValue] = React.useState(defaultValue)

  const handleSliderChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleInputChange = event => {
    setValue(event.target.value === '' ? '' : Number(event.target.value))
  }

  const handleBlur = () => {
    if (value < min) {
      setValue(min)
    } else if (value > max) {
      setValue(max)
    }
  }

  return (
    <div className={classes.root}>
      <Typography id='input-slider' gutterBottom>
        Volume
      </Typography>
      <Grid container spacing={2} alignItems='center'>
        <Grid item>
          {icon || null}
        </Grid>
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby='input-slider'
          />
        </Grid>
        <Grid item>
          <Controller as={<Input
            className={classes.input}
            value={value}
            margin='dense'
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step,
              min,
              max,
              type: 'number',
              'aria-labelledby': 'input-slider'
            }}
          />}
          />
        </Grid>
      </Grid>
    </div>
  )
}
