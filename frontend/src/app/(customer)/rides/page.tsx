'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { rideApi } from '@/services/api';
import { Ride, RideStatus } from '@/types';
import { RIDE_STATUS_CONFIG } from '@/lib/constants';

export default function CustomerRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    rideApi
      .getCustomerRides()
      .then((res) => setRides(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredRides = rides.filter((ride) => {
    // Filter by tab
    if (activeTab === 'completed' && ride.status !== RideStatus.COMPLETED) return false;
    if (activeTab === 'cancelled' && ride.status !== RideStatus.CANCELLED) return false;
    if (
      activeTab === 'active' &&
      [RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)
    )
      return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ride.pickup_address.toLowerCase().includes(q) ||
        ride.dropoff_address.toLowerCase().includes(q) ||
        ride.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Rides"
        description="View your past journeys, active rides, and trip invoices"
      >
        <Link href="/book-ride">
          <Button size="sm">
            <Car className="size-4 mr-1.5" /> Book a Ride
          </Button>
        </Link>
      </PageHeader>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tab pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border w-full sm:w-auto">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination or address..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
          Loading rides...
        </div>
      ) : filteredRides.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No rides found"
          description={
            activeTab === 'all'
              ? "You haven't taken any trips yet. Book a ride to travel with CabGo!"
              : `No ${activeTab} rides match your filter criteria.`
          }
          actionLabel="Book a Ride"
          onAction={() => (window.location.href = '/book-ride')}
        />
      ) : (
        <div className="space-y-3">
          {filteredRides.map((ride) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="size-11 rounded-xl bg-muted flex items-center justify-center font-bold text-foreground shrink-0 mt-0.5">
                    <Car className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {ride.dropoff_address}
                      </span>
                      <Badge
                        variant={RIDE_STATUS_CONFIG[ride.status]?.variant || 'default'}
                        className="text-[10px]"
                      >
                        {RIDE_STATUS_CONFIG[ride.status]?.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-blue-600" /> From: {ride.pickup_address}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>{new Date(ride.created_at).toLocaleDateString()}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{ride.vehicle_type}</span>
                      <span>&bull;</span>
                      <span>{ride.distance_km || 6.4} km</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                  <span className="text-base font-bold text-foreground">
                    ₹{(Number(ride.actual_fare || ride.estimated_fare) || 0).toFixed(0)}
                  </span>
                  <Link
                    href={`/rides/${ride.id}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    View Details <ArrowRight className="size-3.5" />
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
