#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import DBconnect from '../config/db.js';
import mongoose from 'mongoose';
import Admin from '../models/admin.js';

async function seed(username, password) {
  if (!username || !password) {
    console.error('Usage: node scripts/seedAdmin.js <username> <password>');
    process.exit(1);
  }

  await DBconnect();

  try {
    let admin = await Admin.findOne({ username });
    if (admin) {
      admin.password = password; // will be hashed in pre('save')
      await admin.save();
      console.log(`Updated admin '${username}'`);
    } else {
      await Admin.create({ username, password });
      console.log(`Created admin '${username}'`);
    }
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

const [, , username, password] = process.argv;
seed(username, password).catch(err => {
  console.error(err);
  process.exit(1);
});
