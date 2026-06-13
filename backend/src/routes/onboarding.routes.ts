import { Router } from 'express';
import { 
    inviteCandidate, 
    getOnboardingList, 
    updateProgress, 
    deleteOnboarding 
} from '../controllers/onboarding.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(UserRole.HR_ADMIN));

router.post('/invite', inviteCandidate);
router.get('/list', getOnboardingList);
router.patch('/:id/progress', updateProgress);
router.delete('/:id', deleteOnboarding);

export default router;
