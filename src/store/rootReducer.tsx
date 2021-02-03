import { combineReducers } from '@reduxjs/toolkit';
import analysisFeature from './analysisSlice';
import appStateActions from './appStateSlice';

const rootReducer = combineReducers({
  analysisFeature,
  appStateActions,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
