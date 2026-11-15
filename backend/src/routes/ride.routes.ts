import { Router } from 'express';
import { rideController } from '../controllers/ride.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createRideSchema,
  updateRideStatusSchema,
  cancelRideSchema,
  rateRideSchema,
} from '../validators/ride.validator';

const router = Router();

router.post('/', requireAuth, validate(createRideSchema), rideController.createRide);
router.get('/customer', requireAuth, rideController.getCustomerRides);
router.get('/driver', requireAuth, rideController.getDriverRides);
router.get('/:id', requireAuth, rideController.getRideById);
router.post('/:id/accept', requireAuth, rideController.acceptRide);
router.put('/:id/status', requireAuth, validate(updateRideStatusSchema), rideController.updateStatus);
router.post('/:id/cancel', requireAuth, validate(cancelRideSchema), rideController.cancelRide);
router.post('/:id/rate', requireAuth, validate(rateRideSchema), rideController.rateRide);

export default router;
