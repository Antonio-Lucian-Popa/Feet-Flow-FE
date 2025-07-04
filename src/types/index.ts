export interface User {
  id: string;
  firstName: string;
  lastName: string;
  keycloakId: string;
  email: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  bio?: string;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  likesCount: number;
  postsCount: number;
  subscribersCount: number;
}

export interface Post {
  id: number;
  creatorId: string;
  title?: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  creator?: User;
  media?: PostMedia[];
  votes?: Vote[];
  comments?: Comment[];
  voteCount?: number;
  userVote?: number;
}

export interface PostMedia {
  id: number;
  postId: number;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  thumbnailUrl?: string;
  orderIndex: number;
}

export interface Vote {
  id: number;
  userId: string;
  postId: number;
  value: 1 | -1;
  createdAt: string;
}

export interface Subscription {
  id: number;
  subscriberId: string;
  creatorId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  subscriber?: User;
  creator?: User;
}

export interface Comment {
  id: number;
  userId: string;
  postId: number;
  content: string;
  createdAt: string;
  user?: User;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'creator';
}

export interface CreatePostRequest {
  title?: string;
  description?: string;
  isPublic: boolean;
  mediaFiles: File[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}