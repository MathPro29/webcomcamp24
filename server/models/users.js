// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, index: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  // add fields ตามโครงจริงของ collection ท่าน
}, { collection: "users" }); // บังคับชื่อ collection ถ้าจำเป็น

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
