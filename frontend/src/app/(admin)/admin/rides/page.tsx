'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Clock, MapPin, Search, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { adminApi } from '@/services/api';
import { Ride, RideStatus } from '@/types';
import { RIDE_STATUS_CONFIG } from '@/lib/constants';

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi
      .getRides()
      .then((res) => setRides(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = rides.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.pickup_address.toLowerCase().includes(q) ||
      r.dropoff_address.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Rides Oversight"
        description="Inspect all dispatched, in-progress, completed, and cancelled trips across all operational regions"
      />

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ride ID or address..."
          className="pl-9 text-xs"
        />
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground py-12 text-center animate-pulse">Loading rides...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No rides found"
          description="Rides booked by customers will show up here in real time."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ride) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">#{ride.id.slice(0, 8)}</span>
                    <Badge variant={RIDE_STATUS_CONFIG[ride.status]?.variant || 'default'} className="text-[10px]">
                      {RIDE_STATUS_CONFIG[ride.status]?.label}
                    </Badge>
                    <span className="text-xs font-semibold uppercase text-muted-foreground">({ride.vehicle_type})</span>
                  </div>

                  <p className="text-xs font-medium text-foreground">
                    From: {ride.pickup_address} &rarr; To: {ride.dropoff_address}
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    {new Date(ride.created_at).toLocaleString()} &bull; Distance: {ride.distance_km || 6.4} km &bull; Est: {ride.duration_minutes || 20} mins
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                  <span className="text-base font-bold text-foreground">
                    ₹{(Number(ride.actual_fare || ride.estimated_fare) || 0).toFixed(0)}
                  </span>
                  <Link
                    href={`/rides/${ride.id}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    Inspect Trip <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
