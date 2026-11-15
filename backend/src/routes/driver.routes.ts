import { Router } from 'express';
import { driverController } from '../controllers/driver.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerDriverSchema,
  updateLocationSchema,
  updateOnlineStatusSchema,
  addVehicleSchema,
  uploadDocumentSchema,
} from '../validators/driver.validator';

const router = Router();

router.post('/register', requireAuth, validate(registerDriverSchema), driverController.register);
router.get('/profile', requireAuth, driverController.getProfile);
router.put('/online-status', requireAuth, validate(updateOnlineStatusSchema), driverController.updateOnlineStatus);
router.put('/location', requireAuth, validate(updateLocationSchema), driverController.updateLocation);
router.post('/vehicles', requireAuth, validate(addVehicleSchema), driverController.addVehicle);
router.post('/documents', requireAuth, validate(uploadDocumentSchema), driverController.addDocument);
router.get('/earnings', requireAuth, driverController.getEarnings);
router.get('/nearby', driverController.getNearbyDrivers);

export default router;
