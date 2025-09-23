import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type {
  CreatePostRequest,
  CreatePostResponse,
  DeletePostResponse,
  FullPost,
  GetPostResponse,
  GetPostsQuery,
  GetPostsResponse,
  Pagination,
  PostWithCount,
  UpdatePostRequest,
  UpdatePostResponse,
} from "../types/post.js";

export const getAllPosts = async (
  req: Request<{}, GetPostsResponse, {}, GetPostsQuery>,
  res: Response<GetPostsResponse>
): Promise<void> => {
  try {
    // クエリパラメータの安全な変換
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit || "10", 10) || 10),
      50
    );
    const skip = (page - 1) * limit;
    const userId = req.query.userId?.trim();

    // フィルター条件の構築
    const whereCondition: any = {
      deletedAt: null, // ソフトデリートされていない投稿のみ
    };

    // 特定ユーザーの投稿のみ取得する場合
    if (userId) {
      whereCondition.userId = userId;
    }

    // 並列処理でパフォーマンス向上
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereCondition,
        select: {
          id: true,
          userId: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          postedBy: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              likedBy: true,
              comments: {
                where: { deletedAt: null }, // 削除されていないコメントのみカウント
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // 新しい投稿から表示
      }),
      prisma.post.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const pagination: Pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const response: GetPostsResponse = {
      success: true,
      data: {
        data: posts as PostWithCount[],
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get posts error:", error);

    const errorResponse: GetPostsResponse = {
      success: false,
      error: "Failed to fetch posts",
    };

    res.status(500).json(errorResponse);
  }
};

