import User from "../models/users.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users); // ได้รูปแบบตามที่ต้องการ
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
