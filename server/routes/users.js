import express from "express";
import { getUsers } from "../controllers/users.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);

import User from "../models/users.js";

// Get all users (for admin and public pages)
userRouter.get("/all", async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id prefix firstName lastName email phone school status")
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user status by ID (admin only)
userRouter.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["pending", "success", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Delete user by ID (admin only)
userRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

userRouter.get("/seed", async (req, res) => {
  await User.deleteMany({});
  await User.insertMany([
    { firstName: "สมชาย", lastName: "ใจดี", school: "เตรียมอุดมศึกษา", status: "pending" },
    { firstName: "สมหญิง", lastName: "รักดี", school: "สตรีวิทยา", status: "success" },
    { firstName: "เด็กชาย", lastName: "คอมแคมป์", school: "มหิดลวิทยานุสรณ์", status: "pending" },
    { firstName: "เด็กหญิง", lastName: "เก่งมาก", school: "อัสสัมชัญ", status: "declined" },
  ]);
  res.send("เพิ่มข้อมูลตัวอย่างเรียบร้อย!");
});
export default userRouter;
