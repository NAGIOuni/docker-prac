// ========================================
// Core Like Types
// ========================================

/**
 * いいね情報
 */
export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

/**
 * いいね情報（ユーザー詳細付き）
 */
export interface LikeWithUser {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

/**
 * いいね情報（投稿詳細付き）
 */
export interface LikeWithPost {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  post: {
    id: string;
    content: string;
    createdAt: Date;
    postedBy: {
      id: string;
      username: string;
      displayName: string;
    };
  };
}

// ========================================
// Request Types
// ========================================

/**
 * いいね作成リクエスト
 */
export interface CreateLikeRequest {
  postId: string; // いいねする投稿のID
}

/**
 * いいね一覧取得クエリパラメータ
 */
export interface GetLikesQuery {
  page?: string;
  limit?: string;
  userId?: string; // 特定ユーザーのいいね一覧
  postId?: string; // 特定投稿のいいね一覧
}

// ========================================
// Response Types
// ========================================

/**
 * 標準APIレスポンス形式（再利用）
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ページネーション情報（再利用）
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * ページネーション付きレスポンス（再利用）
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * いいね作成レスポンス
 */
export interface CreateLikeResponse extends ApiResponse<Like> {
  message: string;
}

/**
 * いいねステータス確認レスポンス
 */
export interface LikeStatusResponse
  extends ApiResponse<{
    isLiked: boolean;
    likeId?: string;
    likesCount: number;
  }> {}

/**
 * 投稿のいいね一覧取得レスポンス
 */
export interface GetPostLikesResponse
  extends ApiResponse<PaginatedResponse<LikeWithUser>> {}

/**
 * ユーザーのいいね投稿一覧取得レスポンス
 */
export interface GetUserLikesResponse
  extends ApiResponse<PaginatedResponse<LikeWithPost>> {}

/**
 * いいね削除レスポンス
 */
export interface DeleteLikeResponse {
  success: boolean;
  message: string;
  likesCount: number; // 削除後のいいね数
}

/**
 * いいね統計情報レスポンス
 */
export interface LikeStatsResponse
  extends ApiResponse<{
    totalLikesGiven: number; // 与えたいいね数
    totalLikesReceived: number; // 受け取ったいいね数
    mostLikedPost?: {
      id: string;
      content: string;
      likesCount: number;
    };
    recentLikedPosts: Array<{
      id: string;
      content: string;
      createdAt: Date;
    }>;
  }> {}

// ========================================
// Type Guards
// ========================================

/**
 * CreateLikeRequestの型ガード
 */
export function isCreateLikeRequest(obj: unknown): obj is CreateLikeRequest {
  if (typeof obj !== "object" || obj === null) return false;

  const req = obj as Record<string, unknown>;
  return typeof req.postId === "string" && req.postId.trim().length > 0;
}

// ========================================
// Utility Types
// ========================================

/**
 * いいねの種類（将来の拡張用）
 */
export type LikeType = "like" | "love" | "laugh" | "angry" | "sad";

/**
 * いいねアクティビティの種類
 */
export type LikeActivity = {
  type: "like_given" | "like_received";
  userId: string;
  postId: string;
  timestamp: Date;
};

/**
 * バルクいいね処理用の型
 */
export interface BulkLikeRequest {
  postIds: string[];
}

/**
 * いいね分析データ
 */
export interface LikeAnalytics {
  period: "day" | "week" | "month";
  likesGiven: number;
  likesReceived: number;
  topLikedPost?: {
    id: string;
    content: string;
    likesCount: number;
  };
  likeActivity: Array<{
    date: string;
    given: number;
    received: number;
  }>;
}

/**
 * トレンド投稿情報
 */
export interface TrendingPost {
  id: string;
  content: string;
  likesCount: number;
  likesGrowthRate: number; // いいね増加率
  timeframe: "1h" | "6h" | "24h" | "7d";
}
