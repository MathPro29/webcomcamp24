// server/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // จะเก็บ hashed password
  role: { type: String, default: 'user' }, // 'admin' สำหรับบัญชีแอดมิน
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);