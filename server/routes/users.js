import express from "express";
import { getUsers } from "../controllers/users.js";
import User from "../models/users.js";
import Payment from "../models/payment.js";
import path from 'path';
import { verifyAdmin, optionalAuth } from '../middleware/auth.js';
import { validateOrigin } from '../middleware/originCheck.js';
import { isValidString, isValidStringWithLength } from '../middleware/security.js';

const userRouter = express.Router();

// ==========================================
// ⚠️ สำคัญ: Routes เฉพาะเจาะจงต้องอยู่ก่อน /:id

// 1. Upload Certificate
userRouter.post("/:id/certificate", verifyAdmin, async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.files || !req.files.certificate) {
      if (req.body.releaseDate) {
        // Allow updating only releaseDate
        const user = await User.findById(req.params.id);
        if (user && user.certificate && user.certificate.fileData) {
          // Parse the datetime string as Thailand local time (UTC+7)
          // Append timezone offset to ensure correct interpretation
          const dateTimeWithTZ = req.body.releaseDate.includes('+') || req.body.releaseDate.includes('Z') 
            ? req.body.releaseDate 
            : req.body.releaseDate + '+07:00';
          user.certificate.releaseDate = new Date(dateTimeWithTZ);
          await user.save();
          console.log(`✅ Certificate release date updated for user ${req.params.id}`);
          return res.json({ success: true, user });
        }
      }
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

    // Check file size (max 10MB for database storage)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    }

    // Convert file to Base64
    const fileData = file.data.toString('base64');
    
    // Get MIME type
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    const mimeType = mimeTypes[ext];

    // Update user with Base64 data
    const certificateData = {
      filename: file.name,
      fileData: fileData,
      mimeType: mimeType,
      fileSize: file.size,
      // Parse the datetime string as Thailand local time (UTC+7)
      // Append timezone offset to ensure correct interpretation
      releaseDate: releaseDate ? (() => {
        const dateTimeWithTZ = releaseDate.includes('+') || releaseDate.includes('Z') 
          ? releaseDate 
          : releaseDate + '+07:00';
        return new Date(dateTimeWithTZ);
      })() : null,
      uploadedAt: new Date()
    };

    console.log(`Debug: Updating user ${id} with cert data (size: ${file.size} bytes)`);

    const user = await User.findByIdAndUpdate(id, { certificate: certificateData }, { new: true });

    if (!user) {
      console.error(`❌ User not found for ID: ${id}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Certificate uploaded to database for user ${id}`);
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 1.5 Download Certificate
userRouter.get("/:id/certificate/download", validateOrigin, optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.certificate || !user.certificate.fileData) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Check release date - Allow Admin (req.user) to bypass
    const isAdmin = !!req.user;
    if (!isAdmin && user.certificate.releaseDate && new Date() < new Date(user.certificate.releaseDate)) {
      return res.status(403).json({ error: "Certificate not yet released" });
    }

    // Convert Base64 back to Buffer
    const fileBuffer = Buffer.from(user.certificate.fileData, 'base64');
    
    // Set appropriate headers
    res.setHeader('Content-Type', user.certificate.mimeType);
    res.setHeader('Content-Length', fileBuffer.length);
    
    if (req.query.view === 'true') {
      // For viewing in browser
      res.setHeader('Content-Disposition', 'inline');
    } else {
      // For downloading - sanitize filename to avoid header issues
      const ext = path.extname(user.certificate.filename) || '.pdf';
      // Use simple ASCII-safe filename
      const safeFirstName = user.firstName ? user.firstName.replace(/[^\w\s-]/g, '') : 'User';
      const safeLastName = user.lastName ? user.lastName.replace(/[^\w\s-]/g, '') : '';
      const baseName = `Certificate-${safeFirstName}${safeLastName ? '-' + safeLastName : ''}${ext}`;
      
      // Use RFC 5987 encoding for better compatibility
      const encodedName = encodeURIComponent(baseName).replace(/['()]/g, escape).replace(/\*/g, '%2A');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}"; filename*=UTF-8''${encodedName}`);
    }
    
    res.send(fileBuffer);
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

// 1.6 Delete Certificate
userRouter.delete("/:id/certificate", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.certificate || !user.certificate.fileData) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Remove certificate from user document (no need to delete file from filesystem)
    user.certificate = undefined;
    await user.save();

    console.log(`✅ Certificate deleted from database for user ${id}`);
    res.json({ success: true, message: "Certificate deleted successfully" });
  } catch (err) {
    console.error("❌ Delete certificate error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});


// 1. Search route - สำหรับ Name Checking (ต้องอยู่บนสุด)
userRouter.get("/search", validateOrigin, async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    console.log(`🔍 GET /api/users/search - ${firstName} ${lastName}`);

    // Step 1: Validate input types
    if (!isValidString(firstName) || !isValidString(lastName)) {
      console.warn('⚠️ Invalid search input - non-string values:', {
        ip: req.ip,
        firstName: typeof firstName,
        lastName: typeof lastName
      });
      return res.status(400).json({
        found: false,
        error: "กรุณาระบุชื่อและนามสกุลที่ถูกต้อง"
      });
    }

    // Step 2: Validate length (prevent extremely long inputs)
    if (!isValidStringWithLength(firstName, 1, 100) || !isValidStringWithLength(lastName, 1, 100)) {
      console.warn('⚠️ Invalid search input - length out of range:', {
        ip: req.ip,
        firstNameLength: firstName.length,
        lastNameLength: lastName.length
      });
      return res.status(400).json({
        found: false,
        error: "ชื่อหรือนามสกุลยาวเกินไป"
      });
    }

    // Step 3: Sanitize and escape regex special characters to prevent ReDoS attacks
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const sanitizedFirstName = escapeRegex(firstName.trim());
    const sanitizedLastName = escapeRegex(lastName.trim());

    // Step 4: Additional security check - prevent MongoDB operators
    if (sanitizedFirstName.includes('$') || sanitizedLastName.includes('$') ||
        sanitizedFirstName.includes('.') || sanitizedLastName.includes('.')) {
      console.warn('⚠️ Potential injection attempt in search:', {
        ip: req.ip,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName
      });
      return res.status(400).json({
        found: false,
        error: "ชื่อหรือนามสกุลมีอักขระที่ไม่อนุญาต"
      });
    }

    // Step 5: Safe database query with escaped regex
    const user = await User.findOne({
      firstName: { $regex: new RegExp(`^${sanitizedFirstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${sanitizedLastName}$`, 'i') }
    })
      .select("firstName lastName school grade status email certificate")
      .lean();

    if (!user) {
      console.log(`❌ User not found: ${sanitizedFirstName} ${sanitizedLastName}`);
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
    console.error("❌ Search error:", err);
    res.status(500).json({
      found: false,
      error: "เกิดข้อผิดพลาดในการค้นหา"
    });
  }
});

// 2. Get all users - รวมข้อมูลสำหรับ Dashboard
userRouter.get("/all", verifyAdmin, async (req, res) => {
  try {
    console.log("📥 GET /api/users/all");

    // ดึงข้อมูลทั้งหมดที่ Dashboard ต้องการ
    const users = await User.find({})
      .select("_id prefix firstName lastName nickname birthDate age email phone parentPhone school grade province status gender laptop allergies medicalConditions shirtSize lineId emergencyContact emergencyPhone certificate createdAt updatedAt")
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
userRouter.put("/:id/status", verifyAdmin, async (req, res) => {
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
userRouter.delete("/:id", verifyAdmin, async (req, res) => {
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
userRouter.put("/:id", verifyAdmin, async (req, res) => {
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
userRouter.get("/:id", verifyAdmin, async (req, res) => {
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
userRouter.get("/", verifyAdmin, getUsers);

export default userRouter;