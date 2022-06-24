import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jiraInstances: [],
  selectedJiraInstance: undefined,
};

export const jiraInstanceSlice = createSlice({
  name: 'jiraInstance',
  initialState,
  reducers: {
    loadAllInstances: (state, { payload }) => {
      state.jiraInstances = payload;
    },
    addInstance: (state, { payload }) => {
      state.jiraInstances.push(payload.data);
    },
  },
});

// Action creators are generated for each case reducer function
export const { loadAllInstances, addInstance } = jiraInstanceSlice.actions;

export default jiraInstanceSlice.reducer;
