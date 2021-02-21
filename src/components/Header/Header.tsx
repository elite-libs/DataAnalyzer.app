import React from 'react';
import pkg from '../../../package.json';

import AppIcon from 'images/DataAnalyzerDualColor.svg';

import { Link as RouteLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import GitHubIcon from '@material-ui/icons/GitHub';

import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

import TooltipWrapper from 'components/TooltipWrapper';
import { setResults, setSchema } from 'store/analysisSlice';
import useAppMessages from 'hooks/useAppMessages';
import { RootState } from 'store/rootReducer';
import { DemoDataMenu } from '../DemoDataMenu';

import './Header.scss';

export default function Header() {
  const dispatch = useDispatch();
  // const { trackCustomEvent } = useAnalytics();
  // const { enqueueSnackbar } = useAutoSnackbar();
  const messages = useAppMessages();
  const { results } = useSelector((state: RootState) => state.analysisFeature);
  // const options = useSelector((state: RootState) => state.optionsActions);
  const { parsedInput } = useSelector((state: RootState) => state.appStateActions);
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
      <h1 className="col-12 col-sm-6" title="Reset/Load Home Screen">
        <Link className="brand-link" component={RouteLink} to="/" onClick={resetResults}>
          <img src={AppIcon} alt="Data Analyzer app icon" />
          DataAnalyzer.app
        </Link>
      </h1>
      <aside className="icon-button-box col-12 col-sm-6 text-right">
        <DemoDataMenu />

        <Link className={''} component={RouteLink} to="/about" title="View README">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Link>
        <Link className={''} target="_blank" href={pkg.repository.url}>
          <GitHubIcon fontSize="small" color="action" />
        </Link>
        <Link
          className={''}
          component={RouteLink}
          to="/options"
          title="Settings / Configuration"
          aria-label="Settings / Configuration"
        >
          <SettingsIcon fontSize="large" color="primary" />
          {/* <SettingsIcon fontSize="large" color="secondary" />
          <SettingsIcon fontSize="large" color="action" />
          <SettingsIcon fontSize="large" color="disabled" />
          <SettingsIcon fontSize="large" color="error" />
          <SettingsIcon fontSize="large" color="inherit" /> */}
        </Link>
      </aside>
      {!results ? (
        <></>
      ) : (
        <Breadcrumbs
          separator={<span className="divider d-md-block d-none">|</span>}
          aria-label="breadcrumb"
          className="col-sm-12 col-12 pb-2 px-1"
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
