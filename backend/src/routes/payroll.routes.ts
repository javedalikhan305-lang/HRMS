import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { 
    getMyPayrolls, 
    generateTenantPayroll, 
    updateStatus, 
    getPayrollDetails 
} from '../controllers/payroll.controller';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route('/my').get(getMyPayrolls);
router.route('/:id').get(getPayrollDetails);

// Admin/HR only routes
router.use(authorizeRoles(UserRole.HR_ADMIN));

router.route('/generate').post(generateTenantPayroll);
router.route('/:id/status').patch(updateStatus);

export default router;
