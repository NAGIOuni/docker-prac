import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import type {
  CreateFollowRequest,
  CreateFollowResponse,
  DeleteFollowResponse,
  GetFollowersResponse,
  GetFollowingResponse,
  GetFollowsQuery,
  FollowStatusResponse,
  FollowStatsResponse,
  Pagination,
  FollowerInfo,
  FollowingInfo,
} from "../types/follow.js";
import { isCreateFollowRequest } from "../types/follow.js";

/**
 * フォロー作成
 * POST /api/follows
 *
 * TODO: 認証機能実装後、req.user.id を使用
 * 現在は一時的にuserIdをリクエストボディから受け取る
 */
export const createFollow = async (
  req: Request<
    {},
    CreateFollowResponse,
    CreateFollowRequest & { userId?: string }
  >,
  res: Response<CreateFollowResponse>
): Promise<void> => {
  try {
    // Type Guard による型安全なバリデーション
    if (!isCreateFollowRequest(req.body)) {
      const errorResponse: CreateFollowResponse = {
        success: false,
        message: "Invalid request body format",
      };
      res.status(400).json(errorResponse);
      return;
    }

    const { followingId } = req.body;
    // TODO: 認証実装後は req.user.id を使用
    const followerId = (req.body as any).userId;

    // 一時的なuserIdバリデーション（認証実装まで）
    if (!followerId) {
      const errorResponse: CreateFollowResponse = {
        success: false,
        message: "User ID is required (temporary until auth is implemented)",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 自分自身をフォローしようとした場合
    if (followerId === followingId) {
      const errorResponse: CreateFollowResponse = {
        success: false,
        message: "Cannot follow yourself",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // フォロー対象のユーザーが存在するかチェック
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });

    if (!targetUser) {
      const errorResponse: CreateFollowResponse = {
        success: false,
        message: "User to follow not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 既にフォローしているかチェック
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      const errorResponse: CreateFollowResponse = {
        success: false,
        message: "Already following this user",
      };
      res.status(409).json(errorResponse);
      return;
    }

    // フォロー関係を作成
    const newFollow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    const response: CreateFollowResponse = {
      success: true,
      data: newFollow,
      message: "Successfully followed user",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create follow error:", error);

    // Prisma エラーハンドリング
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2003") {
        const errorResponse: CreateFollowResponse = {
          success: false,
          message: "Invalid user ID",
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (prismaError.code === "P2002") {
        const errorResponse: CreateFollowResponse = {
          success: false,
          message: "Already following this user",
        };
        res.status(409).json(errorResponse);
        return;
      }
    }

    const errorResponse: CreateFollowResponse = {
      success: false,
      message: "Failed to create follow",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * フォロー削除（アンフォロー）
 * DELETE /api/follows/:followingId
 *
 * TODO: 認証機能実装後、req.user.id を使用
 */
export const deleteFollow = async (
  req: Request<
    { followingId: string },
    DeleteFollowResponse,
    { userId?: string }
  >,
  res: Response<DeleteFollowResponse>
): Promise<void> => {
  try {
    const { followingId } = req.params;
    // TODO: 認証実装後は req.user.id を使用
    const followerId = req.body.userId;

    if (!followerId) {
      const errorResponse: DeleteFollowResponse = {
        success: false,
        message: "User ID is required (temporary until auth is implemented)",
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (!followingId?.trim()) {
      const errorResponse: DeleteFollowResponse = {
        success: false,
        message: "Following user ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // フォロー関係が存在するかチェック
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      const errorResponse: DeleteFollowResponse = {
        success: false,
        message: "Follow relationship not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // フォロー関係を削除
    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });

    const response: DeleteFollowResponse = {
      success: true,
      message: "Successfully unfollowed user",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Delete follow error:", error);

    const errorResponse: DeleteFollowResponse = {
      success: false,
      message: "Failed to unfollow user",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * フォロワー一覧取得
 * GET /api/users/:userId/followers?page=1&limit=10
 */
export const getFollowers = async (
  req: Request<{ userId: string }, GetFollowersResponse, {}, GetFollowsQuery>,
  res: Response<GetFollowersResponse>
): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit || "10", 10) || 10),
      50
    );
    const skip = (page - 1) * limit;

    if (!userId?.trim()) {
      const errorResponse: GetFollowersResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // ユーザーが存在するかチェック
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      const errorResponse: GetFollowersResponse = {
        success: false,
        error: "User not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 並列処理でフォロワー取得
    const [followers, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        select: {
          id: true,
          followerId: true,
          followingId: true,
          createdAt: true,
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImageUrl: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const pagination: Pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const response: GetFollowersResponse = {
      success: true,
      data: {
        data: followers as FollowerInfo[],
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get followers error:", error);

    const errorResponse: GetFollowersResponse = {
      success: false,
      error: "Failed to get followers",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * フォロー中一覧取得
 * GET /api/users/:userId/following?page=1&limit=10
 */
export const getFollowing = async (
  req: Request<{ userId: string }, GetFollowingResponse, {}, GetFollowsQuery>,
  res: Response<GetFollowingResponse>
): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit || "10", 10) || 10),
      50
    );
    const skip = (page - 1) * limit;

    if (!userId?.trim()) {
      const errorResponse: GetFollowingResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // ユーザーが存在するかチェック
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      const errorResponse: GetFollowingResponse = {
        success: false,
        error: "User not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 並列処理でフォロー中取得
    const [following, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        select: {
          id: true,
          followerId: true,
          followingId: true,
          createdAt: true,
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImageUrl: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const pagination: Pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const response: GetFollowingResponse = {
      success: true,
      data: {
        data: following as FollowingInfo[],
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get following error:", error);

    const errorResponse: GetFollowingResponse = {
      success: false,
      error: "Failed to get following",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * フォロー状態確認
 * GET /api/follows/status/:targetUserId?userId=xxx
 *
 * TODO: 認証機能実装後、req.user.id を使用
 */
export const getFollowStatus = async (
  req: Request<
    { targetUserId: string },
    FollowStatusResponse,
    {},
    { userId?: string }
  >,
  res: Response<FollowStatusResponse>
): Promise<void> => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.query.userId;

    if (!currentUserId) {
      const errorResponse: FollowStatusResponse = {
        success: false,
        error: "Current user ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (!targetUserId?.trim()) {
      const errorResponse: FollowStatusResponse = {
        success: false,
        error: "Target user ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // フォロー関係をチェック
    const followRelation = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
      select: { id: true },
    });

    // undefinedの場合はプロパティを除外
    const responseData: { isFollowing: boolean; followId?: string } = {
      isFollowing: !!followRelation,
    };

    // followIdが存在する場合のみプロパティを追加
    if (followRelation?.id) {
      responseData.followId = followRelation.id;
    }

    const response: FollowStatusResponse = {
      success: true,
      data: responseData,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get follow status error:", error);

    const errorResponse: FollowStatusResponse = {
      success: false,
      error: "Failed to get follow status",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * フォロー統計情報取得
 * GET /api/users/:userId/follow-stats
 */
export const getFollowStats = async (
  req: Request<{ userId: string }>,
  res: Response<FollowStatsResponse>
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId?.trim()) {
      const errorResponse: FollowStatsResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 並列処理で統計情報を取得
    const [followersCount, followingCount, mutualFollows] = await Promise.all([
      // フォロワー数
      prisma.follow.count({
        where: { followingId: userId },
      }),
      // フォロー中数
      prisma.follow.count({
        where: { followerId: userId },
      }),
      // 相互フォロー数（このユーザーがフォローしていて、かつ相手もフォローしている）
      prisma.follow.count({
        where: {
          followerId: userId,
          following: {
            followers: {
              some: {
                followerId: userId,
              },
            },
          },
        },
      }),
    ]);

    const response: FollowStatsResponse = {
      success: true,
      data: {
        followersCount,
        followingCount,
        mutualFollowsCount: mutualFollows,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get follow stats error:", error);

    const errorResponse: FollowStatsResponse = {
      success: false,
      error: "Failed to get follow statistics",
    };

    res.status(500).json(errorResponse);
  }
};
