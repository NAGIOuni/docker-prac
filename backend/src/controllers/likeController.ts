import { prisma } from "../lib/prisma.js";
import { response, type Request, type Response } from "express";
import type {
  CreateLikeRequest,
  CreateLikeResponse,
  DeleteLikeResponse,
  GetPostLikesResponse,
  GetUserLikesResponse,
  GetLikesQuery,
  LikeStatusResponse,
  LikeStatsResponse,
  Pagination,
  LikeWithUser,
  LikeWithPost,
} from "../types/like.js";
import { isCreateLikeRequest } from "../types/like.js";

/**
 * いいね作成
 * POST /api/likes
 *
 * TODO: 認証機能実装後、req.user.id を使用
 * 現在は一時的にuserIdをリクエストボディから受け取る
 */
export const createLike = async (
  req: Request<{}, CreateLikeResponse, CreateLikeRequest & { userId?: string }>,
  res: Response<CreateLikeResponse>
): Promise<void> => {
  try {
    // Type Guard による型安全なバリデーション
    if (!isCreateLikeRequest(req.body)) {
      const errorResponse: CreateLikeResponse = {
        success: false,
        message: "Invalid request body format",
      };
      res.status(400).json(errorResponse);
      return;
    }

    const { postId } = req.body;
    // TODO: 認証実装後は req.user.id を使用
    const userId = (req.body as any).userId;

    // 一時的なuserIdバリデーション（認証実装まで）
    if (!userId) {
      const errorResponse: CreateLikeResponse = {
        success: false,
        message: "User ID is required (temporary until auth is implemented)",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 投稿が存在し、削除されていないかチェック
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (!post) {
      const errorResponse: CreateLikeResponse = {
        success: false,
        message: "Post not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 既にいいねしているかチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      const errorResponse: CreateLikeResponse = {
        success: false,
        message: "Already liked this post",
      };
      res.status(409).json(errorResponse);
      return;
    }

    // いいねを作成
    const newLike = await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    const response: CreateLikeResponse = {
      success: true,
      data: newLike,
      message: "Successfully liked post",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create like error:", error);

    // Prisma エラーハンドリング
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2003") {
        const errorResponse: CreateLikeResponse = {
          success: false,
          message: "Invalid user ID or post ID",
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (prismaError.code === "P2002") {
        const errorResponse: CreateLikeResponse = {
          success: false,
          message: "Already liked this post",
        };
        res.status(409).json(errorResponse);
        return;
      }
    }

    const errorResponse: CreateLikeResponse = {
      success: false,
      message: "Failed to create like",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * いいね削除
 * DELETE /api/likes/:postId
 *
 * TODO: 認証機能実装後、req.user.id を使用
 */
export const deleteLike = async (
  req: Request<{ postId: string }, DeleteLikeResponse, { userId?: string }>,
  res: Response<DeleteLikeResponse>
): Promise<void> => {
  try {
    const { postId } = req.params;
    // TODO: 認証実装後は req.user.id を使用
    const userId = req.body.userId;

    if (!userId) {
      const errorResponse: DeleteLikeResponse = {
        success: false,
        message: "User ID is required (temporary until auth is implemented)",
        likesCount: 0,
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (!postId?.trim()) {
      const errorResponse: DeleteLikeResponse = {
        success: false,
        message: "Post ID is required",
        likesCount: 0,
      };
      res.status(400).json(errorResponse);
      return;
    }

    // いいねが存在するかチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existingLike) {
      const errorResponse: DeleteLikeResponse = {
        success: false,
        message: "Like not found",
        likesCount: 0,
      };
      res.status(404).json(errorResponse);
      return;
    }

    // トランザクションでいいね削除と件数取得
    const [, likesCount] = await prisma.$transaction([
      prisma.like.delete({
        where: { id: existingLike.id },
      }),
      prisma.like.count({
        where: { postId },
      }),
    ]);

    const response: DeleteLikeResponse = {
      success: true,
      message: "Successfully unliked post",
      likesCount,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Delete like error:", error);

    const errorResponse: DeleteLikeResponse = {
      success: false,
      message: "Failed to unlike post",
      likesCount: 0,
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * 投稿のいいね一覧取得
 * GET /api/posts/:postId/likes?page=1&limit=10
 */
export const getPostLikes = async (
  req: Request<{ postId: string }, GetPostLikesResponse, {}, GetLikesQuery>,
  res: Response<GetPostLikesResponse>
): Promise<void> => {
  try {
    const { postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit || "10", 10) || 10),
      50
    );
    const skip = (page - 1) * limit;

    if (!postId?.trim()) {
      const errorResponse: GetPostLikesResponse = {
        success: false,
        error: "Post ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 投稿が存在するかチェック
    const postExists = await prisma.post.findUnique({
      where: {
        id: postId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!postExists) {
      const errorResponse: GetPostLikesResponse = {
        success: false,
        error: "Post not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 並列処理でいいね一覧取得
    const [likes, totalCount] = await Promise.all([
      prisma.like.findMany({
        where: { postId },
        select: {
          id: true,
          userId: true,
          postId: true,
          createdAt: true,
          user: {
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
      prisma.like.count({
        where: { postId },
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

    const response: GetPostLikesResponse = {
      success: true,
      data: {
        data: likes as LikeWithUser[],
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get post likes error:", error);

    const errorResponse: GetPostLikesResponse = {
      success: false,
      error: "Failed to get post likes",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * ユーザーがいいねした投稿一覧取得
 * GET /api/users/:userId/likes?page=1&limit=10
 */
export const getUserLikes = async (
  req: Request<{ userId: string }, GetUserLikesResponse, {}, GetLikesQuery>,
  res: Response<GetUserLikesResponse>
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
      const errorResponse: GetUserLikesResponse = {
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
      const errorResponse: GetUserLikesResponse = {
        success: false,
        error: "User not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 並列処理でユーザーのいいね投稿取得
    const [likes, totalCount] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
          post: {
            deletedAt: null, // 削除されていない投稿のみ
          },
        },
        select: {
          id: true,
          userId: true,
          postId: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              postedBy: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.like.count({
        where: {
          userId,
          post: {
            deletedAt: null,
          },
        },
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

    const response: GetUserLikesResponse = {
      success: true,
      data: {
        data: likes as LikeWithPost[],
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get user likes error:", error);

    const errorResponse: GetUserLikesResponse = {
      success: false,
      error: "Failed to get user likes",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * いいね状態確認
 * GET /api/likes/status/:postId?userId=xxx
 *
 * TODO: 認証機能実装後、req.user.id を使用
 */
export const getLikeStatus = async (
  req: Request<{ postId: string }, LikeStatusResponse, {}, { userId?: string }>,
  res: Response<LikeStatusResponse>
): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.query.userId;

    if (!userId) {
      const errorResponse: LikeStatusResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (!postId?.trim()) {
      const errorResponse: LikeStatusResponse = {
        success: false,
        error: "Post ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 並列処理でいいね状態と総いいね数を取得
    const [userLike, likesCount] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        select: { id: true },
      }),
      prisma.like.count({
        where: { postId },
      }),
    ]);

    // undefinedの場合はプロパティを除外
    const responseData: {
      isLiked: boolean;
      likeId?: string;
      likesCount: number;
    } = {
      isLiked: !!userLike,
      likesCount,
    };

    // likeIdが存在する場合のみプロパティを追加
    if (userLike?.id) {
      responseData.likeId = userLike.id;
    }

    const response: LikeStatusResponse = {
      success: true,
      data: responseData,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get like status error:", error);

    const errorResponse: LikeStatusResponse = {
      success: false,
      error: "Failed to get like status",
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * いいね統計情報取得
 * GET /api/users/:userId/like-stats
 */
export const getLikeStats = async (
  req: Request<{ userId: string }>,
  res: Response<LikeStatsResponse>
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId?.trim()) {
      const errorResponse: LikeStatsResponse = {
        success: false,
        error: "User ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 並列処理で統計情報を取得
    const [
      totalLikesGiven,
      totalLikesReceived,
      mostLikedPost,
      recentLikedPosts,
    ] = await Promise.all([
      // 与えたいいね数
      prisma.like.count({
        where: { userId },
      }),
      // 受け取ったいいね数（自分の投稿への）
      prisma.like.count({
        where: {
          post: {
            userId,
            deletedAt: null,
          },
        },
      }),
      // 最もいいねされた投稿
      prisma.post.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          content: true,
          _count: {
            select: { likedBy: true },
          },
        },
        orderBy: {
          likedBy: { _count: "desc" },
        },
      }),
      // 最近いいねした投稿（直近5件）
      prisma.like.findMany({
        where: {
          userId,
          post: {
            deletedAt: null,
          },
        },
        select: {
          post: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // undefinedの場合はプロパティを除外
    const responseData: {
      totalLikesGiven: number;
      totalLikesReceived: number;
      mostLikedPost?: { id: string; content: string; likesCount: number };
      recentLikedPosts: { id: string; content: string; createdAt: Date }[];
    } = {
      totalLikesGiven,
      totalLikesReceived,
      recentLikedPosts: recentLikedPosts.map((like) => ({
        id: like.post.id,
        content: like.post.content,
        createdAt: like.post.createdAt,
      })),
    };

    // mostLikedPostが存在する場合のみプロパティを追加
    if (mostLikedPost) {
      responseData.mostLikedPost = {
        id: mostLikedPost.id,
        content: mostLikedPost.content,
        likesCount: mostLikedPost._count.likedBy, // likes → likedBy に修正
      };
    }

    const response: LikeStatsResponse = {
      success: true,
      data: responseData,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get like stats error:", error);

    const errorResponse: LikeStatsResponse = {
      success: false,
      error: "Failed to get like statistics",
    };

    res.status(500).json(errorResponse);
  }
};
