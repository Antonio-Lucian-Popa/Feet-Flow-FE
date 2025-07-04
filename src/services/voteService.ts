import { apiClient } from './api';
import { Vote, ApiResponse } from '../types';

class VoteService {
  async votePost(postId: string, value: 1 | -1): Promise<Vote> {
    const response = await apiClient.post<ApiResponse<Vote>>('/votes', {
      postId,
      value,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to vote on post');
  }

  async removeVote(postId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/votes/post/${postId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove vote');
    }
  }

  async getPostVotes(postId: string): Promise<{ upvotes: number; downvotes: number }> {
    const response = await apiClient.get<ApiResponse<{ upvotes: number; downvotes: number }>>(
      `/votes/post/${postId}/count`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get post votes');
  }
}

export const voteService = new VoteService();