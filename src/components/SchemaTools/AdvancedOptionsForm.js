import React from 'react';
import { useForm, Controller } from 'react-hook-form';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input'
import Checkbox from '@material-ui/core/Checkbox';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
// import Collapse from '@material-ui/core/Collapse';
import SettingsIcon from '@material-ui/icons/Settings';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';
import { setOptions } from 'store/optionsSlice';
// import { RootState } from 'store/rootReducer';

import './AdvancedOptionsForm.scss';
import { setResults, setSchema } from 'store/analysisSlice';
import { useHistory } from 'react-router';
import { CardHeader } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    // transform: 'scale(1.25)',
    // margin: '0',
    // width: '42px',
    // minWidth: '0',
    // maxWidth: '42px',
    // marginRight: '-23px',
    // marginTop: '-10px',
    zIndex: 10,
  },
  // header: {
  //   padding: '0.5rem',
  //   maxWidth: '64px',
  //   maxHeight: '64px'
  // },
  margin: {
    height: theme.spacing(3),
  },
  // expand: {
  //   // transform: 'rotate(0deg)',
  //   // marginLeft: 'auto',
  //   // transition: theme.transitions.create('transform', {
  //   //   duration: theme.transitions.duration.shortest,
  //   // }),
  // },
  // expandOpen: {
  //   transform: 'rotate(180deg)',
  // },
  form: {
    width: '100%',
    "& [type='range']": {
      width: 110,
    },
    zIndex: 10,
  },
  parentPanel: {},
  panel: {
    // position: 'absolute',
    background:
      'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(245,245,245,0.98) 25%, rgba(245,245,245,0.98) 75%, rgba(255,255,255,1) 100%)' /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */,
    zIndex: 10000,
    // overflowY: 'hidden',
  },
  panelContent: {
    // position: 'relative',
    // margin: 0,
    // top: '0.45rem',
    // // background: 'rgba(245, 245, 245, 0.985)',
    // height: '100%',
    // maxHeight: '50vh',
    // overflowY: 'auto',
    // minWidth: '400px',
    // zIndex: 10,
  },
}));

// const WrapWithLabel = ({ label, children }) => <section className='form-field'>
//   <Typography as='label'>{label}: </Typography>
//   {children}
// </section>

// const SliderField = ({ name, label, value, control, ...args }) => (<WrapWithLabel label={label}>
//   <Controller
//     as={Slider}
//     {...args}
//     valueLabelDisplay='auto'
//     aria-label={label}
//     name={name}
//     control={control}
//     defaultValue={value}
//   />
// </WrapWithLabel>)
// // React.forwardRef((props, ref) => {
// const RangeInputField = React.forwardRef(({ name, label, value, control, register, ...args }, ref) => (<WrapWithLabel label={label}>
//   <input
//     type='number'
//     name={name}
//     aria-label={label}
//     defaultValue={value}
//     ref={ref}
//     {...args}
//   />
// </WrapWithLabel>))
const percentFormatter = new Intl.NumberFormat({
  style: 'percent',
  minimumFractionDigits: 2,
});
const formatPercent = (number) =>
  number != null && Number(percentFormatter.format(number)).toFixed(2);

