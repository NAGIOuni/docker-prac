// ========================================
// Core Follow Types
// ========================================

/**
 * フォロー関係情報
 */
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

/**
 * フォロー情報（ユーザー詳細付き）
 */
export interface FollowWithUser {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
  following?: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

/**
 * フォロワー情報（フォロワー詳細付き）
 */
export interface FollowerInfo {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

/**
 * フォロー中情報（フォロー相手詳細付き）
 */
export interface FollowingInfo {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  following: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

// ========================================
// Request Types
// ========================================

/**
 * フォロー作成リクエスト
 */
export interface CreateFollowRequest {
  followingId: string; // フォローする対象のユーザーID
}

/**
 * フォロー一覧取得クエリパラメータ
 */
export interface GetFollowsQuery {
  page?: string;
  limit?: string;
  type?: "followers" | "following"; // フォロワーかフォロー中か
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
 * フォロー作成レスポンス
 */
export interface CreateFollowResponse extends ApiResponse<Follow> {
  message: string;
}

/**
 * フォローステータス確認レスポンス
 */
export interface FollowStatusResponse
  extends ApiResponse<{
    isFollowing: boolean;
    followId?: string;
  }> {}

/**
 * フォロワー一覧取得レスポンス
 */
export interface GetFollowersResponse
  extends ApiResponse<PaginatedResponse<FollowerInfo>> {}

/**
 * フォロー中一覧取得レスポンス
 */
export interface GetFollowingResponse
  extends ApiResponse<PaginatedResponse<FollowingInfo>> {}

/**
 * フォロー削除レスポンス
 */
export interface DeleteFollowResponse {
  success: boolean;
  message: string;
}

/**
 * フォロー統計情報レスポンス
 */
export interface FollowStatsResponse
  extends ApiResponse<{
    followersCount: number;
    followingCount: number;
    mutualFollowsCount: number; // 相互フォロー数
  }> {}

// ========================================
// Type Guards
// ========================================

/**
 * CreateFollowRequestの型ガード
 */
export function isCreateFollowRequest(
  obj: unknown
): obj is CreateFollowRequest {
  if (typeof obj !== "object" || obj === null) return false;

  const req = obj as Record<string, unknown>;
  return (
    typeof req.followingId === "string" && req.followingId.trim().length > 0
  );
}

// ========================================
// Utility Types
// ========================================

/**
 * フォロー関係の種類
 */
export type FollowRelationship =
  | "none" // フォロー関係なし
  | "following" // フォローしている
  | "follower" // フォローされている
  | "mutual"; // 相互フォロー

/**
 * フォロー関係確認の結果
 */
export interface FollowRelationshipInfo {
  relationship: FollowRelationship;
  followingId?: string; // フォローしている場合のFollow ID
  followerId?: string; // フォローされている場合のFollow ID
}

/**
 * バルクフォロー処理用の型
 */
export interface BulkFollowRequest {
  userIds: string[];
}

/**
 * フォロー推奨ユーザー情報
 */
export interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl: string | null;
  mutualFollowersCount: number; // 共通のフォロワー数
  reason: "mutual_followers" | "popular" | "recent_activity";
}
