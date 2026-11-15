'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { fareApi, adminApi } from '@/services/api';
import { VehicleType, FareSetting } from '@/types';
import { toast } from 'sonner';

export default function AdminFareSettingsPage() {
  const [settings, setSettings] = useState<Record<VehicleType, any>>({
    [VehicleType.BIKE]: { base_fare: 15, per_km_rate: 5, per_minute_rate: 1, minimum_fare: 25, cancellation_fee: 10, surge_multiplier: 1.0 },
    [VehicleType.AUTO]: { base_fare: 25, per_km_rate: 9, per_minute_rate: 1.5, minimum_fare: 30, cancellation_fee: 15, surge_multiplier: 1.0 },
    [VehicleType.MINI]: { base_fare: 40, per_km_rate: 12, per_minute_rate: 2, minimum_fare: 50, cancellation_fee: 25, surge_multiplier: 1.0 },
    [VehicleType.SEDAN]: { base_fare: 60, per_km_rate: 15, per_minute_rate: 2.5, minimum_fare: 80, cancellation_fee: 30, surge_multiplier: 1.0 },
    [VehicleType.SUV]: { base_fare: 80, per_km_rate: 20, per_minute_rate: 3, minimum_fare: 100, cancellation_fee: 40, surge_multiplier: 1.0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fareApi
      .getSettings()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const map: any = { ...settings };
          res.data.forEach((s: FareSetting) => {
            map[s.vehicle_type] = {
              base_fare: Number(s.base_fare),
              per_km_rate: Number(s.per_km_rate),
              per_minute_rate: Number(s.per_minute_rate),
              minimum_fare: Number(s.minimum_fare),
              cancellation_fee: Number(s.cancellation_fee),
              surge_multiplier: Number(s.surge_multiplier || 1.0),
            };
          });
          setSettings(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (type: VehicleType) => {
    try {
      const data = settings[type];
      await adminApi.updateFareSetting(type, data);
      toast.success(`${type.toUpperCase()} pricing rules updated!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update fare setting');
    }
  };

  const handleChange = (type: VehicleType, field: string, value: number) => {
    setSettings({
      ...settings,
      [type]: {
        ...settings[type],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurable Fare Engine"
        description="Live platform pricing settings. All ride estimates and trip charges calculate dynamically from these database rules"
      />

      {/* Formula banner */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-4 flex items-center gap-3 text-xs">
          <Info className="size-5 text-primary shrink-0" />
          <div>
            <strong>Fare Calculation Algorithm:</strong> Total Fare = Max(Minimum Fare, Base Fare + [Distance &times; Per KM Rate] + [Duration &times; Per Min Rate]) &times; Surge Multiplier &minus; Discounts
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(settings) as VehicleType[]).map((type) => {
          const cfg = settings[type];

          return (
            <Card key={type} className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base uppercase tracking-wider">{type}</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    Surge: {cfg.surge_multiplier}x
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Base Fare (₹)</label>
                    <Input
                      type="number"
                      value={cfg.base_fare}
                      onChange={(e) => handleChange(type, 'base_fare', Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Per KM Rate (₹/km)</label>
                    <Input
                      type="number"
                      value={cfg.per_km_rate}
                      onChange={(e) => handleChange(type, 'per_km_rate', Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Per Minute (₹/min)</label>
                    <Input
                      type="number"
                      value={cfg.per_minute_rate}
                      onChange={(e) => handleChange(type, 'per_minute_rate', Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Minimum Fare (₹)</label>
                    <Input
                      type="number"
                      value={cfg.minimum_fare}
                      onChange={(e) => handleChange(type, 'minimum_fare', Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Cancellation Fee (₹)</label>
                    <Input
                      type="number"
                      value={cfg.cancellation_fee}
                      onChange={(e) => handleChange(type, 'cancellation_fee', Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Surge Multiplier</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="4.0"
                      value={cfg.surge_multiplier}
                      onChange={(e) => handleChange(type, 'surge_multiplier', Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <Button size="sm" onClick={() => handleUpdate(type)} className="w-full text-xs">
                  <Save className="size-3.5 mr-1.5" /> Save {type.toUpperCase()} Rules
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
