// server/scripts/createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

async function run() {
  await connectDB();
  const username = process.env.ADMIN_USERNAME || 'adminbas';
  const password = process.env.ADMIN_PASSWORD || 'admin69';
  const force = process.argv.includes('--force') || process.env.FORCE_CREATE === 'true';
  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    if (!force) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // update password when --force is provided
    const hash = await bcrypt.hash(password, 10);
    existing.password = hash;
    existing.role = 'admin';
    await existing.save();
    console.log('Admin updated (password reset):', username);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = new User({ username: username.toLowerCase(), password: hash, role: 'admin' });
  await admin.save();
  console.log('Created admin:', username);
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});