import { Router } from 'express';
import { addEmployee, getMyProfile, getAllEmployees, updateMyProfile, updateEmployee, getEmployeeById } from '../controllers/employee.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);

// Self-service routes (any authenticated user)
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

// HR/Admin/Manager routes
router.get('/', authorizeRoles(UserRole.HR_ADMIN, UserRole.MANAGER), getAllEmployees);
router.get('/:id', authorizeRoles(UserRole.HR_ADMIN, UserRole.MANAGER), getEmployeeById);
router.post('/', authorizeRoles(UserRole.HR_ADMIN), addEmployee);
router.put('/:id', authorizeRoles(UserRole.HR_ADMIN), updateEmployee);

export default router;
