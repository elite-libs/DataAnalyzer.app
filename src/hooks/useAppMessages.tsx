import React from 'react';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import { useSelector } from 'react-redux';
import { RootState } from 'store/rootReducer';

export default function useAppMessages() {
  const { parsedInput } = useSelector((state: RootState) => state.appStateActions);
  const { schemaTimestamp } = useSelector((state: RootState) => state.analysisFeature);
  // Create any labels & user instructions
  return {
    inputDataMissing: !parsedInput ? (
      <div>
        <AnnouncementIcon color="action" />
        <b>No valid input data.</b>
        <br />
        Use either the Demo Dataset buttons, OR paste your own data in the input textarea.
      </div>
    ) : null,
    schemaNeeded:
      schemaTimestamp == null ? (
        <div>
          <AnnouncementIcon color="disabled" />
          <b>Choose a Formatter</b>
          <br />
          Click on one of the code formatter buttons to continue!
        </div>
      ) : null,
  };
}
