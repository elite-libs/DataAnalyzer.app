import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOptions } from 'store/optionsSlice';
import { RootState } from 'store/rootReducer';
import Button from '@material-ui/core/Button';
import {
  PostgresIcon,
  MongoDbIcon,
  TypeScriptIcon,
  KnexIcon,
} from './SchemaTools/AppIcons.js';

import './SchemaTools/index.scss';
import { AdapterNames } from './SchemaTools/adapters/writers.js';

type OutputMode = [
  adapterKey: AdapterNames,
  label: string,
  icon: React.ReactNode,
];

const outputOptions: OutputMode[] = [
  ['typescript', 'TypeScript', <TypeScriptIcon />],
  ['knex', 'Knex', <KnexIcon />],
  ['mongoose', 'Mongoose (MongoDB)', <MongoDbIcon />],
  ['sql', 'SQL "CREATE"', <PostgresIcon />],
];

export const OutputButtons = () => {
  const dispatch = useDispatch();
  const { inputTimestamp } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const { outputAdapter } = useSelector(
    (state: RootState) => state.optionsActions,
  );

  const schemaLinkProps = inputTimestamp
    ? {
        // style: { cursor: 'pointer', color: '#469408', fontWeight: '500' },
        className: 'unlocked',
      }
    : {
        disabled: true,
        // style: {
        //   cursor: 'not-allowed',
        //   color: '#77777766',
        //   fontWeight: '200',
        //   textDecoration: 'none',
        // },
        className: 'locked disabled',
        onClick: (e: any) => e.preventDefault(),
      };
  return (
    <aside className="col-12" style={{ maxHeight: '80px' }}>
      <div className="output-buttons col-12 text-left">
        {outputOptions.map(([adapter, label, icon]) => {
          return (
            <Button
              onClick={() => dispatch(setOptions({ outputAdapter: adapter }))}
              variant={outputAdapter === adapter ? 'contained' : 'outlined'}
              size="medium"
              color={outputAdapter === adapter ? 'default' : 'primary'}
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
