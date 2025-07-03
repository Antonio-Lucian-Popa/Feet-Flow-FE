import { apiClient } from './api';
import { Post, CreatePostRequest, ApiResponse, PaginatedResponse } from '../types';

class PostService {
  async getPosts(page = 0, size = 20): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Post>>>(
      `/posts?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get posts');
  }

  async getPost(id: number): Promise<Post> {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get post');
  }

  async getPostsByCreator(creatorId: string, page = 0, size = 20): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Post>>>(
      `/posts/creator/${creatorId}?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get creator posts');
  }

  async createPost(postData: CreatePostRequest): Promise<Post> {
    const formData = new FormData();
    
    if (postData.title) formData.append('title', postData.title);
    if (postData.description) formData.append('description', postData.description);
    formData.append('isPublic', postData.isPublic.toString());
    
    postData.mediaFiles.forEach((file) => {
      formData.append('media', file);
    });
    
    const response = await apiClient.uploadFiles<ApiResponse<Post>>('/posts', formData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create post');
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post> {
    const response = await apiClient.put<ApiResponse<Post>>(`/posts/${id}`, postData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update post');
  }

  async deletePost(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/posts/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete post');
    }
  }

  async getFeedPosts(page = 0, size = 20): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Post>>>(
      `/posts/feed?page=${page}&size=${size}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get feed posts');
  }
}

export const postService = new PostService();