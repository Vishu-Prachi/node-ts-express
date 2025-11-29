"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
// Create user
const createUser = async (req, res) => {
    try {
        const { name, email, password, isVerified } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Name, email and password are required" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await userModel_1.default.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({ message: "Email already in use" });
        }
        const user = await userModel_1.default.create({
            name,
            email: normalizedEmail,
            password,
            isVerified: Boolean(isVerified)
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error("createUser error:", error);
        res.status(500).json({ message: "Error creating user" });
    }
};
exports.createUser = createUser;
// Get all users
const getUsers = async (_, res) => {
    try {
        const users = await userModel_1.default.find().sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        console.error("getUsers error:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
};
exports.getUsers = getUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await userModel_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (error) {
        console.error("getUserById error:", error);
        res.status(500).json({ message: "Error fetching user" });
    }
};
exports.getUserById = getUserById;
// Update user
const updateUser = async (req, res) => {
    try {
        const { name, email, password, isVerified } = req.body;
        const user = await userModel_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (email && email.toLowerCase().trim() !== user.email) {
            const normalizedEmail = email.toLowerCase().trim();
            const existing = await userModel_1.default.findOne({ email: normalizedEmail });
            if (existing && existing.id !== user.id) {
                return res.status(409).json({ message: "Email already in use" });
            }
            user.email = normalizedEmail;
        }
        if (name)
            user.name = name;
        if (typeof isVerified === "boolean")
            user.isVerified = isVerified;
        if (password)
            user.password = password;
        await user.save();
        res.json(user);
    }
    catch (error) {
        console.error("updateUser error:", error);
        res.status(500).json({ message: "Error updating user" });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await userModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("deleteUser error:", error);
        res.status(500).json({ message: "Error deleting user" });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map