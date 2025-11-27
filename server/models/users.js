import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  prefix: String,
  firstName: String,
  lastName: String,
  nickname: String,
  birthDate: String,
  age: Number,
  gender: String,
  school: String,
  grade: String,
  province: String,
  phone: String,
  parentPhone: String,
  email: String,
  lineId: String,
  shirtSize: String,
  allergies: String,
  medicalConditions: String,
  emergencyContact: String,
  emergencyPhone: String,
  status: {
    type: String,
    enum: ["pending", "success", "declined"],
    default: "pending"
  },
  laptop: String
}, { timestamps: true });

export default mongoose.model("User", userSchema);
