import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://fhykriij99.execute-api.us-east-2.amazonaws.com/dev';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 
    console.log(`🚀 AWS Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ AWS Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;