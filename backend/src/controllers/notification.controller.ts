import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const notifications = await notificationService.getAll(user.id);
      sendSuccess(res, notifications);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await notificationService.markAsRead(user.id, id);
      sendSuccess(res, null, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      await notificationService.markAllAsRead(user.id);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const count = await notificationService.getUnreadCount(user.id);
      sendSuccess(res, { unreadCount: count });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
