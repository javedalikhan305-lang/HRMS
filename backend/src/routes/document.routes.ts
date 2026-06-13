import { Router } from 'express';
import { 
    uploadDocument, 
    getMyDocuments, 
    getAllDocuments, 
    verifyDocument, 
    deleteDocument 
} from '../controllers/document.controller';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

// Secure all routes
router.use(verifyJWT);

// Employee routes
router.get('/me', getMyDocuments);
router.post('/upload', upload.single('file'), uploadDocument);

// HR/Admin routes
router.get('/all', authorizeRoles('SUPER_ADMIN' as any, 'HR_ADMIN' as any), getAllDocuments);
router.patch('/:id/verify', authorizeRoles('SUPER_ADMIN' as any, 'HR_ADMIN' as any), verifyDocument);
router.delete('/:id', authorizeRoles('SUPER_ADMIN' as any, 'HR_ADMIN' as any), deleteDocument);

export default router;
