// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import usersRouter from "./routes/users.js";

dotenv.config(); // ✅ โหลดไฟล์ .env ก่อนใช้ process.env

const app = express();
app.use(cors());
app.use(express.json());

connectDB(); // ✅ เชื่อม MongoDB

app.use("/api/users", usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
