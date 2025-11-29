import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
// import authRoutes from "./routes/authRoutes"; // <— correct
// import authRoutes from "./routes/authRoutes";
import authRoutes from "./routes/authRoutes";
dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running at ${PORT}`));
