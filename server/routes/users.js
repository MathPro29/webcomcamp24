// routes/users.js
import express from "express";
import User from "../models/users.js";

const usersRouter = express.Router();

// GET /api/users  -> คืนทุก user (ระวัง dataset ใหญ่)
usersRouter.get("/", async (req, res) => {
  try {
    // รองรับ query params เช่น ?limit=20&skip=0&role=admin&fields=name,email
    const limit = Math.min(parseInt(req.query.limit) || 50, 200); // ป้องกันดึงเยอะเกินไป
    const skip = parseInt(req.query.skip) || 0;
    const role = req.query.role;
    const fields = req.query.fields ? req.query.fields.split(",").join(" ") : "name email role createdAt";

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select(fields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({ ok: true, total, count: users.length, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default usersRouter;
