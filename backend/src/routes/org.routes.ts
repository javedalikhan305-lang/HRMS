import { Router } from 'express';
import { 
    createDepartment, 
    updateDepartment,
    deleteDepartment,
    getDepartments,
    createDesignation, 
    updateDesignation,
    deleteDesignation,
    getDesignations,
    createShift,
    updateShift,
    deleteShift,
    getShifts,
    getDashboardStats,
    getPersonalStats,
    getManagerStats,
    getExecutiveStats,
    getOrgChart,
    getOrgMetrics
} from '../controllers/org.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.use(verifyJWT);

// Dashboard stats & Charts
router.get('/dashboard-stats', cacheMiddleware(300), authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getDashboardStats);
router.get('/personal-stats', cacheMiddleware(300), getPersonalStats);
router.get('/manager-stats', cacheMiddleware(300), authorizeRoles(UserRole.MANAGER, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN), getManagerStats);
router.get('/executive-stats', cacheMiddleware(300), authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), getExecutiveStats);
router.get('/chart', cacheMiddleware(600), authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), getOrgChart);

router.get('/metrics', cacheMiddleware(300), authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), getOrgMetrics);

// Information fetching (generally available to authenticated users)
router.get('/departments', cacheMiddleware(10), getDepartments);
router.get('/designations', cacheMiddleware(10), getDesignations);
router.get('/shifts', cacheMiddleware(10), getShifts);

// Admin-only management routes
router.use(authorizeRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN));

router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.post('/designations', createDesignation);
router.put('/designations/:id', updateDesignation);
router.delete('/designations/:id', deleteDesignation);

router.post('/shifts', createShift);
router.put('/shifts/:id', updateShift);
router.delete('/shifts/:id', deleteShift);

export default router;
