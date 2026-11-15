import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Payment, PaymentStatus } from '../types';
import { memoryStore } from '../utils/store';
import { NotFoundError, AppError } from '../utils/errors';
import { rideService } from './ride.service';
import { emailService } from './email.service';

export class PaymentService {
  private stripe: Stripe | null = null;

  constructor() {
    if (config.stripe.secretKey && !config.stripe.secretKey.includes('your_')) {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2026-03-25.acacia' as any,
      });
    }
  }

  async createPaymentIntent(rideId: string, customerId: string): Promise<{
    paymentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
  }> {
    const ride = await rideService.getRideById(rideId);
    if (!ride) throw new NotFoundError('Ride not found');

    const amount = Number(ride.actual_fare || ride.estimated_fare);
    if (!amount || amount <= 0) {
      throw new AppError('Invalid ride fare amount', 400);
    }

    let clientSecret = `pi_mock_${uuidv4()}_secret_${uuidv4()}`;
    let stripeIntentId = `pi_mock_${uuidv4()}`;

    if (this.stripe) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // amount in paise
          currency: 'inr',
          metadata: { rideId, customerId },
          automatic_payment_methods: { enabled: true },
        });
        clientSecret = paymentIntent.client_secret || clientSecret;
        stripeIntentId = paymentIntent.id;
      } catch (err: any) {
        console.warn('Stripe Live API call warning, using fallback payment intent:', err.message);
      }
    }

    const paymentId = uuidv4();
    const payment: Payment = {
      id: paymentId,
      ride_id: rideId,
      customer_id: customerId,
      amount,
      currency: 'INR',
      status: PaymentStatus.PENDING,
      stripe_payment_intent_id: stripeIntentId,
      stripe_client_secret: clientSecret,
      payment_method: null,
      refund_amount: null,
      refund_reason: null,
      paid_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('payments').insert(payment);
    } catch {
      // fallback
    }

    memoryStore.payments.set(rideId, payment);

    return {
      paymentId,
      clientSecret,
      amount,
      currency: 'INR',
    };
  }

  async confirmPayment(paymentIntentId: string, paymentMethod = 'stripe_card'): Promise<Payment> {
    const payment = Array.from(memoryStore.payments.values()).find(
      (p) =>
        p.stripe_payment_intent_id === paymentIntentId ||
        p.stripe_client_secret === paymentIntentId ||
        p.id === paymentIntentId
    );

    if (!payment) throw new NotFoundError('Payment record not found');

    payment.status = PaymentStatus.COMPLETED;
    payment.payment_method = paymentMethod;
    payment.paid_at = new Date().toISOString();
    payment.updated_at = new Date().toISOString();

    memoryStore.payments.set(payment.ride_id, payment);

    try {
      await supabase
        .from('payments')
        .update({
          status: PaymentStatus.COMPLETED,
          payment_method: paymentMethod,
          paid_at: payment.paid_at,
        })
        .eq('id', payment.id);
    } catch {
      // fallback
    }

    // Send receipt email
    const ride = memoryStore.rides.get(payment.ride_id);
    const customer = memoryStore.users.get(payment.customer_id);
    if (customer?.email && ride) {
      emailService.sendRideReceipt(customer.email, {
        rideId: ride.id,
        pickup: ride.pickup_address,
        dropoff: ride.dropoff_address,
        fare: payment.amount,
        date: new Date().toLocaleDateString(),
      }).catch(console.error);
    }

    return payment;
  }

  async refundPayment(paymentId: string, reason: string, refundAmount?: number): Promise<Payment> {
    const payment = memoryStore.payments.get(paymentId) || Array.from(memoryStore.payments.values()).find((p) => p.id === paymentId);
    if (!payment) throw new NotFoundError('Payment not found');

    const amountToRefund = refundAmount || payment.amount;

    if (this.stripe && payment.stripe_payment_intent_id && !payment.stripe_payment_intent_id.startsWith('pi_mock_')) {
      try {
        await this.stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent_id,
          amount: Math.round(amountToRefund * 100),
        });
      } catch (err: any) {
        console.warn('Stripe refund warning:', err.message);
      }
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refund_amount = amountToRefund;
    payment.refund_reason = reason;
    payment.updated_at = new Date().toISOString();

    memoryStore.payments.set(payment.ride_id, payment);

    try {
      await supabase.from('payments').update(payment).eq('id', payment.id);
    } catch {
      // fallback
    }

    return payment;
  }

  async getHistory(userId: string): Promise<Payment[]> {
    const list = Array.from(memoryStore.payments.values()).filter((p) => p.customer_id === userId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  async getAllPayments(): Promise<Payment[]> {
    const list = Array.from(memoryStore.payments.values());
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }
}

export const paymentService = new PaymentService();
