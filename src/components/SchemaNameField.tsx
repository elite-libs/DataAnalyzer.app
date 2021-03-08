import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatabaseEditIcon } from 'components/AppIcons';
import { setSchemaName } from 'store/analysisSlice';
import { FormControl, Input, InputAdornment, InputLabel } from '@material-ui/core';
import TooltipWrapper from 'components/TooltipWrapper';
import { RootState } from 'store/rootReducer';

export default function SchemaNameField({ className = '' }: { className: string }) {
  const dispatch = useDispatch();
  const { schemaName } = useSelector((state: RootState) => state.analysisFeature);
  return (
    <FormControl className={`schema-name-input ${className}`}>
      <TooltipWrapper
        tooltipContent={
          <>
            <b>Label your dataset</b>
            <br />
            Will be used as a name prefix for nested data structures.
            <br />
            <b>Examples:</b> Customer, Customer-&gt;Product[], Product, Product:Inventory,
            Articles-&gt;Comments[], etc.
          </>
        }
      >
        <InputLabel htmlFor="schema-name">Name your dataset</InputLabel>
      </TooltipWrapper>
      <Input
        id="schema-name"
        aria-label="Enter your schema name"
        onChange={(e) => dispatch(setSchemaName(e.target.value))}
        value={schemaName}
        startAdornment={
          <InputAdornment position="start">
            <DatabaseEditIcon />
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
