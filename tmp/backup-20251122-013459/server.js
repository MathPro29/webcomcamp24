// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routes/users.js";
import reviewRouter from "./routes/Review.js";
import mongoose from "mongoose";
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
mongoose.connection.on("connected", () => {
  console.log(`🔗 Mongoose connected to DB: ${mongoose.connection.db?.databaseName}`);
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
