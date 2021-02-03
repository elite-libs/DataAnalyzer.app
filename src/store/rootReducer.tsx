import { combineReducers } from '@reduxjs/toolkit';
import analysisFeature from './analysisSlice';

const rootReducer = combineReducers({
  analysisFeature,
});

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
