import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash password ก่อนบันทึกลง DB
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ฟังก์ชันเช็ก password
adminSchema.methods.comparePassword = async function (password) {
    // Defensive check: bcrypt requires both arguments to be strings
    if (typeof password !== 'string' || typeof this.password !== 'string') {
        console.warn('⚠️ Invalid password comparison attempt - non-string value provided');
        return false;
    }
    
    // Additional safety: check for empty strings
    if (!password || !this.password) {
        return false;
    }
    
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.error('❌ Error in password comparison:', error.message);
        return false;
    }
};

export default mongoose.model("Admin", adminSchema);
