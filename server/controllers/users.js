// controllers/users.js
import User from "../models/users.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName lastName school grade status") // ดึงเฉพาะที่ frontend ต้องการ (เพิ่ม grade)
      .sort({ lastName: 1, firstName: 1 })
      .lean(); // ทำให้เร็วขึ้น

    // ถ้าไม่มีข้อมูลเลย
    if (users.length === 0) {
      return res.json([]);
    }

    res.json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ error: "ดึงข้อมูลไม่สำเร็จ" });
  }
};