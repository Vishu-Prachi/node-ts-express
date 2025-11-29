"use strict";
// import { Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/userModel';
// import dotenv from "dotenv"
// import Otp from '../models/Otp';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.resendOtp = exports.verifyOtp = exports.register = void 0;
// dotenv.config();
// const generateToken = (id: string) => {
//   console.log(process.env.JWT_SECRET as string);
//   return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
// };
// // Register new user
// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: 'Email already registered' });
//     const user = await User.create({ name, email, password });
//     res.status(201).json({ 
//       message: 'User registered successfully', 
//       user: { id: user._id, name: user.name, email: user.email } 
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error registering user', error });
//   }
// };
// // Login user
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email }) ;
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch){
//       return res.status(401).json({ message: 'Invalid credentials' });
//     } 
//     const token = generateToken(user._id.toString());
//     res.json({ 
//       message: 'Login successful', 
//       token, 
//       user: { id: user._id, name: user.name, email: user.email } 
//     });
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).json({ message: 'Error logging in', error });
//   }
// };
// import User from "../models/User";
const Otp_1 = __importDefault(require("../models/Otp"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../utils/sendEmail");
const userModel_1 = __importDefault(require("../models/userModel"));
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await userModel_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ message: "Email already exists" });
        await userModel_1.default.create({
            name,
            email,
            password,
            isVerified: false
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp_1.default.findOneAndUpdate({ email }, { email, otp, expiresAt }, { upsert: true });
        await (0, sendEmail_1.sendEmail)(email, "Your OTP Code", `Your OTP is ${otp}`);
        return res.status(201).json({
            message: "User registered. Please verify OTP.",
            email
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.register = register;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpData = await Otp_1.default.findOne({ email });
        if (!otpData)
            return res.status(400).json({ message: "OTP not found" });
        if (otpData.expiresAt < new Date())
            return res.status(400).json({ message: "OTP expired" });
        if (otpData.otp !== otp)
            return res.status(400).json({ message: "Invalid OTP" });
        await userModel_1.default.findOneAndUpdate({ email }, { isVerified: true });
        await Otp_1.default.deleteOne({ email });
        return res.json({ message: "Email verified successfully" });
    }
    catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.verifyOtp = verifyOtp;
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (user.isVerified)
            return res.status(400).json({ message: "Already verified" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp_1.default.findOneAndUpdate({ email }, { email, otp, expiresAt }, { upsert: true });
        await (0, sendEmail_1.sendEmail)(email, "New OTP Code", `Your new OTP is ${otp}`);
        return res.json({ message: "OTP resent successfully" });
    }
    catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.resendOtp = resendOtp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid email" });
        if (!user.isVerified)
            return res.status(403).json({
                message: "Please verify your email before logging in."
            });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ message: "Invalid password" });
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res
                .status(500)
                .json({ message: "JWT secret is not configured on the server" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, secret, { expiresIn: "7d" });
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map