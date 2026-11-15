import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  ride_id: z.string().uuid(),
});

export const confirmPaymentSchema = z.object({
  payment_intent_id: z.string().min(5),
});

export const refundPaymentSchema = z.object({
  reason: z.string().min(5),
  amount: z.number().positive().optional(),
});
