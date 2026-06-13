import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { Notification } from '../models/notification.model';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(verifyJWT);

router.get('/', asyncHandler(async (req: any, res) => {
    const notifications = await Notification.find({ 
        userId: req.user._id,
        tenantId: req.user.tenantId 
    }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
}));

router.patch('/read-all', asyncHandler(async (req: any, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
    );
    return res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
}));

router.patch('/:id/read', asyncHandler(async (req: any, res) => {
    await Notification.updateOne(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true }
    );
    return res.status(200).json(new ApiResponse(200, {}, "Notification marked as read"));
}));


router.delete('/:id', asyncHandler(async (req: any, res) => {
    await Notification.deleteOne({ _id: req.params.id, userId: req.user._id });
    return res.status(200).json(new ApiResponse(200, {}, "Notification deleted"));
}));

export default router;
