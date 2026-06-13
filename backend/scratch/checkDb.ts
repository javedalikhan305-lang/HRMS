import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to DB');
        
        const db = mongoose.connection.db;
        if (!db) {
            console.error('DB connection failed');
            return;
        }
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const usersCount = await db.collection('users').countDocuments();
        const tenantsCount = await db.collection('tenants').countDocuments();

        console.log('Users count:', usersCount);
        console.log('Tenants count:', tenantsCount);

        if (usersCount > 0) {
            const users = await db.collection('users').find({}).limit(5).toArray();
            console.log('Sample Users (emails):', users.map(u => u.email));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDb();
