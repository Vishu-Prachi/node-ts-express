import { Request, Response } from "express";
import User from "../models/User";

// Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isVerified } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      isVerified: Boolean(isVerified)
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Get all users
export const getUsers = async (_: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing.id !== user.id) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }

    if (name) user.name = name;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;
    if (password) user.password = password;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};