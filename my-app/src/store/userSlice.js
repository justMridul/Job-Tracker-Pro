// src/store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { name: 'John Doe', email: 'john.doe@example.com', avatarUrl: '' },
  reducers: {
    setUser: (state, action) => ({
      ...state,
      ...action.payload
    }),
    clearUser: state => ({
      name: '',
      email: '',
      avatarUrl: ''
    })
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
