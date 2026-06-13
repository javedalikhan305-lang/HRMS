import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorMiddleware } from './middlewares/error.middleware';
import { ApiError } from './utils/ApiError';
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

// Middlewares
// app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to HRMS PRO API',
        version: '1.0.0'
    });
});

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


// Error Handling for undefined routes
app.all('*path', (req: Request, res: Response, next: NextFunction) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
