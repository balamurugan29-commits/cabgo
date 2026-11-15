'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { rideApi } from '@/services/api';
import { Ride } from '@/types';
import { RIDE_STATUS_CONFIG } from '@/lib/constants';

export default function DriverRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rideApi
      .getDriverRides()
      .then((res) => setRides(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Trip History"
        description="Review all trips dispatched to your vehicle and earnings per journey"
      />

      {loading ? (
        <p className="text-xs text-muted-foreground py-12 text-center animate-pulse">Loading trips...</p>
      ) : rides.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No completed trips yet"
          description="Go online on your driver dashboard to receive new ride dispatches!"
          actionLabel="Go to Dashboard"
          onAction={() => (window.location.href = '/driver/dashboard')}
        />
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{ride.dropoff_address}</span>
                    <Badge variant={RIDE_STATUS_CONFIG[ride.status]?.variant || 'default'} className="text-[10px]">
                      {RIDE_STATUS_CONFIG[ride.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Pickup: {ride.pickup_address}</p>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {new Date(ride.created_at).toLocaleDateString()} &bull; {ride.distance_km || 6.4} km &bull; Category: {ride.vehicle_type}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-emerald-600">
                    +₹{Math.round((Number(ride.actual_fare || ride.estimated_fare) || 0) * 0.8)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">Net Payout (80%)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
