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

const router = Router();

router.use(verifyJWT);

router.get('/headcount', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getHeadcountReport);
router.get('/attendance/download', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), downloadAttendanceReport);
router.get('/employee/:userId/stats', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getEmployeeStats);
router.get('/growth-trends', authorizeRoles(UserRole.HR_ADMIN), getGrowthTrends);
router.get('/capital-allocation', authorizeRoles(UserRole.HR_ADMIN), getCapitalAllocation);
router.get('/talent-stats', authorizeRoles(UserRole.HR_ADMIN), getTalentStats);
router.get('/ops-metrics', authorizeRoles(UserRole.HR_ADMIN), getOpsMetrics);


export default router;
