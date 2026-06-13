import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms-pro';

async function checkAdminUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({
            $or: [
                { firstName: /admin/i },
                { lastName: /admin/i },
                { email: /admin/i }
            ]
        });

        console.log(`Found ${users.length} users with "admin" in their details:`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Name: ${u.firstName} ${u.lastName}, Email: ${u.email}, Role: ${u.role}`);
        });
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking users:', error);
        process.exit(1);
    }
}

checkAdminUser();
