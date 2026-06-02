import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.107:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API request", { method: config.method, url: config.url });
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API response error", {
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (phone, password) => {
    const { data } = await api.post('/api/v1/field-officer/auth/login', { phone, password });
    if (data.token) {
      await AsyncStorage.setItem('authToken', data.token);
    }
    return data;
  },

  register: async (phone, password, full_name, location) => {
    const { data } = await api.post('/api/v1/field-officer/auth/register', {
      phone,
      password,
      full_name,
      location: location || null,
    });
    return data;
  },

  sendOtp: async (phone, purpose) => {
    const { data } = await api.post('/auth/send-otp', { phone, purpose });
    return data;
  },

  verifyOtp: async (otp_token, otp) => {
    const { data } = await api.post('/auth/verify-otp', { otp_token, otp });
    return data;
  },

  resetPassword: async (verified_token, new_password) => {
    const { data } = await api.post('/auth/reset-password', { verified_token, new_password });
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
  },
};

export const dashboardAPI = {
  getDashboard: async () => {
    const { data } = await api.get('/api/v1/field-officer/dashboard');
    return data;
  },
};

export const leadsAPI = {
  createLead: async (payload) => {
    const { data } = await api.post('/api/v1/field-officer/leads', payload);
    return data;
  },
  getLeads: async ({ search, stage } = {}) => {
    const params = {};
    if (search) params.search = search;
    if (stage && stage !== 'all') params.stage = stage;
    const { data } = await api.get('/api/v1/field-officer/leads', { params });
    return data;
  },
};

export default api;