export const getPostById = async (
  req: Request<{ id: string }>,
  res: Response<GetPostResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id?.trim()) {
      const errorResponse: GetPostResponse = {
        success: false,
        error: "Post ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        postImages: {
          select: {
            id: true,
            imageUrl: true,
            imageOrder: true,
            createdAt: true,
            postId: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            likedBy: true,
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!post) {
      const errorResponse: GetPostResponse = {
        success: false,
        error: "Post not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: GetPostResponse = {
      success: true,
      data: post as FullPost,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get post error:", error);

    const errorResponse: GetPostResponse = {
      success: false,
      error: "Failed to get post",
    };

    res.status(500).json(errorResponse);
  }
};

export const createPost = async (
  req: Request<{}, CreatePostResponse, CreatePostRequest & { userId?: string }>,
  res: Response<CreatePostResponse>
): Promise<void> => {
  try {
    // Type Guard による型安全なバリデーション
    // if (!isCreatePostRequest(req.body)) {
    //   const errorResponse: CreatePostResponse = {
    //     success: false,
    //     error: "Invalid request body format",
    //   };
    //   res.status(400).json(errorResponse);
    //   return;
    // }

    const { content, imageUrls } = req.body;
    // TODO: 認証実装後は req.user.id を使用
    const userId = (req.body as any).userId;

    // 一時的なuserIdバリデーション（認証実装まで）
    if (!userId) {
      const errorResponse: CreatePostResponse = {
        success: false,
        message: "User ID is required (temporary until auth is implemented)",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // バリデーション
    if (!content?.trim()) {
      const errorResponse: CreatePostResponse = {
        success: false,
        message: "Post content cannot be empty",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // if (content.length > POST_CONSTRAINTS.content.maxLength) {
    //   const errorResponse: CreatePostResponse = {
    //     success: false,
    //     message: `Post content is too long (maximum ${POST_CONSTRAINTS.content.maxLength} characters)`,
    //   };
    //   res.status(400).json(errorResponse);
    //   return;
    // }

    // if (imageUrls && imageUrls.length > POST_CONSTRAINTS.images.maxCount) {
    //   const errorResponse: CreatePostResponse = {
    //     success: false,
    //     error: `Too many images (maximum ${POST_CONSTRAINTS.images.maxCount})`,
    //   };
    //   res.status(400).json(errorResponse);
    //   return;
    // }

    // ユーザー存在確認
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      const errorResponse: CreatePostResponse = {
        success: false,
        message: "User not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // トランザクションで投稿と画像を同時作成
    const newPost = await prisma.$transaction(async (tx) => {
      // 投稿作成
      const post = await tx.post.create({
        data: {
          userId,
          content: content.trim(),
        },
        include: {
          postedBy: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              likedBy: true,
              comments: true,
            },
          },
        },
      });

      // 画像がある場合は画像も作成
      let images: any[] = [];
      if (imageUrls && imageUrls.length > 0) {
        const imageData = imageUrls.map((url, index) => ({
          postId: post.id,
          imageUrl: url.trim(),
          imageOrder: index,
        }));

        await tx.postImage.createMany({
          data: imageData,
        });

        // 作成された画像データを取得
        images = await tx.postImage.findMany({
          where: { postId: post.id },
          select: {
            id: true,
            postId: true,
            imageUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        });
      }

      return { ...post, postImages: images };
    });

    const response: CreatePostResponse = {
      success: true,
      data: newPost as FullPost,
      message: "Post created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create post error:", error);

    // Prisma エラーハンドリング
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2003") {
        const errorResponse: CreatePostResponse = {
          success: false,
          message: "Invalid user ID",
        };
        res.status(400).json(errorResponse);
        return;
      }
    }

    const errorResponse: CreatePostResponse = {
      success: false,
      message: "Failed to create post",
    };

    res.status(500).json(errorResponse);
  }
};

export const updatePost = async (
  req: Request<{ id: string }, UpdatePostResponse, UpdatePostRequest>,
  res: Response<UpdatePostResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id?.trim()) {
      const errorResponse: UpdatePostResponse = {
        success: false,
        message: "Post ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // // Type Guard による型安全なバリデーション
    // if (!isUpdatePostRequest(req.body)) {
    //   const errorResponse: UpdatePostResponse = {
    //     success: false,
    //     error: "Invalid request body format",
    //   };
    //   res.status(400).json(errorResponse);
    //   return;
    // }

    const { content } = req.body;

    // 更新データが空の場合のチェック
    if (content === undefined) {
      const errorResponse: UpdatePostResponse = {
        success: false,
        message: "At least one field must be provided for update",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // // バリデーション
    // if (content !== undefined) {
    //   if (!content?.trim()) {
    //     const errorResponse: UpdatePostResponse = {
    //       success: false,
    //       message: "Post content cannot be empty",
    //     };
    //     res.status(400).json(errorResponse);
    //     return;
    //   }

    //   if (content.length > POST_CONSTRAINTS.content.maxLength) {
    //     const errorResponse: UpdatePostResponse = {
    //       success: false,
    //       error: `Post content is too long (maximum ${POST_CONSTRAINTS.content.maxLength} characters)`,
    //     };
    //     res.status(400).json(errorResponse);
    //     return;
    //   }
    // }

    // 投稿存在確認（削除されていないもののみ）
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (!existingPost) {
      const errorResponse: UpdatePostResponse = {
        success: false,
        message: "Post not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // 投稿更新
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: content?.trim(),
        updatedAt: new Date(),
      },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        postImages: {
          select: {
            id: true,
            postId: true,
            imageUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            likedBy: true,
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    const response: UpdatePostResponse = {
      success: true,
      data: updatedPost as FullPost,
      message: "Post updated successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Update post error:", error);

    // Prisma エラーハンドリング
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        const errorResponse: UpdatePostResponse = {
          success: false,
          message: "Post not found",
        };
        res.status(404).json(errorResponse);
        return;
      }
    }

    const errorResponse: UpdatePostResponse = {
      success: false,
      message: "Failed to update post",
    };

    res.status(500).json(errorResponse);
  }
};

export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response<DeletePostResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id?.trim()) {
      const errorResponse: DeletePostResponse = {
        success: false,
        message: "Post ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 投稿存在確認（削除されていないもののみ）
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (!existingPost) {
      const errorResponse: DeletePostResponse = {
        success: false,
        message: "Post not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    // ソフトデリート（deletedAtに現在時刻を設定）
    await prisma.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const response: DeletePostResponse = {
      success: true,
      message: "Post deleted successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Post delete error:", error);

    // Prisma エラーハンドリング
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        const errorResponse: DeletePostResponse = {
          success: false,
          message: "Post not found",
        };
        res.status(404).json(errorResponse);
        return;
      }
    }

    const errorResponse: DeletePostResponse = {
      success: false,
      message: "Failed to delete post",
    };

    res.status(500).json(errorResponse);
  }
};
