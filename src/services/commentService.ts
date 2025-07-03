import { apiClient } from './api';
import { Comment, ApiResponse, PaginatedResponse } from '../types';

class CommentService {
  async getPostComments(postId: number, page = 0, size = 20): Promise<PaginatedResponse<Comment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Comment>>>(
      `/comments/post/${postId}?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get comments');
  }

  async createComment(postId: number, content: string): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>('/comments', {
      postId,
      content,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create comment');
  }

  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await apiClient.put<ApiResponse<Comment>>(`/comments/${id}`, {
      content,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update comment');
  }

  async deleteComment(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/comments/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete comment');
    }
  }
}

export const commentService = new CommentService();