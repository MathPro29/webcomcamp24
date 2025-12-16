import mongoose from 'mongoose';
import User from '../models/users.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupEmptyCertificates = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find users with certificate object but no filename
    const usersWithEmptyCerts = await User.find({
      'certificate': { $exists: true },
      'certificate.filename': { $exists: false }
    });

    console.log(`\n📊 Found ${usersWithEmptyCerts.length} users with empty certificate objects`);

    if (usersWithEmptyCerts.length > 0) {
      console.log('\n🧹 Cleaning up...');
      
      for (const user of usersWithEmptyCerts) {
        user.certificate = undefined;
        await user.save();
        console.log(`  ✅ Cleaned certificate for: ${user.firstName} ${user.lastName}`);
      }

      console.log(`\n✅ Cleanup complete! Removed ${usersWithEmptyCerts.length} empty certificate objects`);
    } else {
      console.log('\n✅ No cleanup needed - all certificates are valid or undefined');
    }

    // Show summary
    const totalUsers = await User.countDocuments();
    const usersWithCerts = await User.countDocuments({
      'certificate.filename': { $exists: true }
    });

    console.log('\n📊 Summary:');
    console.log(`  Total users: ${totalUsers}`);
    console.log(`  Users with certificates: ${usersWithCerts}`);
    console.log(`  Users without certificates: ${totalUsers - usersWithCerts}`);

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupEmptyCertificates();
