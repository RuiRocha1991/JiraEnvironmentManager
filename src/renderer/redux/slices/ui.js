import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snackBar: {
    isOpen: false,
    message: '',
    isSuccess: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    onToggleSnackBar: (state, { payload }) => {
      state.snackBar = {
        isOpen: true,
        message: payload.message,
        isSuccess: payload.status === 'OK',
      };
    },
    onDismissSnackBar: (state) => {
      state.snackBar = {
        isOpen: false,
        message: '',
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { onToggleSnackBar, onDismissSnackBar } = uiSlice.actions;

export default uiSlice.reducer;
