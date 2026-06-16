import { Router } from 'express';
import { 
    getHeadcountReport, 
    downloadAttendanceReport, 
    getEmployeeStats, 
    getGrowthTrends, 
    getCapitalAllocation,
    getTalentStats,
    getOpsMetrics
} from '../controllers/report.controller';

import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/headcount', cacheMiddleware(600), authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getHeadcountReport);
router.get('/attendance/download', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), downloadAttendanceReport);
router.get('/employee/:userId/stats', cacheMiddleware(300), authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getEmployeeStats);
router.get('/growth-trends', cacheMiddleware(600), authorizeRoles(UserRole.HR_ADMIN), getGrowthTrends);
router.get('/capital-allocation', cacheMiddleware(600), authorizeRoles(UserRole.HR_ADMIN), getCapitalAllocation);
router.get('/talent-stats', cacheMiddleware(600), authorizeRoles(UserRole.HR_ADMIN), getTalentStats);
router.get('/ops-metrics', cacheMiddleware(600), authorizeRoles(UserRole.HR_ADMIN), getOpsMetrics);


export default router;
