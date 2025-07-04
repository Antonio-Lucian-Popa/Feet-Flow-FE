import { apiClient } from './api';
import { Subscription, ApiResponse, PaginatedResponse } from '../types';

class SubscriptionService {
  async subscribe(creatorId: string): Promise<Subscription> {
    const response = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', {
      creatorId,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to subscribe');
  }

  async unsubscribe(creatorId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/subscriptions/creator/${creatorId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to unsubscribe');
    }
  }

  async getMySubscriptions(page = 0, size = 20): Promise<PaginatedResponse<Subscription>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Subscription>>>(
      `/subscriptions/my?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get subscriptions');
  }

  async getCreatorSubscriptions(page = 0, size = 20): Promise<PaginatedResponse<Subscription>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Subscription>>>(
      `/subscriptions/creator?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get creator subscriptions');
  }

  async checkSubscription(creatorId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ id: string | null; endDate: string | null; active: boolean }>>(
        `/subscriptions/check/${creatorId}`
      );
      
      // FIXED: Check both success and active status
      return response.success && response.data?.active === true;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  }
}

export const subscriptionService = new SubscriptionService();