import { apiClient } from './api';
import { User, ApiResponse, PaginatedResponse, UserStats } from '../types';

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

  async getUserStats(id: string): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>(`/users/${id}/stats`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get user stats');
  }

   // Follow/Unfollow functionality
  async followUser(userId: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(`/users/${userId}/follow`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to follow user');
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${userId}/follow`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to unfollow user');
    }
  }

  async checkFollowStatus(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ isFollowing: boolean }>>(
        `/users/${userId}/follow/status`
      );
      return response.success && response.data?.isFollowing === true;
    } catch (error) {
      console.error('Failed to check follow status:', error);
      return false;
    }
  }

  async getFollowers(userId: string, page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/users/${userId}/followers?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get followers');
  }

  async getFollowing(userId: string, page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/users/${userId}/following?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get following');
  }
}

export const userService = new UserService();
