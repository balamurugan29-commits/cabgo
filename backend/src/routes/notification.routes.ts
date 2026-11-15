import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, notificationController.getAll);
router.get('/unread-count', requireAuth, notificationController.getUnreadCount);
router.put('/:id/read', requireAuth, notificationController.markAsRead);
router.put('/mark-all-read', requireAuth, notificationController.markAllAsRead);

export default router;
