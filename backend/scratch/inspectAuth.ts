import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkTenants = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        const db = mongoose.connection.db;
        if (!db) return;

        const tenants = await db.collection('tenants').find({}).toArray();
        console.log('Tenants:', JSON.stringify(tenants, null, 2));

        const users = await db.collection('users').find({}).toArray();
        console.log('Users:', JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkTenants();
