import React, { useCallback, useRef } from 'react';
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
import WarningIcon from '@material-ui/icons/Warning';
import { FormControl, Select } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { OptionsState, setOptions } from 'store/optionsSlice';
import { setResults, setSchema } from 'store/analysisSlice';
import { RootState } from 'store/rootReducer';

import './AdvancedOptionsForm.scss';

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
const formatPercent = (number: number | string) =>
  number != null ? percentFormatter.format(Number(number)) : `0.00`;

// type FormOptions = OptionsState & {
//   consolidateTypes: NestedValue<string[]>
// }

export default function AdvancedOptionsForm({ className = '' }) {
  const history = useHistory();
  const formRef$ = useRef<HTMLFormElement | undefined>();
  const dispatch = useDispatch();
  const options = useSelector((state: RootState) => state.optionsActions);
  // const { schemaName } = useSelector((state) => state.analysisFeature);
  const classes = useStyles();
  const methods = useForm<OptionsState>({ defaultValues: options, mode: 'onChange' });
  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    getValues,
    formState,
  } = methods;

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

  const onSubmit = useCallback(
    (data: OptionsState) => {
      const updatedOptions = {
        ...data,
        nullableRowsThreshold: data.nullableRowsThreshold, // / 100.0
        uniqueRowsThreshold: data.uniqueRowsThreshold, // / 100.0
      };
      console.log('Saved Options', updatedOptions);

      dispatch(setOptions(updatedOptions));
      // TODO: Auto re-generate code
      resetResults();
      // goToHome();
      // setExpanded(false);
    },
    [JSON.stringify(getValues())],
  );

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

  const onInput = React.useCallback(() => onSubmit(getValues()), [
    JSON.stringify(getValues()),
  ]);
  const onChange = React.useCallback(() => onSubmit(getValues()), [
    JSON.stringify(getValues()),
  ]);
  const autoSaveHandlers = { onInput, onChange };

  React.useEffect(() => {
    register('strictMatching', {
      // validate: (value) => value.length || 'This is required.',
    });
    register('consolidateTypes', {
      // validate: (value) => value.length || 'This is required.',
    });
  }, [register]);

  return (
    <>
      <Card
        // raised={false}
        raised={true}
      >
        <CardHeader
          avatar={<SettingsIcon color="primary" fontSize="large" />}
          title={<h2>Settings</h2>}
        ></CardHeader>
        <section style={{ zIndex: 500 }} className={classes.panel}>
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
                      ref={register({ min: 0, max: 10000 })}
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
                      ref={register({ min: 0, max: 100 })}
                      {...autoSaveHandlers}
                    />
                  </label>
                </fieldset>

                <fieldset className="form-group slider-input">
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
                      {...autoSaveHandlers}
                    />
                    <span style={{ flex: '0 0 150px' }}>
                      {displayNullableRowsThreshold}%
                    </span>
                  </label>
                </fieldset>

                <fieldset className="form-group slider-input">
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
                      {...autoSaveHandlers}
                    />
                    <span style={{ flex: '0 0 150px' }}>
                      {displayUniqueRowsThreshold}%
                    </span>
                  </label>
                </fieldset>
              </CardContent>
            </Paper>
          </form>
        </section>
      </Card>
    </>
  );
}
