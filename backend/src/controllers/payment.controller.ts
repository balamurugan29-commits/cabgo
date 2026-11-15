import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class PaymentController {
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const result = await paymentService.createPaymentIntent(req.body.ride_id, user.id);
      sendSuccess(res, result, 'Payment intent created');
    } catch (err) {
      next(err);
    }
  }

  async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.confirmPayment(
        req.body.payment_intent_id,
        req.body.payment_method || 'stripe_card'
      );
      sendSuccess(res, payment, 'Payment confirmed successfully');
    } catch (err) {
      next(err);
    }
  }

  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payment = await paymentService.refundPayment(
        id,
        req.body.reason,
        req.body.amount
      );
      sendSuccess(res, payment, 'Refund processed successfully');
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const history = await paymentService.getHistory(user.id);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    res.json({ received: true });
  }
}

export const paymentController = new PaymentController();
