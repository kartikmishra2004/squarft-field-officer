import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const data = await dashboardAPI.getDashboard();
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        profile: null,
        metrics: null,
        tasks: null,
        loading: true,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload.data.profile;
                state.metrics = action.payload.data.metrics;
                state.tasks = action.payload.data.tasks;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
