import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    // this.client.interceptors.response.use(
    //   (response) => response,
    //   async (error) => {
    //     const originalRequest = error.config;

    //     if (error.response?.status === 401 && !originalRequest._retry) {
    //       if (this.isRefreshing) {
    //         // If we're already refreshing, queue this request
    //         return new Promise((resolve, reject) => {
    //           this.failedQueue.push({ resolve, reject });
    //         }).then((token) => {
    //           originalRequest.headers.Authorization = `Bearer ${token}`;
    //           return this.client(originalRequest);
    //         }).catch((err) => {
    //           return Promise.reject(err);
    //         });
    //       }

    //       originalRequest._retry = true;
    //       this.isRefreshing = true;

    //       try {
    //         const refreshToken = localStorage.getItem('refreshToken');
    //         if (!refreshToken) {
    //           throw new Error('No refresh token available');
    //         }

    //         const response = await this.client.post('/auth/refresh', {
    //           refreshToken,
    //         });

    //         const { accessToken } = response.data;
    //         localStorage.setItem('accessToken', accessToken);

    //         // Process the failed queue
    //         this.processQueue(null, accessToken);

    //         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    //         return this.client(originalRequest);
    //       } catch (refreshError) {
    //         this.processQueue(refreshError, null);
    //         this.clearTokens();
    //         window.location.href = '/login';
    //         return Promise.reject(refreshError);
    //       } finally {
    //         this.isRefreshing = false;
    //       }
    //     }

    //     return Promise.reject(error);
    //   }
    // );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  // Special method for file uploads
  async uploadFiles<T>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();