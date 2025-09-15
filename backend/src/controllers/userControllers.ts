import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import type { CreateUserRequest, UpdateUserRequest } from "../types/user.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      username,
      displayName,
      bio,
      profileImageUrl,
    }: CreateUserRequest = req.body;

    if (!email || !username || !displayName) {
      return res.status(400).json({
        error: "Required fields missing: email, username, displayName",
      });
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

    return res.status(201).json({
      success: true,
      data: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { displayName, bio, profileImageUrl }: UpdateUserRequest = req.body;
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
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
    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updaated successfully",
    });
  } catch (error) {
    console.error("Update user error: ", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User delete error: ", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};
