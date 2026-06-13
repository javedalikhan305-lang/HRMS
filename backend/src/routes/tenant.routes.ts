import { Router } from 'express';
import { getTenantConfig, updateTenantConfig } from '../controllers/tenant.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(UserRole.HR_ADMIN));

router.get('/config', getTenantConfig);
router.patch('/config', updateTenantConfig);

export default router;
