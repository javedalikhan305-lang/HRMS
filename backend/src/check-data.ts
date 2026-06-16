import mongoose from 'mongoose';
import { User } from './models/user.model';
import { Attendance } from './models/attendance.model';
import dotenv from 'dotenv';

dotenv.config();

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
    const users = await User.countDocuments();
    const attendance = await Attendance.countDocuments();
    console.log(`Users: ${users}, Attendance: ${attendance}`);
    process.exit(0);
};

check();
