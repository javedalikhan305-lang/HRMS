import { Router } from 'express';
import { chatWithAI } from '../controllers/ai.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);

// Only Admin and HR can access the AI HR Assistant
router.post('/chat', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), chatWithAI);

export default router;
