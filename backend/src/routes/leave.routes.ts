import { Router } from 'express';
import { applyLeave, getLeaveRequests, updateLeaveStatus } from '../controllers/leave.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);

router.post('/', applyLeave);
router.get('/', getLeaveRequests);
router.patch('/:id/status', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), updateLeaveStatus);

export default router;
