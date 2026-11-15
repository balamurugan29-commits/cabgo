import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import driverRoutes from './driver.routes';
import rideRoutes from './ride.routes';
import fareRoutes from './fare.routes';
import paymentRoutes from './payment.routes';
import notificationRoutes from './notification.routes';
import supportRoutes from './support.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);
router.use('/driver', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/fares', fareRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Uber Clone Cab Booking API',
    version: '1.0.0',
  });
});

export default router;
