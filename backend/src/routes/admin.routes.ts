import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateDriverStatusSchema,
  createPromoCodeSchema,
  updateFareSettingSchema,
} from '../validators/admin.validator';

const router = Router();

router.get('/stats', requireAuth, requireAdmin, adminController.getDashboardStats);
router.get('/customers', requireAuth, requireAdmin, adminController.getCustomers);
router.get('/drivers', requireAuth, requireAdmin, adminController.getDrivers);
router.put('/drivers/:id/approve', requireAuth, requireAdmin, adminController.approveDriver);
router.put('/drivers/:id/reject', requireAuth, requireAdmin, adminController.rejectDriver);
router.put('/users/:id/suspend', requireAuth, requireAdmin, adminController.suspendUser);
router.get('/audit-logs', requireAuth, requireAdmin, adminController.getAuditLogs);
router.get('/rides', requireAuth, requireAdmin, adminController.getRides);
router.get('/payments', requireAuth, requireAdmin, adminController.getPayments);
router.get('/promo-codes', requireAuth, requireAdmin, adminController.getPromoCodes);
router.post('/promo-codes', requireAuth, requireAdmin, validate(createPromoCodeSchema), adminController.createPromoCode);
router.put('/promo-codes/:code/status', requireAuth, requireAdmin, adminController.updatePromoStatus);
router.put('/fare-settings/:vehicleType', requireAuth, requireAdmin, validate(updateFareSettingSchema), adminController.updateFareSetting);

export default router;
