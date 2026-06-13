import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms-pro';

async function fixRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for role fix');

        // Update all users with role 'ADMIN' or 'admin' to 'HR_ADMIN'
        const result = await User.updateMany(
            { role: { $in: ['ADMIN', 'admin', 'SUPER_ADMIN'] } },
            { $set: { role: 'HR_ADMIN' } }
        );

        console.log(`✅ Roles updated successfully. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing roles:', error);
        process.exit(1);
    }
}

fixRoles();