export default function AdvancedOptionsForm({ className = '' }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const options = useSelector((state) => state.optionsActions);
  // const { schemaName } = useSelector((state) => state.analysisFeature);
  const classes = useStyles();
  const methods = useForm({ defaultValues: options });
  const { handleSubmit, control, register, watch } = methods;
  const onSubmit = (data) => {
    const updatedOptions = {
      ...data,
      nullableRowsThreshold: data.nullableRowsThreshold / 100.0,
      uniqueRowsThreshold: data.uniqueRowsThreshold / 100.0,
    };
    console.log('Saved Options', updatedOptions);

    dispatch(setOptions(updatedOptions));
    resetResults();
    goToHome();
    // setExpanded(false);
  };

  function resetResults() {
    dispatch(setSchema(null));
    dispatch(setResults(null));
  }

  function goToHome() {
    history.push('/');
  }

  const displayNullableRowsThreshold = formatPercent(
    100.0 * watch('nullableRowsThreshold'),
  );
  const displayUniqueRowsThreshold =
    100 - formatPercent(100.0 * watch('uniqueRowsThreshold'));

  return (
    <>
      <Card
        // raised={false}
        raised={true}
      >
        <CardHeader
          avatar={<SettingsIcon color="primary" fontSize="large" />}
          title={'Settings'}
        ></CardHeader>
        <section style={{ zIndex: 500 }} className={classes.panel}>
          <form
            className={'schema-options ' + className + ' ' + classes.form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Paper elevation={2} variant="outlined">
              <CardContent className={`px-3 bg-white ${classes.panelContent}`}>
                <fieldset className="form-group">
                  <legend className="mb-1">Global Rules</legend>
                  <section className="input-group d-flex justify-content-between">
                    <p>Exclusive Type Matching</p>
                    <Controller
                      as={<Checkbox name="strictMatching" style={{ padding: '0' }} />}
                      name="strictMatching"
                      value="strict"
                      defaultValue={options.strictMatching}
                      control={control}
                    />
                  </section>
                </fieldset>

                <fieldset className="form-group">
                  <legend className="mb-1">Enumerations</legend>

                  <label className="input-group d-flex justify-content-between">
                    <p>Min. Rows for Enumerations</p>
                    <input
                      type="number"
                      name="enumMinimumRowCount"
                      defaultValue={100}
                      min={0}
                      max={10000}
                      step={10}
                      title="Between 0-10000, Default: 100"
                      ref={register({ min: 0, max: 10000 })}
                    />
                  </label>
                  <label className="input-group d-flex justify-content-between">
                    <p>Enumeration Item Limit</p>
                    <input
                      type="number"
                      name="enumAbsoluteLimit"
                      defaultValue={10}
                      min={0}
                      max={100}
                      step={1}
                      title="Between 0-100, Default=10"
                      ref={register({ min: 0, max: 100 })}
                    />
                  </label>
                </fieldset>

                <fieldset className="form-group">
                  <legend className="mb-1">Null Detection</legend>
                  <label className="input-group d-flex justify-content-between">
                    <p>Empty field limit</p>
                    <input
                      type="range"
                      name="nullableRowsThreshold"
                      defaultValue={0.02}
                      min={0.0}
                      max={0.1}
                      step={0.005}
                      title="Between 0.0-0.10, Default: 0.02"
                      ref={register({ min: 0.0, max: 0.1 })}
                    />
                    <span>{displayNullableRowsThreshold}%</span>
                  </label>
                </fieldset>

                <fieldset className="form-group">
                  <legend className="mb-1">Uniqueness Detection</legend>
                  <label className="input-group d-flex justify-content-between">
                    <p>Unique values required</p>
                    <input
                      type="range"
                      name="uniqueRowsThreshold"
                      defaultValue={1.0}
                      min={0.8}
                      max={1.0}
                      step={0.005}
                      ref={register({ min: 0.8, max: 1.0 })}
                    />
                    <span>{displayUniqueRowsThreshold}%</span>
                  </label>
                </fieldset>
              </CardContent>
              <CardActions
                disableSpacing
                className="d-flex justify-content-between align-items-center button-section"
              >
                <ButtonGroup size="small" className="py-1">
                  <Button
                    type="button"
                    color="secondary"
                    onClick={goToHome}
                    title="Close"
                  >
                    <CloseIcon />
                  </Button>
                  {/* <IconButton type='reset' color='default' onClick={reset} title="Reset"><RefreshIcon /></IconButton> */}
                </ButtonGroup>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  startIcon={<SaveIcon />}
                >
                  Save
                </Button>
              </CardActions>
            </Paper>
          </form>
        </section>
      </Card>
    </>
  );
}
