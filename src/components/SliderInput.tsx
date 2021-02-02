import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import VolumeUp from '@material-ui/icons/VolumeUp';
import { Controller } from 'react-hook-form';
import AccountCircleOutlined from '@material-ui/icons/AccountCircleOutlined';

const useStyles = makeStyles({
  root: {
    width: 250,
  },
  input: {
    width: 42,
  },
});

interface ISliderArgs {
  defaultValue: number;
  step?: number;
  min?: number;
  max: number;
  onChange: any;
  icon?: React.ReactNode;
}

export default function SliderInput({
  defaultValue = 0,
  step = 1,
  min = 0,
  max,
  onChange,
  icon = <AccountCircleOutlined />,
}: ISliderArgs) {
  const classes = useStyles();
  const [value, setValue] = React.useState(defaultValue);

  // @ts-ignore
  const handleSliderChange = (event, newValue) => {
    onChange(newValue);
    setValue(newValue);
  };

  const handleInputChange = (event: any) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    // @ts-ignore
    if (value < min) {
      // @ts-ignore
      setValue(min);
    } else if (value > max) {
      // @ts-ignore
      setValue(max);
    }
  };

  return (
    <div className={classes.root}>
      <Typography id="input-slider" gutterBottom>
        Volume
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>{icon || null}</Grid>
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item>
          <Controller
            name="slider"
            as={
              <Input
                className={classes.input}
                value={value}
                margin="dense"
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step,
                  min,
                  max,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            }
          />
        </Grid>
      </Grid>
    </div>
  );
}
