import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { syncUserSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.post('/sync', validate(syncUserSchema), authController.syncUser);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);

export default router;
