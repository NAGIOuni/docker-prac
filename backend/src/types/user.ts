export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCount {
  posts: number;
  followers: number;
  following: number;
}

export interface PublicUserWithCount extends PublicUser {
  _count: UserCount;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
}

export interface UpdateUserRequest {
  displayName: string | null;
  bio: string | null;
  profileImageUrl: string | null;
}

export interface GetUsersQuery {
  page?: string;
  limit?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

export interface CreateUserResponse extends ApiResponse<User> {
  message: string;
}

export interface GetUserResponse
  extends ApiResponse<User & { _count: UserCount }> {}

export interface GetUsersResponse
  extends ApiResponse<PaginatedResponse<PublicUserWithCount>> {}

export interface UpdateUserResponse extends ApiResponse<User> {
  message: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
