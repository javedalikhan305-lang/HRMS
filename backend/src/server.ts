import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

mongoose.connect(env.mongoUri)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        const server = app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

        process.on('unhandledRejection', (err: any) => {
            console.error('UNHANDLED REJECTION! 💥 Shutting down...');
            console.error(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
