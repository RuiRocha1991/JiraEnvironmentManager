import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  process: undefined,
};

export const processInfoSlice = createSlice({
  name: 'processInfo',
  initialState,
  reducers: {
    startProcess: (state, { payload }) => {
      state.process = {
        ...payload,
      };
    },
    updateProcess: (state, { payload }) => {
      state.process = {
        ...state.process,
        ...payload,
      };
    },
    finishProcess: (state) => {
      state.process = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { startProcess, updateProcess, finishProcess } =
  processInfoSlice.actions;

export default processInfoSlice.reducer;
