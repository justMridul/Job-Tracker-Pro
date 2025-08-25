// src/store/jobsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching jobs
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await fetch('/api/jobs');
  if (!response.ok) throw new Error('Failed to fetch jobs');
  return await response.json();
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { jobs: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchJobs.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default jobsSlice.reducer;
