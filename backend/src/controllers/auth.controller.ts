import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  async syncUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clerk_id, email, first_name, last_name, phone, avatar_url, role } = req.body;
      const user = await userService.syncUser(clerk_id, {
        email,
        first_name,
        last_name,
        phone,
        avatar_url,
        role,
      });
      sendSuccess(res, user, 'User synced successfully');
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clerkId = req.userId;
      if (!clerkId) {
        // Fallback for dev mode
        const firstUser = Array.from((await import('../utils/store')).memoryStore.users.values())[0];
        sendSuccess(res, firstUser);
        return;
      }
      const user = await userService.getUserByClerkId(clerkId);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clerkId = req.userId;
      const user = await userService.getUserByClerkId(clerkId!);
      const updated = await userService.updateUser(user.id, req.body);
      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
