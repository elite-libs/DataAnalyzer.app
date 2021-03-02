import React from 'react';
import { useHistory } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import SettingsIcon from '@material-ui/icons/Settings';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';
import { setOptions, _initialOptions } from 'store/optionsSlice';

import { setResults, setSchema } from 'store/analysisSlice';
import './AdvancedOptionsForm.scss';
import { RootState } from 'store/rootReducer';
import { pick } from 'lodash';

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 10,
  },
  margin: {
    height: theme.spacing(3),
  },
  form: {
    width: '100%',
    "& [type='range']": {
      width: 110,
    },
    zIndex: 10,
  },
  parentPanel: {},
  panel: {
    background:
      'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(245,245,245,0.98) 25%, rgba(245,245,245,0.98) 75%, rgba(255,255,255,1) 100%)' /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */,
    zIndex: 10000,
  },
  panelContent: {},
}));

const percentFormatter = new Intl.NumberFormat(['en-US', 'en'], {
  style: 'percent',
  minimumFractionDigits: 2,
});
const formatPercent = (number) =>
  number != null && Number(percentFormatter.format(number)).toFixed(2);

export default function AdvancedOptionsForm({ className = '' }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const options = useSelector((state: RootState) => state.optionsActions);
  // const { schemaName } = useSelector((state) => state.analysisFeature);
  const classes = useStyles();
  const methods = useForm({ defaultValues: options });
  const { handleSubmit, control, register, watch } = methods;
  const onSubmit = (data) => {
    const updatedOptions = {
      ...data,
      nullableRowsThreshold: data.nullableRowsThreshold, // / 100.0
      uniqueRowsThreshold: data.uniqueRowsThreshold, // / 100.0
    };

    // console.log('Saved Options', updatedOptions);
    localStorage.setItem('analyzer.options', JSON.stringify(options));
    dispatch(setOptions(updatedOptions));
    resetResults();
    goToHome();
    // setExpanded(false);
  };

  // load previous options value:
  React.useEffect(() => {
    const optionsJson = localStorage.getItem('analyzer.options');
    if (optionsJson && optionsJson.length > 1) {
      let opts = JSON.parse(optionsJson);
      opts = pick(opts, Object.keys(_initialOptions));
      console.log('restoring saved settings:', optionsJson, opts);
      dispatch(setOptions(opts));
    }
  }, []);

  function resetResults() {
    dispatch(setSchema(null));
    dispatch(setResults(null));
  }

  function goToHome() {
    history.push('/');
  }

  const displayNullableRowsThreshold = `${watch('nullableRowsThreshold')}`;
  /*formatPercent(
    100.0 * parseFloat( */
  console.log(watch('nullableRowsThreshold'), watch('uniqueRowsThreshold'));
  const displayUniqueRowsThreshold = `${watch('uniqueRowsThreshold')}`;

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
                      style={{ flex: '0 0 50%' }}
                      name="nullableRowsThreshold"
                      defaultValue={0.02}
                      min={0.0}
                      max={0.1}
                      step={0.005}
                      title="Between 0.0-0.10, Default: 0.02"
                      ref={register({ min: 0.0, max: 0.1 })}
                    />
                    <span style={{ flex: '0 0 23%' }}>
                      {displayNullableRowsThreshold}%
                    </span>
                  </label>
                </fieldset>

                <fieldset className="form-group">
                  <legend className="mb-1">Uniqueness Detection</legend>
                  <label className="input-group d-flex justify-content-between">
                    <p>Unique values required</p>
                    <input
                      type="range"
                      style={{ flex: '0 0 50%' }}
                      name="uniqueRowsThreshold"
                      defaultValue={1.0}
                      min={0.8}
                      max={1.0}
                      step={0.005}
                      ref={register({ min: 0.8, max: 1.0 })}
                    />
                    <span style={{ flex: '0 0 23%' }}>{displayUniqueRowsThreshold}%</span>
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
                    // color=""
                    onClick={goToHome}
                    title="Close"
                  >
                    <CloseIcon color="error" />
                  </Button>
                  {/* <IconButton type='reset' color='default' onClick={reset} title="Reset"><RefreshIcon /></IconButton> */}
                </ButtonGroup>
                <Button
                  variant="contained"
                  type="submit"
                  color="secondary"
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
