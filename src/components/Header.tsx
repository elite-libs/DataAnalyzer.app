import React from 'react';
import pkg from '../../package.json';

import AppIcon from 'images/DataAnalyzerDualColor.svg';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouteLink,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import copy from 'clipboard-copy';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import FileCopy from '@material-ui/icons/FileCopyOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import GitHubIcon from '@material-ui/icons/GitHub';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

import AdvancedOptionsForm from './SchemaTools/AdvancedOptionsForm';
import InputProcessor from './SchemaTools/InputProcessor';

import TooltipWrapper from 'components/TooltipWrapper';
import LoadingSpinner from 'components/LoadingSpinner';

import { DemoDataMenu } from '../components/DemoDataMenu';

import { setResults, setSchema, setSchemaName } from 'store/analysisSlice';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
import { FormControl, Input, InputAdornment, InputLabel } from '@material-ui/core';
import { DatabaseEditIcon } from './SchemaTools/AppIcons';
import { useAnalytics } from 'hooks/useAnalytics';
import useAppMessages from 'hooks/useAppMessages';
import { RootState } from 'store/rootReducer';

export default function Header() {
  const dispatch = useDispatch();
  // const { trackCustomEvent } = useAnalytics();
  // const { enqueueSnackbar } = useAutoSnackbar();
  const messages = useAppMessages();
  const { results, schemaTimestamp, schemaName, schema } = useSelector(
    (state: RootState) => state.analysisFeature,
  );
  const options = useSelector((state: RootState) => state.optionsActions);
  const { parsedInput, inputData } = useSelector(
    (state: RootState) => state.appStateActions,
  );
  function resetResults() {
    dispatch(setSchema(null));
    dispatch(setResults(null));
  }

  const schemaLinkProps = parsedInput
    ? { className: 'unlocked' }
    : {
        disabled: true,
        className: 'locked disabled',
        onClick: (e: any) => e.preventDefault(),
      };

  return (
    <nav className="row row-block w-100">
      <h1 className="col-9 col-sm-10" title="Reset/Load Home Screen">
        <Link className="brand-link" component={RouteLink} to="/" onClick={resetResults}>
          <img src={AppIcon} alt="Data Analyzer app icon" />
          DataAnalyzer.app
        </Link>
      </h1>
      <aside className="icon-button-box col-3 col-sm-2 text-right">
        <Link
          className={'py-2 mx-2'}
          component={RouteLink}
          to="/about"
          title="View README"
        >
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Link>
        <Link className={'py-2 mx-2'} target="_blank" href={pkg.repository.url}>
          <GitHubIcon fontSize="small" color="action" />
        </Link>
        <AdvancedOptionsForm />
      </aside>
      {!results ? (
        <FormControl className="col-md-4 col-sm-4 col-12 pb-2 pl-1">
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
      ) : (
        <Breadcrumbs
          separator={<span className="divider d-md-block d-none">|</span>}
          aria-label="breadcrumb"
          className="col-md-4 col-sm-4 col-12 pb-2 px-1"
        >
          <Link component={RouteLink} to="/" onClick={resetResults}>
            <HomeOutlinedIcon />
            <span className="d-md-inline-block d-none">Code Generator</span>
          </Link>
          <Link component={RouteLink} {...schemaLinkProps} to="/results/explorer">
            <TooltipWrapper
              tooltipContent={messages.inputDataMissing || messages.schemaNeeded}
            >
              <div>
                <AssessmentOutlinedIcon />
                <span className="d-md-inline-block d-none">Data Visualization</span>
              </div>
            </TooltipWrapper>
          </Link>
        </Breadcrumbs>
      )}
      <DemoDataMenu />
    </nav>
  );

  // <div className="jumbotron jumbotron-fluid">
  //   <div className="container d-flex justify-content-between align-items-center">
  //     <div className="head-text" style={{ flexGrow: 2 }}>
  //       <h1 className="display-4">DataAnalyzer.app</h1>
  //     </div>
  //   </div>
  //   <div className="container">
  //     <p className="lead">
  //       Paste JSON or CSV data to automatically generate typed code.
  //       <br />
  //       Supports <b>TypeScript, Mongoose, Knex, and SQL</b>
  //     </p>
  //     <p className="lead">100% local farm-to-table. (Data stays local)</p>
  //   </div>
  // </div>
}
