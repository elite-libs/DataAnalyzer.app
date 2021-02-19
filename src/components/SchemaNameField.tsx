import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatabaseEditIcon } from './SchemaTools/AppIcons';
import { setSchemaName } from 'store/analysisSlice';
import { FormControl, Input, InputAdornment, InputLabel } from '@material-ui/core';
import TooltipWrapper from 'components/TooltipWrapper';
import { RootState } from 'store/rootReducer';

export default function SchemaNameField({}) {
  const dispatch = useDispatch();
  const { schemaName } = useSelector((state: RootState) => state.analysisFeature);
  return (
    <FormControl className="schema-name-input col-md-4 col-sm-4 col-12 pb-2 pl-1">
      <TooltipWrapper
        tooltipContent={
          <>
            <b>Label your dataset</b>
            <br />
            Used as a prefix for any nested data structures.
            <br />
            <b>Examples:</b> Customer, Product, Articles, etc.
          </>
        }
      >
        <InputLabel htmlFor="schema-name">Schema Name</InputLabel>
      </TooltipWrapper>
      <Input
        id="schema-name"
        onChange={(e) => dispatch(setSchemaName(e.target.value))}
        value={schemaName}
        startAdornment={
          <InputAdornment position="start">
            <DatabaseEditIcon width="1.5rem" height="1.5rem" />
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
