import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
} from '../validators/payment.validator';

const router = Router();

router.post('/create-intent', requireAuth, validate(createPaymentIntentSchema), paymentController.createPaymentIntent);
router.post('/confirm', requireAuth, validate(confirmPaymentSchema), paymentController.confirmPayment);
router.post('/:id/refund', requireAuth, validate(refundPaymentSchema), paymentController.refundPayment);
router.get('/history', requireAuth, paymentController.getHistory);
router.post('/webhook', paymentController.handleStripeWebhook);

export default router;
