import { combineReducers } from '@reduxjs/toolkit';
import analysisFeature from './analysisSlice';
import appStateActions from './appStateSlice';
import optionsActions from './optionsSlice';

const rootReducer = combineReducers({
  analysisFeature,
  appStateActions,
  optionsActions,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
