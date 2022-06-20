/* eslint import/no-named-as-default: off, import/prefer-default-export: off */
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import createSagaMiddleware from 'redux-saga';
import storage from 'redux-persist/es/storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer, persistStore } from 'redux-persist';
import rootSaga from '../sagas';

import settingsSlice from '../slices/settingsSlice';

const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};

const reducers = combineReducers({
  appSettings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [sagaMiddleware],
});
sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
