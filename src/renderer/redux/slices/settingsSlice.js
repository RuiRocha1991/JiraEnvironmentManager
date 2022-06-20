import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: {
    isFirstLaunch: true,
  },
};

export const settingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    updateSettings: (state, { payload }) => {
      state.settings = {
        ...state.settings,
        ...payload,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
