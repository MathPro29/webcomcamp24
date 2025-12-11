import express from "express";
import { getUsers } from "../controllers/users.js";
import User from "../models/users.js";
import Payment from "../models/payment.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userRouter = express.Router();

// ==========================================
// ⚠️ สำคัญ: Routes เฉพาะเจาะจงต้องอยู่ก่อน /:id

// 1. Upload Certificate
userRouter.post("/:id/certificate", async (req, res) => {
  try {
    if (!req.files || !req.files.certificate) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { id } = req.params;
    const { releaseDate } = req.body;
    const file = req.files.certificate;

    // Validation
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({ error: "Invalid file type. Only PDF and Images are allowed." });
    }

    const timestamp = Date.now();
    const filename = `cert_${id}_${timestamp}${ext}`;
    const uploadPath = path.join(__dirname, '../uploads/certificates', filename);

    // Move file
    await file.mv(uploadPath);

    // Update user
    const certificateData = {
      filename: filename,
      originalName: file.name,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      uploadedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(id, { certificate: certificateData }, { new: true });

    console.log(`✅ Certificate uploaded for user ${id}`);
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 1.5 Download Certificate
userRouter.get("/:id/certificate/download", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.certificate || !user.certificate.filename) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Check release date - Allow Admin (req.user) to bypass
    const isAdmin = !!req.user;
    if (!isAdmin && user.certificate.releaseDate && new Date() < new Date(user.certificate.releaseDate)) {
      return res.status(403).json({ error: "Certificate not yet released" });
    }

    const filePath = path.join(__dirname, '../uploads/certificates', user.certificate.filename);
    if (fs.existsSync(filePath)) {
      // Set correct headers for download
      res.download(filePath, `Certificate-${user.firstName}-${user.lastName}${path.extname(user.certificate.filename)}`);
    } else {
      res.status(404).json({ error: "File not found on server" });
    }
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});


// 1. Search route - สำหรับ Name Checking (ต้องอยู่บนสุด)
userRouter.get("/search", async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    console.log(`🔍 GET /api/users/search - ${firstName} ${lastName}`);

    if (!firstName || !lastName) {
      return res.status(400).json({
        found: false,
        error: "กรุณาระบุชื่อและนามสกุล"
      });
    }

    // ค้นหาแบบ case-insensitive และ trim whitespace
    const user = await User.findOne({
      firstName: { $regex: new RegExp(`^${firstName.trim()}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName.trim()}$`, 'i') }
    })
      .select("firstName lastName school grade status email certificate")
      .lean();

    if (!user) {
      console.log(`❌ User not found: ${firstName} ${lastName}`);
      return res.json({ found: false });
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.status})`);
    res.json({
      found: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        school: user.school,
        grade: user.grade,
        status: user.status,
        email: user.email,
        certificate: user.certificate,
        _id: user._id
      }
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({
      found: false,
      error: "เกิดข้อผิดพลาดในการค้นหา"
    });
  }
});

// 2. Get all users - รวมข้อมูลสำหรับ Dashboard
userRouter.get("/all", async (req, res) => {
  try {
    console.log("📥 GET /api/users/all");

    // ดึงข้อมูลทั้งหมดที่ Dashboard ต้องการ
    const users = await User.find({})
      .select("_id prefix firstName lastName nickname birthDate age email phone parentPhone school grade province status gender laptop allergies medicalConditions shirtSize lineId emergencyContact emergencyPhone certificate")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 3. Update status (PUT ต้องอยู่ก่อน GET /:id)
userRouter.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`📝 PUT /api/users/${id}/status - ${status}`);

    if (!["pending", "success", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Status updated`);
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// 4. Delete user (DELETE ต้องอยู่ก่อน GET /:id)
userRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/users/${id}`);

    // Delete associated payment(s) first
    const paymentDeleteResult = await Payment.deleteMany({ userId: id });
    if (paymentDeleteResult.deletedCount > 0) {
      console.log(`🗑️ Deleted ${paymentDeleteResult.deletedCount} payment record(s) for user ${id}`);
    }

    // Then delete the user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User deleted along with their payment record(s)`);
    res.json({
      success: true,
      message: "User and associated payments deleted",
      paymentsDeleted: paymentDeleteResult.deletedCount
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// 4. Update user (PUT ต้องอยู่ก่อน GET /:id)
userRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 PUT /api/users/${id}`);

    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User updated`);
    res.json(user);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// 5. Get single user (ต้องอยู่ท้ายสุด!)
userRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 GET /api/users/${id}`);

    const user = await User.findById(id).lean();

    if (!user) {
      console.log(`❌ User not found: ${id}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    res.json(user);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to fetch user", details: err.message });
  }
});

// 6. Default route (ต้องอยู่ท้ายสุด!)
userRouter.get("/", getUsers);

export default userRouter;