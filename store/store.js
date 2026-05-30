import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import projectsSlice from './slices/projectsSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        projects: projectsSlice,
    },
});
