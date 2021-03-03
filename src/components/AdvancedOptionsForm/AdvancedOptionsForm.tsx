import React, { useCallback, useEffect } from 'react';
// import { useHistory } from 'react-router';
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Link from '@material-ui/core/Link';
import { Link as RouteLink } from 'react-router-dom';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// import SaveIcon from '@material-ui/icons/Save';
// import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';
import { Select, Slider } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { OptionsState, setOptions } from 'store/optionsSlice';
import { setResults, setSchema } from 'store/analysisSlice';
import { RootState } from 'store/rootReducer';
// import { pick } from 'lodash';

import './AdvancedOptionsForm.scss';
import { convertFractionToPercent, formatPercent } from 'helpers';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 600,
    margin: 'auto',
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
  title: {
    marginBottom: 0,
  },
}));

// const marks = [
//   {
//     value: 0,
//     label: '0°C',
//   },
//   {
//     value: 20,
//     label: '20°C',
//   },
//   {
//     value: 37,
//     label: '37°C',
//   },
//   {
//     value: 100,
//     label: '100°C',
//   },
// ];

export default function AdvancedOptionsForm({ className = '' }) {
  // const history = useHistory();
  // const formRef$ = useRef<HTMLFormElement | undefined>();
  const dispatch = useDispatch();
  const options = useSelector((state: RootState) => state.optionsActions);
  // const {} = useSelector((state: RootState) => state.appStateActions);
  // const { schemaName } = useSelector((state) => state.analysisFeature);
  const classes = useStyles();

  const methods = useForm<OptionsState>({ defaultValues: options, mode: 'onChange' });
  const { register, watch, setValue, getValues } = methods;

  const [successClass, setSuccessClass] = React.useState<string>('');
  // const currentValues = getValues();

  // React.useEffect(() => {
  //   console.log('Checking formRef$', formRef$.current);
  //   const handleChange = (event) => {
  //     console.log('changed!', event.target.value, getValues());
  //   };
  //   if (formRef$.current) {
  //     formRef$.current.addEventListener('input', handleChange);
  //   }
  //   return () => formRef$?.current?.removeEventListener('input', handleChange);
  // }, [formRef$, formRef$.current]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const getInitialOptions = React.useMemo(() => options, []);

  useEffect(() => {
    if (successClass.length > 1) setTimeout(() => setSuccessClass(''), 1250); // remove the animate class
  }, [successClass]);

  const onSubmit = useCallback(
    (data: OptionsState) => {
      const updatedOptions = {
        ...data,
        nullableRowsThreshold: data.nullableRowsThreshold, // / 100.0
        uniqueRowsThreshold: data.uniqueRowsThreshold, // / 100.0
      };
      console.log('Saved Options', updatedOptions);
      localStorage.setItem('analyzer.options', JSON.stringify(updatedOptions));

      dispatch(setOptions(updatedOptions));
      setSuccessClass('pulse-success-bg'); // this will get auto-cleared by a useEffect above.
      // TODO: Auto re-generate code
      resetResults();
      // goToHome();
      function resetResults() {
        dispatch(setSchema(null));
        dispatch(setResults(null));
      }
      // setExpanded(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(getValues()), dispatch],
  );

  // load previous options value:
  React.useEffect(() => {
    const optionsJson = localStorage.getItem('analyzer.options');
    if (optionsJson && optionsJson.length > 1) {
      let opts = JSON.parse(optionsJson);
      // opts = pick(opts, Object.keys(_initialOptions));
      console.log('restoring saved settings:', optionsJson, opts);
      dispatch(setOptions(opts));
    }
  }, [dispatch]);

  const { debug, nullableRowsThreshold, uniqueRowsThreshold, consolidateTypes } = watch();

  /*formatPercent(
  100.0 * parseFloat( */
  const displayNullableRowsThreshold = `${nullableRowsThreshold}`;
  // const displayUniqueRowsThreshold = `${uniqueRowsThreshold}`;

  const onInput = React.useCallback(() => onSubmit(getValues()), [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(getValues()),
    getValues,
    onSubmit,
  ]);
  const onChange = React.useCallback(() => onSubmit(getValues()), [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(getValues()),
    getValues,
    onSubmit,
  ]);
  const autoSaveHandlers = { onInput, onChange };

  // https://react-hook-form.com/faqs/#CanitworkwithControlledcomponents
  React.useEffect(() => {
    register('debug', {});
    register('strictMatching', {});
    register('consolidateTypes', {});
    register('uniqueRowsThreshold', { min: 0.8, max: 1.0, valueAsNumber: true });
    register('nullableRowsThreshold', { min: 0.0, max: 0.1, valueAsNumber: true });
  }, [register]);

  return (
    <>
      <Card
        raised={false}
        // raised={true}
        className={classes.root}
      >
        <CardHeader
          avatar={
            <Link component={RouteLink} to={'/'} className="back-button">
              <ArrowBackIcon color="primary" fontSize="large" />
            </Link>
          }
          title={<h2 className={classes.title}>Settings</h2>}
        ></CardHeader>
        <section style={{ zIndex: 500 }} className={classes.panel + ' ' + successClass}>
          <form
            className={'schema-options ' + className + ' ' + classes.form}
            // onSubmit={handleSubmit(onSubmit)}
            // onInput={handleSubmit(onSubmit)}
            // onChange={handleSubmit(onSubmit)}
            // ref={formRef$}
          >
            <Paper elevation={2} variant="outlined">
              <CardContent className={`px-3 bg-white ${classes.panelContent}`}>
                <fieldset className="form-group">
                  <legend className="mb-1">Global Rules</legend>
                  <section className="input-group d-flex justify-content-between">
                    <p>Exclusive Type Matching</p>
                    <Checkbox
                      name="strictMatching"
                      style={{ padding: '0' }}
                      onChange={(event, checked) => {
                        setValue('strictMatching', checked);
                        onSubmit(getValues());
                      }}
                      checked={options.strictMatching}
                    />
                  </section>
                </fieldset>

                <fieldset
                  className={`form-group ${
                    watch('consolidateTypes') !== undefined ? 'show-warning' : ''
                  }`}
                >
                  <legend className="mb-1">De-duplicate Similar Types</legend>
                  <section className="input-group d-flex justify-content-between">
                    <p>Detect Similarly Shaped Fields</p>
                    <label className="warning-label">
                      <WarningIcon color="error" className="warning-icon" />
                    </label>

                    <Select
                      native
                      placeholder={'Not enabled'}
                      id="consolidateTypesSelect"
                      // onChange={(e) =>
                      //   setValue('consolidateTypes', e.target.value as number[])
                      // }
                      onChange={(event, data) => {
                        setValue('consolidateTypes', event.target.value);
                        onSubmit(getValues());
                      }}
                      inputProps={{
                        id: 'consolidateTypes',
                      }}
                      value={consolidateTypes}
                    >
                      <option aria-label="None" value={undefined}>
                        Not Enabled
                      </option>
                      <option value={'field-names'}>Field Names</option>
                      <option value={'field-names-and-type'}>Field Name and Type</option>
                    </Select>
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
                      ref={register({ min: 0, max: 10000, valueAsNumber: true })}
                      // onChange
                      {...autoSaveHandlers}
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
                      ref={register({ min: 0, max: 100, valueAsNumber: true })}
                      {...autoSaveHandlers}
                    />
                  </label>
                </fieldset>

                <fieldset className="form-group slider-input">
                  <legend className="mb-1">Null Detection</legend>
                  <label className="input-group d-flex justify-content-between">
                    <p>Empty field limit</p>
                    <Slider
                      value={nullableRowsThreshold}
                      getAriaValueText={formatPercent}
                      valueLabelFormat={formatPercent}
                      min={0.0}
                      max={0.1}
                      step={0.005}
                      valueLabelDisplay="on"
                      // style={{ flex: '0 0 50%' }}
                      onChange={(e, data) => {
                        setValue('nullableRowsThreshold', data);
                        onSubmit(getValues());
                      }}
                    />
                    <span>{formatPercent(displayNullableRowsThreshold)}</span>
                  </label>
                </fieldset>

                <fieldset className="form-group slider-input">
                  <legend className="mb-1">Uniqueness Detection</legend>
                  <label className="input-group d-flex justify-content-between">
                    <p>Unique values required</p>
                    <Slider
                      value={uniqueRowsThreshold}
                      getAriaValueText={convertFractionToPercent}
                      valueLabelFormat={convertFractionToPercent}
                      min={0.8}
                      max={1.0}
                      step={0.005}
                      valueLabelDisplay="on"
                      onChange={(e, data) => {
                        setValue('uniqueRowsThreshold', data);
                        onSubmit(getValues());
                      }}
                    />
                    <span>{formatPercent(Math.abs(Number(uniqueRowsThreshold)))}</span>
                  </label>
                </fieldset>
                <fieldset className="form-group">
                  <legend className="mb-1">Debug Mode</legend>
                  <section className="input-group d-flex justify-content-between">
                    <p>Append `TypeSummary` results JSON in your generated code.</p>
                    <Checkbox
                      name="debug"
                      style={{ padding: '0' }}
                      onChange={(event, checked) => {
                        setValue('debug', checked);
                        onSubmit(getValues());
                      }}
                      checked={Boolean(debug)}
                    />
                  </section>
                </fieldset>
              </CardContent>
            </Paper>
          </form>
        </section>
      </Card>
    </>
  );
}
