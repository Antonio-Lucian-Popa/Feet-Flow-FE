import { apiClient } from './api';
import { AuthTokens, LoginRequest, RegisterRequest, User, ApiResponse } from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get current user');
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    }
    
    throw new Error(response.message || 'Token refresh failed');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();