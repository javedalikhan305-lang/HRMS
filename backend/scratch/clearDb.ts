import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        const db = mongoose.connection.db;
        if (!db) return;

        await db.collection('tenants').deleteMany({});
        await db.collection('users').deleteMany({});
        console.log('Cleared all tenants and users');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

clearDb();
