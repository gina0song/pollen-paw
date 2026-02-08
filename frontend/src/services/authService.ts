import { api } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<any>('/auth/register', data);
      if (response.id && !response.token) {
        return authService.login({ email: data.email, password: 'password_placeholder' });
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
};

export default authService;