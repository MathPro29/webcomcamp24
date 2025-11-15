// routes/users.js
import express from "express";
import User from "../models/Users.js";

const usersRouter = express.Router();

// helper: กำหนด field ที่อนุญาตให้ client ส่งมา (to prevent extra props)
const ALLOWED_CREATE_FIELDS = ["fName", "lName", "email", "phone"];

// POST /api/users  -> สร้าง user ใหม่
usersRouter.post("/", async (req, res) => {
  try {
    // sanitize input: pick only allowed fields
    const payload = {};
    for (const k of ALLOWED_CREATE_FIELDS) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    const newUser = await User.create(payload);
    return res.status(201).json({ ok: true, user: newUser });
  } catch (err) {
    console.error(err);
    // handle duplicate email (unique index)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ ok: false, message: "Email already exists" });
    }
    // validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({ ok: false, message: err.message, errors: err.errors });
    }
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// GET /api/users  -> คืนทุก user (with pagination + fields)
usersRouter.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "50", 10) || 50, 200);
    const skip = parseInt(req.query.skip ?? "0", 10) || 0;
    const role = req.query.role; // ถ้ามี role ใน schema ให้ใช้ (ตอนนี้ไม่มี)
    const fields = req.query.fields
      ? req.query.fields.split(",").map(f => f.trim()).join(" ")
      : "userId fName lName email phone createdAt";

    const filter = {};
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).select(fields).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);

    res.json({ ok: true, total, count: users.length, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// GET /api/users/:id  -> ดึง user โดย userId หรือ _id
usersRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // หาโดย userId (number) ก่อน แล้ว fallback หาโดย _id
    let user = null;
    if (!isNaN(Number(id))) {
      user = await User.findOne({ userId: Number(id) }).lean();
    }
    if (!user) {
      user = await User.findById(id).lean().catch(() => null);
    }
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });
    res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// PUT /api/users/:id  -> อัปเดต (หาโดย userId หรือ _id)
usersRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const payload = {};
    for (const k of ALLOWED_CREATE_FIELDS) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    let updated = null;
    if (!isNaN(Number(id))) {
      updated = await User.findOneAndUpdate({ userId: Number(id) }, payload, { new: true, runValidators: true });
    }
    if (!updated) {
      updated = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).catch(() => null);
    }
    if (!updated) return res.status(404).json({ ok: false, message: "User not found" });

    res.json({ ok: true, user: updated });
  } catch (err) {
    console.error(err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ ok: false, message: "Email already exists" });
    }
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// DELETE /api/users/:id
usersRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deleted = null;
    if (!isNaN(Number(id))) {
      deleted = await User.findOneAndDelete({ userId: Number(id) });
    }
    if (!deleted) {
      deleted = await User.findByIdAndDelete(id).catch(() => null);
    }
    if (!deleted) return res.status(404).json({ ok: false, message: "User not found" });
    res.json({ ok: true, message: "User deleted", user: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default usersRouter;
