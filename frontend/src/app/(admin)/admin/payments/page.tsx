'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowDownLeft, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { adminApi, paymentApi } from '@/services/api';
import { Payment } from '@/types';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'pay-001',
      ride_id: 'ride-001',
      customer_id: 'customer-user-001',
      amount: 190,
      currency: 'INR',
      status: 'completed' as any,
      stripe_payment_intent_id: 'pi_3P593xKd81923',
      stripe_client_secret: null,
      payment_method: 'stripe_card',
      refund_amount: null,
      refund_reason: null,
      paid_at: '2026-03-01T10:00:00.000Z',
      created_at: '2026-03-01T10:00:00.000Z',
      updated_at: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'pay-002',
      ride_id: 'ride-002',
      customer_id: 'customer-user-001',
      amount: 260,
      currency: 'INR',
      status: 'completed' as any,
      stripe_payment_intent_id: 'pi_3P593xKd81924',
      stripe_client_secret: null,
      payment_method: 'upi',
      refund_amount: null,
      refund_reason: null,
      paid_at: '2026-03-02T12:00:00.000Z',
      created_at: '2026-03-02T12:00:00.000Z',
      updated_at: '2026-03-02T12:00:00.000Z',
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getPayments()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setPayments(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRefund = async (paymentId: string) => {
    const reason = prompt('Please enter refund reason:', 'Customer requested cancellation dispute');
    if (!reason) return;

    try {
      await paymentApi.refund(paymentId, reason);
      setPayments(
        payments.map((p) =>
          p.id === paymentId ? { ...p, status: 'refunded' as any, refund_reason: reason } : p
        )
      );
      toast.success('Refund processed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Refund processing failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions & Payments"
        description="Monitor Stripe payment intents, gateway authorizations, customer receipts, and refunds"
      />

      <div className="space-y-3">
        {payments.map((p) => (
          <Card key={p.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      ₹{p.amount} {p.currency}
                    </span>
                    <Badge variant={p.status === 'completed' ? 'success' : 'destructive'} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Intent ID: {p.stripe_payment_intent_id || 'Cash / Mock'} &bull; Method: {p.payment_method || 'Card'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Processed on: {new Date(p.created_at).toLocaleString()}
                  </p>
                  {p.refund_reason && (
                    <p className="text-xs text-rose-600 mt-1">Refund Note: {p.refund_reason}</p>
                  )}
                </div>
              </div>

              <div>
                {p.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefund(p.id)}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Issue Refund
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
