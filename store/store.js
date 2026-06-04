import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import projectsSlice from './slices/projectsSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        project: projectReducer,
        projects: projectsSlice,
        notifications: notificationReducer,
        dashboard: dashboardReducer,
        profile: profileReducer,
    },
});
