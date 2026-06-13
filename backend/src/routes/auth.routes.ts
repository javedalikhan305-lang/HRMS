import { Router } from 'express';
import { 
    registerTenant, 
    login, 
    logout, 
    refreshAccessToken 
} from '../controllers/auth.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register-tenant', registerTenant);
router.post('/login', login);

// Secured Routes
router.post('/logout', verifyJWT, logout);
router.post('/refresh-token', refreshAccessToken);

export default router;
