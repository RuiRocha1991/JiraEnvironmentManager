import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  progressInfo: {
    process: undefined,
    isInProgress: false,
  },
};

export const processInfoSlice = createSlice({
  name: 'processInfo',
  initialState,
  reducers: {
    startProcess: (state, { payload }) => {
      state.progressInfo = {
        process: payload,
        isInProgress: true,
      };
    },
    updateProcess: (state, { payload }) => {
      state.progressInfo = {
        ...state.processInfo,
        process: payload,
      };
    },
    finishProcess: (state) => {
      state.progressInfo = {
        process: undefined,
        isInProgress: false,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { startProcess, updateProcess, finishProcess } =
  processInfoSlice.actions;

export default processInfoSlice.reducer;
