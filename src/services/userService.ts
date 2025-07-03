import { apiClient } from './api';
import { User, ApiResponse, PaginatedResponse } from '../types';

class UserService {
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get user');
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update user');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', userData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update profile');
  }

  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiClient.uploadFiles<ApiResponse<User>>('/users/profile/picture', formData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to upload profile picture');
  }

  async getCreators(page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/users/creators?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get creators');
  }

  async searchUsers(query: string, page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/users/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to search users');
  }
}

export const userService = new UserService();