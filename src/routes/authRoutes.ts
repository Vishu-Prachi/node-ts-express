import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { login, register, resendOtp, verifyOtp } from "../controllers/authController";


const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/resend-otp", resendOtp);

// router.post("/register", register);

// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const exists = await User.findOne({ email });
//     if (exists)
//       return res.status(400).json({ message: "User already exists" });

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//       isVerified: false,
//     });

//     res.status(201).json({ message: "OTP sent to email", user });
//   } catch (err) {
//     console.log("❌ Register Error:", err);
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

export default router;
