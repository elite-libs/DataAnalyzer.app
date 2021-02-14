import React from 'react';
import { useDispatch } from 'react-redux';
import { setInputData, setSchemaName } from 'store/analysisSlice';
// import { RootState } from 'store/rootReducer';
import Chip from '@material-ui/core/Chip';
import SyncIcon from '@material-ui/icons/Sync';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import { SnackbarKey } from 'notistack';
import TooltipWrapper from './TooltipWrapper';
import { InfoOutlined } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { useAutoSnackbar } from 'hooks/useAutoSnackbar';

const sampleDataSets: Record<'label' | 'value' | 'schemaName', string>[] = [
  { label: 'Users', value: '/users.example.json', schemaName: 'Users' },
  { label: 'People', value: '/swapi-people.json', schemaName: 'People' },
  {
    label: 'Property',
    value: '/real-estate.example.json',
    schemaName: 'Property',
  },
  { label: 'Products', value: '/products-3000.csv', schemaName: 'Product' },
];

export const DemoDataMenu = () => {
  const history = useHistory();
  let _loadingSnackMessage: SnackbarKey | null = null;
  const { enqueueSnackbar, closeSnackbar } = useAutoSnackbar();
  const dispatch = useDispatch();
  const [currentlyLoadingData, setCurrentlyLoadingData] = React.useState<string | null>(null);
  const [currentlyLoadedFile, setCurrentlyLoadedFile] = React.useState<string | null>(null);

  const getStatusIcon = (forFileName: string) => {
    if (currentlyLoadingData === forFileName) return <SyncIcon />;
    if (currentlyLoadedFile === forFileName) return <CloudDoneIcon />;
    return <CloudDownloadIcon />;
  };

  const loadData = (name: string, filePath: string) => {
    dispatch(setInputData(''));
    setCurrentlyLoadingData(filePath);
    if (!filePath) {
      enqueueSnackbar('Unrecognized option: ' + name + ' ' + filePath, { variant: 'warning' });
      setCurrentlyLoadingData(null);
      return;
    }
    _loadingSnackMessage = enqueueSnackbar(`One moment...\nImporting ${name} dataset...`, {
      variant: 'success',
    });
    return fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        dispatch(setInputData(data));
        dispatch(setSchemaName(name));
        if (_loadingSnackMessage) closeSnackbar(_loadingSnackMessage);
        _loadingSnackMessage = null;
        enqueueSnackbar('Loaded Sample Dataset 🎉', { variant: 'success' });
        history.push('/');
        setCurrentlyLoadedFile(filePath);
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

  return (
    <section className="demo-data-buttons col-12 col-md-7 col-sm-7 pb-2 px-1">
      <TooltipWrapper
        tooltipContent={
          <>
            <b>Test out the service</b>
            <br />
            Real data sourced from public APIs.
          </>
        }
      >
        <label>
          <InfoOutlined color="action" fontSize="small" />
          demo:&#160;
        </label>
      </TooltipWrapper>
      {sampleDataSets.map((set) => {
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
      })}
    </section>
  );
  // <DropdownMenu
  //   buttonTextOverride="Demo: Choose a Dataset"
  //   onSelect={loadData}
  //   options={sampleDataSets}
  // />
};
