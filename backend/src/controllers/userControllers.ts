import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import type { CreateUserRequest } from "../types/user.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: err });
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
  } catch (err) {
    console.error("Get user error:", err);
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
  } catch (err) {
    console.error("Create user error:", err);
    return res.status(500).json({ error: "Failed to create user" });
  }
};
