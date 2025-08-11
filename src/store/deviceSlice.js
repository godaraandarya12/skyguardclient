// store/deviceSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  ip: '',
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDevice(state, action) {
      state.id = action.payload.id;
      state.ip = action.payload.ip;
    },
    clearDevice(state) {
      state.id = '';
      state.ip = '';
    },
  },
});

export const { setDevice, clearDevice } = deviceSlice.actions;
export default deviceSlice.reducer;
