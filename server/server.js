import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import fs from "fs";

import DBconnect from "./config/db.js";
import userRouter from "./routes/users.js";
import registerRouter from "./routes/register.js";
import authRouter from "./routes/auth.js";
import paymentsRouter from "./routes/payments.js";
import settingsRouter from "./routes/settings.js";

import { limitsignup, loginlimit } from "./middleware/ratelimit.js";
import { ensureStorageExists } from "./config/storage.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

/* ======================
   CORS CONFIG
====================== */
const allowedOrigins = [
  "http://comcamp.csmju.com",
  "https://comcamp.csmju.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
}));

// ❌ ห้ามใช้ app.options("*")
// app.options("*", cors());

/* ======================
   GLOBAL MIDDLEWARE
====================== */
app.use(express.json());
app.use(cookieParser());

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

/* ======================
   ROUTES
====================== */
app.use("/api/users", userRouter);
app.use("/api/register", limitsignup, registerRouter);
app.use("/api/auth", loginlimit, authRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/settings", settingsRouter);

/* ======================
   START SERVER
====================== */
DBconnect()
  .then(() => {
    ensureStorageExists(fs);

    app.get("/", (req, res) => {
      res.send("Backend is running and connected to MongoDB");
    });

    // ⭐ สำคัญมากสำหรับ Docker
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });
