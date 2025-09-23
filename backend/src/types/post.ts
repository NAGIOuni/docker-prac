export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PostWithUser {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  postedBy: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

export interface PostCount {
  likedBy: number;
  comments: number;
}

export interface PostWithCount extends PostWithUser {
  _count: PostCount;
}

export interface PostImage {
  id: string;
  postId: string;
  imageUrl: string;
  createdAt: Date;
}

export interface FullPost extends PostWithCount {
  postImages: PostImage[];
  isLiked?: boolean;
}

export interface CreatePostRequest {
  content: string;
  imageUrls?: string[];
}

export interface UpdatePostRequest {
  content?: string;
}

export interface GetPostsQuery {
  page?: string;
  limit?: string;
  userId?: string;
  search?: string;
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

export interface CreatePostResponse extends ApiResponse<FullPost> {
  message: string;
}

export interface GetPostResponse extends ApiResponse<FullPost> {}

export interface GetPostsResponse
  extends ApiResponse<PaginatedResponse<PostWithCount>> {}

export interface UpdatePostResponse extends ApiResponse<FullPost> {
  message: string;
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
}
