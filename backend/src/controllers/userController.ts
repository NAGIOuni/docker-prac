import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import type {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserResponse,
  GetUserResponse,
  GetUsersQuery,
  GetUsersResponse,
  Pagination,
  PublicUser,
  PublicUserWithCount,
  UpdateUserRequest,
  UpdateUserResponse,
  UserCount,
} from "../types/user.js";

export const getAllUsers = async (
  req: Request<{}, GetUsersResponse, {}, GetUsersQuery>,
  res: Response<GetUsersResponse>
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          profileImageUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const pagination: Pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const response: GetUsersResponse = {
      success: true,
      data: {
        data: users,
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get users error:", error);

    const errorResponse: GetUsersResponse = {
      success: false,
      error: "Failed to fetch users",
    };

    res.status(500).json(errorResponse);
    return;
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response<GetUserResponse>
): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      const errorResponse: GetUserResponse = {
        success: false,
        error: "ID is required",
      };
      res.status(400).json(errorResponse);
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      const errorResponse: GetUserResponse = {
        success: false,
        error: "User not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: GetUserResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get user error:", error);

    const errorResponse: GetUserResponse = {
      success: false,
      error: "Failed to fetch user",
    };

    res.status(500).json(errorResponse);
    return;
  }
};

export const createUser = async (
  req: Request<{}, CreateUserResponse, CreateUserRequest, {}>,
  res: Response<CreateUserResponse>
): Promise<void> => {
  try {
    const {
      email,
      username,
      displayName,
      bio,
      profileImageUrl,
    }: CreateUserRequest = req.body;

    if (!email || !username || !displayName) {
      const errorResponse: CreateUserResponse = {
        success: false,
        message: "Required fields missing: email, username, displayName",
      };
      res.status(400).json(errorResponse);
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        bio: bio || null,
        profileImageUrl: profileImageUrl || null,
      },
    });

    const response: CreateUserResponse = {
      success: true,
      data: newUser,
      message: "User created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create user error:", error);

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2002") {
        const errorResponse: CreateUserResponse = {
          success: false,
          message: "User already exists",
        };

        res.status(409).json(errorResponse);
        return;
      }
    }

    const errorResponse: CreateUserResponse = {
      success: false,
      message: "Failed to create user",
    };
    res.status(500).json(errorResponse);
    return;
  }
};

export const updateUser = async (
  req: Request<{ id: string }, UpdateUserResponse, UpdateUserRequest, {}>,
  res: Response<UpdateUserResponse>
): Promise<void> => {
  try {
    const { displayName, bio, profileImageUrl }: UpdateUserRequest = req.body;
    const id = req.params.id;

    if (!id) {
      const errorResponse: UpdateUserResponse = {
        success: false,
        message: "ID is required",
      };

      res.status(400).json(errorResponse);
      return;
    }

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImageUrl !== undefined)
      updateData.profileImageUrl = profileImageUrl;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const response: UpdateUserResponse = {
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Update user error: ", error);

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        const errorResponse: UpdateUserResponse = {
          success: false,
          message: "User not found",
        };

        res.status(404).json(errorResponse);
        return;
      }
    }
    const errorResponse: UpdateUserResponse = {
      success: false,
      message: "Failed to update user",
    };

    res.status(500).json(errorResponse);
    return;
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response<DeleteUserResponse>
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id) {
      const errorResponse: DeleteUserResponse = {
        success: false,
        message: "ID is required",
      };

      res.status(400).json(errorResponse);
      return;
    }

    await prisma.user.delete({
      where: { id },
    });

    const response: DeleteUserResponse = {
      success: true,
      message: "User deleted successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("User delete error: ", error);

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        const errorResponse: DeleteUserResponse = {
          success: false,
          message: "User not found",
        };

        res.status(404).json(errorResponse);
        return;
      }
    }
    const errorResponse: DeleteUserResponse = {
      success: false,
      message: "Failed to delete user",
    };

    res.status(500).json(errorResponse);
    return;
  }
};
