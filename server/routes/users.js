import express from "express";
import { getUsers } from "../controllers/users.js";
import User from "../models/users.js";
import Payment from "../models/payment.js";

const userRouter = express.Router();

// ==========================================
// ⚠️ สำคัญ: Routes เฉพาะเจาะจงต้องอยู่ก่อน /:id
// ==========================================

// 1. Seed route

// 2. Get all users - รวมข้อมูลสำหรับ Dashboard
userRouter.get("/all", async (req, res) => {
  try {
    console.log("📥 GET /api/users/all");
    
    // ดึงข้อมูลทั้งหมดที่ Dashboard ต้องการ
    const users = await User.find({})
      .select("_id prefix firstName lastName email phone school status gender laptop allergies medicalConditions grade")
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