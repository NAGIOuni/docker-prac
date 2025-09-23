// src/types/index.ts
// バックエンドAPIのレスポンスに対応した型定義

// ===== Core Entity Types =====
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCount {
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PostImage {
  id: string;
  postId: string;
  imageUrl: string;
  imageOrder: number;
  createdAt: string;
}

export interface PostWithUser extends Post {
  postedBy: PublicUser;
  images?: PostImage[];
  _count: {
    likedBy: number;
    comments: number;
  };
  isLikedByCurrentUser?: boolean;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ===== API Request Types =====
export interface CreateUserRequest {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface CreatePostRequest {
  userId: string;
  content: string;
  imageUrls?: string[];
}

export interface UpdatePostRequest {
  content?: string;
}

export interface CreateFollowRequest {
  userId: string;
  followingId: string;
}

export interface DeleteFollowRequest {
  userId: string;
}

export interface CreateLikeRequest {
  userId: string;
  postId: string;
}

export interface DeleteLikeRequest {
  userId: string;
  postId: string;
}

export interface CreateCommentRequest {
  userId: string;
  postId: string;
  parentCommentId?: string;
  content: string;
}

export interface UpdateCommentRequest {
  content?: string;
}

// ===== Query Types =====
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetPostsQuery {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface GetCommentsQuery {
  page?: number;
  limit?: number;
  postId?: string;
  parentCommentId?: string;
}

// ===== Component Props Types =====
export interface PostCardProps {
  post: PostWithUser;
  currentUserId?: string;
  onLike?: (postId: string, isLiked: boolean) => void;
  onDelete?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export interface UserCardProps {
  user: PublicUser;
  userCount?: UserCount;
  currentUserId?: string;
  isFollowing?: boolean;
  onFollow?: (userId: string, isFollowing: boolean) => void;
}

export interface TimelineProps {
  userId?: string; // 特定ユーザーのタイムラインの場合
  currentUserId?: string;
}

export interface CreatePostFormProps {
  onSubmit: (content: string, imageUrls?: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface UserProfileProps {
  userId: string;
  currentUserId?: string;
}

export interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  isFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void;
  className?: string;
}

// ===== Loading States =====
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PostsLoadingState extends LoadingState {
  posts: PostWithUser[];
  hasMore: boolean;
  page: number;
}

export interface UsersLoadingState extends LoadingState {
  users: PublicUser[];
  hasMore: boolean;
  page: number;
}

export interface UserDetailState extends LoadingState {
  user: User | null;
  userCount: UserCount | null;
  isFollowing: boolean;
}

// ===== Form Data Types =====
export interface PostFormData {
  content: string;
  images: File[];
}

export interface UserFormData {
  displayName: string;
  bio: string;
  profileImage?: File;
}

export interface CommentFormData {
  content: string;
}

export interface SearchFormData {
  query: string;
  type: "users" | "posts" | "all";
}

// ===== Navigation Types =====
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ===== Theme and UI Types =====
export type ThemeMode = "light" | "dark" | "system";

export interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "like" | "follow" | "comment" | "mention";
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  fromUser?: PublicUser;
}

// ===== Utility Types =====
export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  hasImages?: boolean;
}

// ===== Error Types =====
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== Auth Types (将来の認証システム用) =====
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

// ===== Search Types =====
export interface SearchResult {
  users: PublicUser[];
  posts: PostWithUser[];
  totalUsers: number;
  totalPosts: number;
}

export interface SearchQuery {
  query: string;
  type: "users" | "posts" | "all";
  page?: number;
  limit?: number;
}

// ===== Statistics Types =====
export interface UserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  likeCount: number;
  joinDate: string;
}

export interface PostStats {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount?: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalFollows: number;
  activeUsers: number;
}

// ===== Hooks Types =====
export interface UseApiOptions {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export interface UsePaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

// ===== Layout Types =====
export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  hideNavigation?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// ===== Type Guards (実行時型チェック用) =====
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "email" in obj
  );
}

export function isPost(obj: unknown): obj is Post {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "content" in obj
  );
}

export function isApiError(obj: unknown): obj is ApiError {
  return typeof obj === "object" && obj !== null && "message" in obj;
}
