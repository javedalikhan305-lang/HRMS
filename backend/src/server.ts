import dotenv from 'dotenv';
dotenv.config();
process.env.TZ = 'Asia/Kolkata'; // Force timezone to IST for production environment (Render/Live)

// Override system DNS to fix ESERVFAIL on MongoDB Atlas SRV records
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectWithRetry = async (attempt = 1): Promise<void> => {
    try {
        await mongoose.connect(env.mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4 to fix ESERVFAIL DNS issues
        });
        console.log('✅ MongoDB Connected Successfully');

        const server = app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

        process.on('unhandledRejection', (err: any) => {
            console.error('UNHANDLED REJECTION! 💥 Shutting down...');
            console.error(err.name, err.message);
            server.close(() => process.exit(1));
        });

    } catch (err: any) {
        console.error(`❌ MongoDB Connection Error (Attempt ${attempt}/${MAX_RETRIES}):`, err.message);

        if (attempt < MAX_RETRIES) {
            console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            setTimeout(() => connectWithRetry(attempt + 1), RETRY_DELAY_MS);
        } else {
            console.error('🔴 Max retries reached. Please check your network/MongoDB Atlas settings.');
            process.exit(1);
        }
    }
};

connectWithRetry();
