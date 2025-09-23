// src/lib/api-client.ts
// 型定義をsrc/types/index.tsからインポート
import type {
  User,
  PublicUser,
  PostWithUser,
  Follow,
  Like,
  CreateUserRequest,
  UpdateUserRequest,
  CreatePostRequest,
  UpdatePostRequest,
  CreateFollowRequest,
  DeleteFollowRequest,
  CreateLikeRequest,
  DeleteLikeRequest,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// 基本的なAPIレスポンス型（バックエンドと同じ形式）
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Response型（API固有）
export interface UserResponse {
  user: User;
  counts: {
    followerCount: number;
    followingCount: number;
    postCount: number;
  };
}

export interface PostResponse {
  post: PostWithUser;
}

export interface FollowStatusResponse {
  isFollowing: boolean;
  followId?: string;
}

export interface LikeStatusResponse {
  isLiked: boolean;
  likeId?: string;
  likeCount: number;
}

// API通信の基本関数
export const apiClient = {
  // GET リクエスト
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API GET Error:", error);
      throw error;
    }
  },

  // POST リクエスト
  async post<T, U>(endpoint: string, body: U): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API POST Error:", error);
      throw error;
    }
  },

  // PUT リクエスト
  async put<T, U>(endpoint: string, body: U): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API PUT Error:", error);
      throw error;
    }
  },

  // DELETE リクエスト
  async delete<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const config: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API DELETE Error:", error);
      throw error;
    }
  },
};

// 便利なAPI関数たち（型安全）
export const usersApi = {
  // ユーザー一覧取得
  getUsers: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<PublicUser>>(
      `/users?page=${page}&limit=${limit}`
    ),

  // 特定ユーザー取得
  getUser: (id: string) => apiClient.get<UserResponse>(`/users/${id}`),

  // ユーザー作成
  createUser: (userData: CreateUserRequest) =>
    apiClient.post<UserResponse, CreateUserRequest>("/users", userData),

  // ユーザー更新
  updateUser: (id: string, userData: UpdateUserRequest) =>
    apiClient.put<UserResponse, UpdateUserRequest>(`/users/${id}`, userData),

  // ユーザー削除
  deleteUser: (id: string) =>
    apiClient.delete<{ message: string }>(`/users/${id}`),
};

export const postsApi = {
  // 投稿一覧取得
  getPosts: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<PostWithUser>>(
      `/posts?page=${page}&limit=${limit}`
    ),

  // 特定投稿取得
  getPost: (id: string) => apiClient.get<PostResponse>(`/posts/${id}`),

  // 投稿作成
  createPost: (postData: CreatePostRequest) =>
    apiClient.post<PostResponse, CreatePostRequest>("/posts", postData),

  // 投稿更新
  updatePost: (id: string, postData: UpdatePostRequest) =>
    apiClient.put<PostResponse, UpdatePostRequest>(`/posts/${id}`, postData),

  // 投稿削除
  deletePost: (id: string) =>
    apiClient.delete<{ message: string }>(`/posts/${id}`),
};

export const followsApi = {
  // フォロー作成
  followUser: (userId: string, followingId: string) =>
    apiClient.post<{ follow: Follow }, CreateFollowRequest>("/follows", {
      userId,
      followingId,
    }),

  // アンフォロー
  unfollowUser: (userId: string, followingId: string) =>
    apiClient.delete<{ message: string }>(`/follows/${followingId}`, {
      userId,
    }),

  // フォロー状態確認
  getFollowStatus: (targetUserId: string, userId: string) =>
    apiClient.get<FollowStatusResponse>(
      `/follows/status/${targetUserId}?userId=${userId}`
    ),
};

export const likesApi = {
  // いいね作成
  likePost: (userId: string, postId: string) =>
    apiClient.post<{ like: Like }, CreateLikeRequest>("/likes", {
      userId,
      postId,
    }),

  // いいね削除
  unlikePost: (userId: string, postId: string) =>
    apiClient.delete<{ message: string }>("/likes", { userId, postId }),

  // いいね状態確認
  getLikeStatus: (postId: string, userId: string) =>
    apiClient.get<LikeStatusResponse>(
      `/likes?postId=${postId}&userId=${userId}`
    ),
};
