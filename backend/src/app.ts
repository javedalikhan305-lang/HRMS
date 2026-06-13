import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { errorMiddleware } from './middlewares/error.middleware';
import { ApiError } from './utils/ApiError';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import notificationRoutes from './routes/notification.routes';
import onboardingRoutes from './routes/onboarding.routes';
import tenantRoutes from './routes/tenant.routes';
import payrollRoutes from './routes/payroll.routes';
import documentRoutes from './routes/document.routes';
import workflowRoutes from './routes/workflow.routes';
import reportRoutes from './routes/report.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app: Application = express();

app.set('trust proxy', 1);

// Middlewares
app.use(cors({
    origin: env.corsOrigin
        ? env.corsOrigin.split(',').map((origin) => origin.trim())
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/org', orgRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);

// ✅ Frontend static files serve karo
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// ✅ API 404 ya frontend index.html
app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/')) {
        return next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;