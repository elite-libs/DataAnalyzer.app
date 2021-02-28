import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSchemaName } from 'store/analysisSlice';
import { setInputData } from 'store/appStateSlice';
// import { RootState } from 'store/rootReducer';
// import Chip from '@material-ui/core/Chip';
// import SyncIcon from '@material-ui/icons/Sync';
// import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
// import CloudDoneIcon from '@material-ui/icons/CloudDone';
// import { SnackbarKey } from 'notistack';
import TooltipWrapper from '../TooltipWrapper';
// import { InfoOutlined } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';
import { useAnalytics } from 'hooks/useAnalytics';

import './DemoDataMenu.scss';

export const sampleDataSets: Record<'label' | 'value' | 'schemaName', string>[] = [
  { label: 'Users', value: '/data/users.example.json', schemaName: 'Users' },
  { label: 'People', value: '/data/swapi-people.json', schemaName: 'People' },
  {
    label: 'Property',
    value: '/data/real-estate.example.json',
    schemaName: 'Property',
  },
  { label: 'Products', value: '/data/products-3000.csv', schemaName: 'Product' },
  {
    label: 'Events',
    value: '/data/historic-events.json',
    schemaName: 'HistoricEvent',
  },
  {
    label: 'Pokemon',
    value: '/data/pokemon-charmander.json',
    schemaName: 'Pokemon',
  },
];

export const DemoDataMenu = () => {
  const { trackCustomEvent } = useAnalytics();
  const history = useHistory();
  const { enqueueSnackbar } = useAutoSnackbar();
  const dispatch = useDispatch();
  const [currentlyLoadingData, setCurrentlyLoadingData] = React.useState<string | null>(
    null,
  );
  // const [currentlyLoadedFile, setCurrentlyLoadedFile] = React.useState<string | null>(
  //   null,
  // );

  // const getStatusIcon = (forFileName: string) => {
  //   if (currentlyLoadingData === forFileName) return <SyncIcon />;
  //   if (currentlyLoadedFile === forFileName) return <CloudDoneIcon />;
  //   return <CloudDownloadIcon />;
  // };

  /** choose a random dataset and load it  */
  const iAmFeelingLucky = () => {
    const rnd = parseInt(`${Math.random() * sampleDataSets.length}`, 10);
    setCurrentlyLoadingData('truthiness');
    setTimeout(() => {
      return loadData(sampleDataSets[rnd]?.schemaName!, sampleDataSets[rnd]?.value!);
    }, 1250);
  };

  const loadData = (name: string, filePath: string) => {
    dispatch(setInputData(''));
    setCurrentlyLoadingData(filePath);
    if (!filePath) {
      enqueueSnackbar('Unrecognized option: ' + name + ' ' + filePath, {
        variant: 'warning',
      });
      setCurrentlyLoadingData(null);
      return;
    }
    trackCustomEvent({
      category: 'demoData.import',
      action: 'click',
      label: name,
    });
    // _loadingSnackMessage = enqueueSnackbar(`One moment...\nImporting ${name} dataset...`, {
    //   variant: 'success',
    // });
    return fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        dispatch(setInputData(data));
        dispatch(setSchemaName(name));
        // if (_loadingSnackMessage) closeSnackbar(_loadingSnackMessage);
        // _loadingSnackMessage = null;
        enqueueSnackbar(`Loaded the "${name}" Dataset 🎉`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
        });
        history.push('/');
        // setCurrentlyLoadedFile(filePath);
      })
      .catch((error) => {
        console.error('ERROR:', error);
        enqueueSnackbar(
          `Oh noes! Failed to load the ${name} dataset. Please file an issue on the project's GitHub Issues.`,
          { variant: 'error' },
        );
      })
      .finally(() => {
        setCurrentlyLoadingData(null);
      });
  };

  useEffect(() => {
    iAmFeelingLucky();
    // loadData(sampleDataSets[2]?.label || 'Users', sampleDataSets[2]?.value!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TooltipWrapper
        tooltipContent={
          <>
            <b>Test out random data from real APIs</b>
            <br />
            Roll the dice &amp; see how DataAnalyzer.app handles all kinds of data!
          </>
        }
      >
        <label className="demo-link" onClick={iAmFeelingLucky}>
          <b>Test it out!&#160;&#160;</b>
          <div className="roll-dice-wrapper">
            <div
              className={'roll-dice ' + (currentlyLoadingData ? 'animated' : '')}
            ></div>
          </div>
        </label>
      </TooltipWrapper>
      {/* {sampleDataSets.map((set) => {
        return (
          <Chip
            key={set.value}
            icon={getStatusIcon(set.value)}
            deleteIcon={getStatusIcon(set.value)}
            variant="outlined"
            size="small"
            color={currentlyLoadedFile !== set.value ? 'primary' : 'default'}
            label={set.label}
            style={{ maxWidth: '94px' }}
            onClick={() => loadData(set.schemaName, set.value)}
          />
        );
      })} */}
    </>
  );
  // <DropdownMenu
  //   buttonTextOverride="Demo: Choose a Dataset"
  //   onSelect={loadData}
  //   options={sampleDataSets}
  // />
};
