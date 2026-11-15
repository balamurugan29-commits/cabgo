'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, Clock, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { adminApi } from '@/services/api';
import { PromoCode } from '@/types';
import { toast } from 'sonner';

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([
    {
      id: 'promo-1',
      code: 'FIRST50',
      description: '50% off on your first ride up to ₹100',
      discount_type: 'percentage',
      discount_value: 50,
      max_discount: 100,
      min_ride_amount: 100,
      max_uses: 1000,
      used_count: 32,
      valid_from: '2026-01-01T00:00:00.000Z',
      valid_until: '2026-12-31T23:59:59.000Z',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'promo-2',
      code: 'UBERFREE',
      description: 'Flat ₹50 off on Sedan or SUV',
      discount_type: 'fixed',
      discount_value: 50,
      max_discount: null,
      min_ride_amount: 150,
      max_uses: 500,
      used_count: 89,
      valid_from: '2026-01-01T00:00:00.000Z',
      valid_until: '2026-12-31T23:59:59.000Z',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ]);

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [minAmount, setMinAmount] = useState(150);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    adminApi
      .getPromoCodes()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setPromos(res.data);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Promo code name is required');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await adminApi.createPromoCode({
        code: code.toUpperCase().trim(),
        description,
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_discount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
        min_ride_amount: Number(minAmount),
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 60 * 86400000).toISOString(),
        is_active: true,
      });

      setPromos([...promos, res.data]);
      setCode('');
      setDescription('');
      toast.success(`Coupon "${code.toUpperCase()}" created!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (promoCodeStr: string, current: boolean) => {
    try {
      await adminApi.updatePromoStatus(promoCodeStr, !current);
      setPromos(
        promos.map((p) => (p.code === promoCodeStr ? { ...p, is_active: !current } : p))
      );
      toast.success(`Coupon status updated`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Promotions & Discount Codes"
        description="Create promotional campaigns, set ride discounts, and configure minimum trip thresholds"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Create Code */}
        <div className="md:col-span-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Create Promo Code</CardTitle>
              <CardDescription>Configure discount value & validity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Coupon Code</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MONSOON30"
                    className="text-xs uppercase font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 30% off up to ₹75"
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Discount Value</label>
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Max Cap (₹)</label>
                    <Input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Min Trip (₹)</label>
                    <Input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
                  <Plus className="size-3.5 mr-1" /> Publish Promo Code
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Promo Codes List */}
        <div className="md:col-span-7 space-y-3">
          {promos.map((p) => (
            <Card key={p.id} className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {p.code}
                    </span>
                    <Badge variant={p.is_active ? 'success' : 'secondary'} className="text-[10px]">
                      {p.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {p.discount_type === 'percentage' ? `${p.discount_value}% Off` : `Flat ₹${p.discount_value} Off`} &bull; Min Trip: ₹{p.min_ride_amount} &bull; Used: {p.used_count} times
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggle(p.code, p.is_active)}
                  className="text-xs"
                >
                  <Power className="size-3 mr-1" />
                  {p.is_active ? 'Deactivate' : 'Enable'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
