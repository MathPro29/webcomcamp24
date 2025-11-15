// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routes/users.js";
import reviewRouter from "./routes/Review.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);

const PORT = process.env.PORT || 5000;


mongoose.connection.on("connected", () => {
  // ใช้ db.databaseName ให้แม่นยำในทุกเวอร์ชัน
  console.log(`🔗 Mongoose connected to DB: ${mongoose.connection.db?.databaseName}`);
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

async function start() {
  try {
    // รอการเชื่อมต่อก่อน
    await connectDB(); // connectDB ควรเป็น async ที่เรียก mongoose.connect(...)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
