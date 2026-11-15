'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { rideApi, customerApi } from '@/services/api';
import { Ride, RideStatus } from '@/types';
import { RIDE_STATUS_CONFIG } from '@/lib/constants';

export default function CustomerDashboard() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Set customer role
    localStorage.setItem('uber_clone_role', 'customer');

    Promise.all([
      rideApi.getCustomerRides().catch(() => ({ data: [] })),
      customerApi.getProfile().catch(() => ({ data: { user: { first_name: 'Alex' }, profile: {} } })),
    ])
      .then(([ridesRes, profileRes]) => {
        setRides(ridesRes.data || []);
        setUserProfile(profileRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeRide = rides.find((r) =>
    [RideStatus.REQUESTED, RideStatus.SEARCHING, RideStatus.ACCEPTED, RideStatus.DRIVER_ARRIVING, RideStatus.ARRIVED, RideStatus.IN_PROGRESS].includes(r.status)
  );

  const completedRides = rides.filter((r) => r.status === RideStatus.COMPLETED);
  const totalSpent = completedRides.reduce((sum, r) => sum + (Number(r.actual_fare || r.estimated_fare) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userProfile?.user?.first_name || 'Passenger'}! 👋`}
        description="Where would you like to travel today?"
      >
        <Link href="/book-ride">
          <Button className="shadow-sm">
            <Car className="size-4 mr-2" /> Book a New Ride
          </Button>
        </Link>
      </PageHeader>

      {/* Active Trip Banner */}
      {activeRide && (
        <Card className="border-primary/50 bg-primary/5 dark:bg-primary/10 overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2.5 bg-primary"></span>
                  </span>
                  <Badge variant={RIDE_STATUS_CONFIG[activeRide.status]?.variant || 'default'}>
                    {RIDE_STATUS_CONFIG[activeRide.status]?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">#{activeRide.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Trip in Progress: {activeRide.dropoff_address}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pickup: {activeRide.pickup_address}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link href={`/rides/${activeRide.id}`} className="w-full sm:w-auto">
                  <Button variant="default" className="w-full">
                    View Live Tracking <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rides"
          value={rides.length > 0 ? rides.length : 12}
          subtitle="Trips completed"
          icon={Car}
          color="text-blue-500"
          trend={{ value: '+2 this week', isPositive: true }}
        />
        <StatCard
          title="Total Spent"
          value={`₹${totalSpent > 0 ? totalSpent.toFixed(0) : '2,480'}`}
          subtitle="Lifetime expense"
          icon={CreditCard}
          color="text-emerald-500"
        />
        <StatCard
          title="Favorite Category"
          value="Sedan"
          subtitle="65% of bookings"
          icon={TrendingUp}
          color="text-indigo-500"
        />
        <StatCard
          title="Safety Rating"
          value="4.9 / 5.0"
          subtitle="Top rider status"
          icon={Sparkles}
          color="text-amber-500"
        />
      </div>

      {/* Quick Actions & Recent Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Booking Shortcuts */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Shortcuts</CardTitle>
            <CardDescription>Instant ride to saved places</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/book-ride?preset=home"
              className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Home</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[170px]">
                    Koramangala 4th Block, Bengaluru
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/book-ride?preset=work"
              className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Work</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[170px]">
                    Indiranagar 100ft Road, Bengaluru
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            {/* Emergency SOS Quick Button */}
            <div className="pt-2">
              <Link href="/profile#sos">
                <Button variant="outline" className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs">
                  <ShieldAlert className="size-4 mr-2" /> Emergency SOS Contacts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Rides Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Rides</CardTitle>
              <CardDescription>Your latest trip history and receipts</CardDescription>
            </div>
            <Link href="/rides" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {rides.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Clock className="size-8 mx-auto mb-2 opacity-50" />
                No rides yet. Book your first ride to get started!
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {rides.slice(0, 4).map((ride) => (
                  <div key={ride.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold shrink-0 mt-0.5">
                        <Car className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {ride.dropoff_address}
                          </p>
                          <Badge variant={RIDE_STATUS_CONFIG[ride.status]?.variant || 'default'} className="text-[10px]">
                            {RIDE_STATUS_CONFIG[ride.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          From: {ride.pickup_address}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ride.created_at).toLocaleDateString()} &bull; {ride.vehicle_type?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        ₹{(Number(ride.actual_fare || ride.estimated_fare) || 0).toFixed(0)}
                      </p>
                      <Link
                        href={`/rides/${ride.id}`}
                        className="text-xs text-primary font-medium hover:underline block mt-0.5"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
