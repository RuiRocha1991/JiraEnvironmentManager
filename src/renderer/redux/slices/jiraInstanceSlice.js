/* eslint-disable no-underscore-dangle */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jiraInstances: [],
  selectedJiraInstance: undefined,
};

const initialUiState = {
  isStartingOrStopping: false,
  isDeleting: false,
};

export const jiraInstanceSlice = createSlice({
  name: 'jiraInstance',
  initialState,
  reducers: {
    loadAllInstances: (state, { payload }) => {
      state.jiraInstances = payload.map((instance) => ({
        ...instance,
        ui: initialUiState,
      }));
    },
    addInstance: (state, { payload }) => {
      state.jiraInstances.push(payload.data);
    },
    startingOrStoppingInstance: (state, { payload }) => {
      state.jiraInstances = state.jiraInstances.map((instance) => {
        if (instance._id === payload.instanceId) {
          instance.ui.isStartingOrStopping = payload.isStartingOrStopping;
        }
        return instance;
      });
    },
    startOrStopInstance: (state, { payload }) => {
      state.jiraInstances = state.jiraInstances.map((instance) => {
        if (instance._id === payload._id) {
          return { ...instance, ...payload };
        }
        return instance;
      });
    },
    selectJiraInstance: (state, { payload }) => {
      state.selectedJiraInstance = state.jiraInstances.find(
        (instance) => instance._id === payload
      );
    },
    removeSelectedInstance: (state) => {
      state.selectedJiraInstance = undefined;
    },
    updateInstance: (state, { payload }) => {
      state.jiraInstances = state.jiraInstances.map((instance) => {
        if (instance._id === payload._id) {
          return {
            ...instance,
            ...payload,
          };
        }
        return instance;
      });
      state.selectedJiraInstance = undefined;
    },
    deleteInstance: (state, { payload }) => {
      state.jiraInstances = state.jiraInstances.filter(
        (instance) => instance._id !== payload
      );
      state.selectedJiraInstance = undefined;
    },
  },
});

export const {
  loadAllInstances,
  addInstance,
  startingOrStoppingInstance,
  startOrStopInstance,
  selectJiraInstance,
  removeSelectedInstance,
  updateInstance,
  deleteInstance,
} = jiraInstanceSlice.actions;

export default jiraInstanceSlice.reducer;
