import express from "express";
import { getUsers } from "../controllers/users.js";
import User from "../models/users.js";

const userRouter = express.Router();

// ==========================================
// ⚠️ สำคัญ: Routes เฉพาะเจาะจงต้องอยู่ก่อน /:id
// ==========================================

// 1. Seed route
userRouter.get("/seed", async (req, res) => {
  try {
    await User.deleteMany({});
    await User.insertMany([
      { 
        prefix: "นาย",
        firstName: "สมชาย", 
        lastName: "ใจดี", 
        nickname: "ชาย",
        birthDate: "2007-05-15",
        age: 17,
        gender: "ชาย",
        school: "เตรียมอุดมศึกษา", 
        grade: "ม.6",
        province: "กรุงเทพ",
        status: "pending",
        email: "somchai@example.com",
        phone: "081-234-5678",
        parentPhone: "081-111-1111",
        lineId: "somchai123",
        shirtSize: "M",
        allergies: "กุ้ง, ปู",
        medicalConditions: "โรคหอบหืด",
        emergencyContact: "คุณแม่สมหญิง",
        emergencyPhone: "081-111-1111",
        laptop: "Yes"
      },
      { 
        prefix: "นางสาว",
        firstName: "สมหญิง", 
        lastName: "รักดี", 
        nickname: "หญิง",
        birthDate: "2008-03-20",
        age: 16,
        gender: "หญิง",
        school: "สตรีวิทยา", 
        grade: "ม.5",
        province: "กรุงเทพ",
        status: "success",
        email: "somying@example.com",
        phone: "082-345-6789",
        parentPhone: "082-222-2222",
        lineId: "somying456",
        shirtSize: "S",
        allergies: "ถั่ว",
        medicalConditions: "",
        emergencyContact: "คุณพ่อสมศักดิ์",
        emergencyPhone: "082-222-2222",
        laptop: "No"
      },
      { 
        prefix: "เด็กชาย",
        firstName: "สมศักดิ์", 
        lastName: "คอมแคมป์", 
        nickname: "ศักดิ์",
        birthDate: "2009-07-10",
        age: 15,
        gender: "ชาย",
        school: "มหิดลวิทยานุสรณ์", 
        grade: "ม.4",
        province: "นครปฐม",
        status: "pending",
        email: "boy@example.com",
        phone: "083-456-7890",
        parentPhone: "083-333-3333",
        lineId: "boy789",
        shirtSize: "L",
        allergies: "",
        medicalConditions: "โรคหัวใจ",
        emergencyContact: "คุณแม่สมใจ",
        emergencyPhone: "083-333-3333",
        laptop: "Yes"
      },
      { 
        prefix: "เด็กหญิง",
        firstName: "สมใจ", 
        lastName: "เก่งมาก", 
        nickname: "ใจ",
        birthDate: "2007-12-25",
        age: 17,
        gender: "หญิง",
        school: "อัสสัมชัญ", 
        grade: "ม.6",
        province: "กรุงเทพ",
        status: "declined",
        email: "girl@example.com",
        phone: "084-567-8901",
        parentPhone: "084-444-4444",
        lineId: "girl012",
        shirtSize: "M",
        allergies: "นม, ไข่",
        medicalConditions: "",
        emergencyContact: "คุณพ่อสมชาย",
        emergencyPhone: "084-444-4444",
        laptop: "Yes"
      },
    ]);
    res.json({ message: "เพิ่มข้อมูลตัวอย่างเรียบร้อย!", count: 4 });
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({ error: "Failed to seed data" });
  }
});

// 2. Get all users - รวมข้อมูลสำหรับ Dashboard
userRouter.get("/all", async (req, res) => {
  try {
    console.log("📥 GET /api/users/all");
    
    // ดึงข้อมูลทั้งหมดที่ Dashboard ต้องการ
    const users = await User.find({})
      .select("_id prefix firstName lastName email phone school status gender laptop allergies medicalConditions")
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
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`✅ User deleted`);
    res.json({ success: true, message: "User deleted" });
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