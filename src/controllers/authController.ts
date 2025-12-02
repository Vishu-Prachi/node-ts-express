
import Otp from "../models/Otp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";
import sendEmail from "../utils/sendEmail";
const genrateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};
const sendOtp = genrateOtp();
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });
    
    await User.create({
      name,
      email,
      password,
      isVerified: false
    });

    
    // let otp = generateOtp();
    // console.log("Generated OTP:", otp);
    let otp = genrateOtp();
    console.log("Generated OTP:", otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, expiresAt },
      { upsert: true }
    );

    await sendEmail(email, otp);

    return res.status(201).json({
      message: "User registered. Please verify OTP.",
      email
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const otpData = await Otp.findOne({ email, otp });
    if (!otpData || otpData.otp !== otp)
      return res.status(400).json({ message: "OTP not found or wrong" });

    if (otpData.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });
    // let otpCode = sendOtp;
    // console.log("Generated OTP verify:", otpCode);
    // let otpCode = genrateOtp();
    // console.log("Generated OTP verify:", otpCode);

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await Otp.deleteOne({ email });

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log("Resend OTP for email:", email);
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    const otp = genrateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    console.log("Generated OTP resend:", otp);
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, expiresAt },
      { upsert: true }
    );

    await sendEmail(email, otp);

    return res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email" });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify your email before logging in."
      });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid password" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "JWT secret is not configured on the server" });
    }

    const token = jwt.sign(
      { id: user._id },
      secret,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
