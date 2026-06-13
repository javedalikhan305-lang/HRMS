import { Router } from 'express';
import { 
    punchIn, 
    punchOut, 
    getAttendanceHistory, 
    markManualAttendance, 
    getTodayAttendance 
} from '../controllers/attendance.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);

router.get('/history', getAttendanceHistory);
router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);

// Management routes
router.get('/today', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getTodayAttendance);
router.post('/manual', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), markManualAttendance);

export default router;
