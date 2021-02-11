import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOptions } from 'store/optionsSlice';
import { RootState } from 'store/rootReducer';
import Button from '@material-ui/core/Button';
import { PostgresIcon, MongoDbIcon, TypeScriptIcon, KnexIcon } from './SchemaTools/AppIcons.js';

import './SchemaTools/index.scss';
import { AdapterNames } from './SchemaTools/adapters/writers.js';

type OutputMode = [adapterKey: AdapterNames, label: string, icon: React.ReactNode];

const outputOptions: OutputMode[] = [
  ['typescript', 'TypeScript', <TypeScriptIcon />],
  ['knex', 'Knex', <KnexIcon />],
  ['mongoose', 'Mongoose (MongoDB)', <MongoDbIcon />],
  ['sql', 'SQL "CREATE"', <PostgresIcon />],
];

type Props = {
  onChange: (adapter?: AdapterNames) => any;
};

export const OutputButtons = ({ onChange }: Props) => {
  const dispatch = useDispatch();
  const { inputData, schema } = useSelector((state: RootState) => state.analysisFeature);
  const { outputAdapter } = useSelector((state: RootState) => state.optionsActions);
  const hasParsedInputData = Boolean(schema);
  console.log({ hasParsedInputData });
  const schemaLinkProps = inputData
    ? {
        className: 'unlocked',
      }
    : {
        disabled: true,
        className: 'locked disabled',
        onClick: (e: any) => e.preventDefault(),
      };

  const onAdapterClicked = ({ adapter }: { adapter: AdapterNames }) => {
    dispatch(setOptions({ outputAdapter: adapter }));
    onChange(adapter);
  };
  return (
    <aside className="col-12" style={{ maxHeight: '80px' }}>
      <div className="output-buttons col-12 text-left">
        {outputOptions.map(([adapter, label, icon]) => {
          return (
            <Button
              onClick={() => onAdapterClicked({ adapter })}
              variant={outputAdapter === adapter ? 'contained' : 'outlined'}
              size="medium"
              color={hasParsedInputData && outputAdapter === adapter ? 'default' : 'primary'}
              startIcon={icon}
              {...schemaLinkProps}
            >
              <div className="text-left">{label}</div>
            </Button>
          );
        })}
      </div>
    </aside>
  );
};
