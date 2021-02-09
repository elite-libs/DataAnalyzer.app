import React from 'react';
import { useDispatch } from 'react-redux';
import { setInputData, setSchemaName } from 'store/analysisSlice';
import { setStatusMessage } from 'store/appStateSlice';
// import { RootState } from 'store/rootReducer';
import Chip from '@material-ui/core/Chip';
import SyncIcon from '@material-ui/icons/Sync';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import CloudDoneIcon from '@material-ui/icons/CloudDone';


const sampleDataSets: Record<'label' | 'value' | 'schemaName', string>[] = [
  { label: 'Users', value: 'users.example.json', schemaName: 'Users' },
  { label: 'People', value: 'swapi-people.json', schemaName: 'People' },
  {
    label: 'Real Estate', value: 'real-estate.example.json', schemaName: 'Property',
  },
  { label: 'Products', value: 'products-3000.csv', schemaName: 'Product' },
];


export const DemoDataMenu = () => {
  const dispatch = useDispatch();
  const [currentlyLoadingData, setCurrentlyLoadingData] = React.useState<string | null>(null);
  const [currentlyLoadedFile, setCurrentlyLoadedFile] = React.useState<string | null>(null);
  
  const getStatusIcon = (forFileName: string) => {
    if (currentlyLoadingData === forFileName) return <SyncIcon />;  
    if (currentlyLoadedFile === forFileName) return <CloudDoneIcon />;
    return <CloudDownloadIcon />;
  }

  const loadData = (name: string, filePath: string) => {
    dispatch(setInputData(''));
    setCurrentlyLoadingData(filePath);
    if (!filePath) {
      dispatch(setStatusMessage(''));
      setCurrentlyLoadingData(null);
      return;
    }
    dispatch(setStatusMessage(`One moment...\nImporting ${name} dataset...`));
    return fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        dispatch(setInputData(data));
        dispatch(setSchemaName(name));
        dispatch(setStatusMessage('Loaded Sample Dataset 🎉'));
        setCurrentlyLoadedFile(filePath);
      })
      .catch((error) => {
        console.error('ERROR:', error);
        dispatch(
          setStatusMessage(`Oh noes! Failed to load the ${name} dataset.
          Please file an issue on the project's GitHub Issues.`),
        );
      })
      .finally(() => {
        setCurrentlyLoadingData(null);
      });
  };

  return (
    <section className="demo-data-buttons col-7">
      <label>Try a sample dataset</label>
      {sampleDataSets.map((set) => {
        return (
          <Chip
            key={set.value}
            icon={getStatusIcon(set.value)}
            deleteIcon={getStatusIcon(set.value)}
            variant="outlined"
            size="small"
            color={currentlyLoadedFile !== set.value ? "primary" : "default"}
            label={set.label}
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
