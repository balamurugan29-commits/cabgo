'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  DollarSign,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Navigation,
  ShieldCheck,
  Power,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { driverApi, rideApi } from '@/services/api';
import { DriverStatus, Ride, RideStatus } from '@/types';
import { RIDE_STATUS_CONFIG } from '@/lib/constants';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';

export default function DriverDashboardPage() {
  const router = useRouter();

  const [driverData, setDriverData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Incoming ride request popup
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);

  // Active accepted trip
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [earnings, setEarnings] = useState({ today: 1250, thisWeek: 7400, thisMonth: 28600, total: 42500 });

  const loadDriverData = async () => {
    try {
      localStorage.setItem('uber_clone_role', 'driver');
      const [profRes, earnRes, ridesRes] = await Promise.all([
        driverApi.getProfile().catch(() => null),
        driverApi.getEarnings().catch(() => null),
        rideApi.getDriverRides().catch(() => ({ data: [] })),
      ]);

      if (profRes?.data) {
        setDriverData(profRes.data);
        setIsOnline(!!profRes.data.profile?.is_online);
      }

      if (earnRes?.data) {
        setEarnings(earnRes.data);
      }

      const active = (ridesRes?.data || []).find((r: Ride) =>
        [RideStatus.ACCEPTED, RideStatus.DRIVER_ARRIVING, RideStatus.ARRIVED, RideStatus.IN_PROGRESS].includes(r.status)
      );
      if (active) setActiveRide(active);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();

    const socket = getSocket();

    // Register driver with socket
    socket.emit('driver:join', { driverId: 'driver-profile-001' });

    // Listen for incoming ride requests from nearby customers
    socket.on('driver:new-ride-request', (data: any) => {
      setIncomingRequest(data);
      toast.info('New ride request received!');
    });

    socket.on('driver:ride-confirmed', (ride: Ride) => {
      setActiveRide(ride);
      setIncomingRequest(null);
      toast.success('Ride confirmed and assigned to you!');
    });

    return () => {
      socket.off('driver:new-ride-request');
      socket.off('driver:ride-confirmed');
    };
  }, []);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    try {
      await driverApi.updateOnlineStatus(nextState);
      setIsOnline(nextState);
      toast.success(`You are now ${nextState ? 'ONLINE and accepting rides' : 'OFFLINE'}`);

      const socket = getSocket();
      socket.emit('driver:toggle-online', { driverId: driverData?.profile?.id || 'driver-profile-001', isOnline: nextState });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update online status. Ensure your documents are approved.');
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      const socket = getSocket();
      socket.emit('ride:accept', {
        rideId,
        driverId: driverData?.profile?.id || 'driver-profile-001',
      });
      const res = await rideApi.accept(rideId);
      setActiveRide(res.data);
      setIncomingRequest(null);
      toast.success('You accepted the ride! Navigate to pickup point.');
    } catch (err: any) {
      toast.error(err.message || 'Ride was already taken or unavailable');
      setIncomingRequest(null);
    }
  };

  const handleRejectRide = () => {
    if (incomingRequest?.id) {
      driverApi.rejectRide(incomingRequest.id).catch(() => {});
    }
    setIncomingRequest(null);
    toast.info('Ride request declined');
  };

  const handleUpdateTripStatus = async (nextStatus: RideStatus) => {
    if (!activeRide) return;
    try {
      const res = await rideApi.updateStatus(activeRide.id, nextStatus);
      setActiveRide(nextStatus === RideStatus.COMPLETED ? null : res.data);

      const socket = getSocket();
      socket.emit('ride:update-status', { rideId: activeRide.id, status: nextStatus });

      toast.success(`Trip status updated: ${nextStatus.replace('_', ' ').toUpperCase()}`);
      if (nextStatus === RideStatus.COMPLETED) {
        loadDriverData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update trip status');
    }
  };

  const isPendingApproval = driverData?.profile?.status === DriverStatus.PENDING;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Driver Portal - Hello, ${driverData?.user?.first_name || 'Driver'} 👋`}
        description="Monitor active ride dispatches, route navigation, and track your daily fares"
      >
        {/* Prominent Online/Offline Toggle Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggleOnline}
            disabled={isPendingApproval}
            variant={isOnline ? 'default' : 'outline'}
            className={`font-bold transition-all shadow-sm ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'border-muted-foreground/30'
            }`}
          >
            <Power className="size-4 mr-2" />
            {isOnline ? 'Online (Accepting Trips)' : 'Offline (Go Online)'}
          </Button>
        </div>
      </PageHeader>

      {/* Verification Notice if not approved yet */}
      {isPendingApproval && (
        <Card className="border-amber-200 bg-amber-500/10 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <strong className="text-amber-800 dark:text-amber-300">Account Pending Admin Approval</strong>
              <p className="text-muted-foreground mt-0.5">
                Our team is reviewing your vehicle registration and license. Once approved, you can switch your status to <strong>Online</strong> and receive dispatches.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Ride Request Alert Card (Real-Time) */}
      {incomingRequest && (
        <Card className="border-2 border-primary bg-primary/5 animate-pulse shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="text-xs bg-primary">
                New Ride Request!
              </Badge>
              <span className="text-xs font-semibold text-emerald-600">
                Fare: ₹{incomingRequest.ride?.estimated_fare || 190}
              </span>
            </div>
            <CardTitle className="text-base mt-2">
              Trip to {incomingRequest.ride?.dropoff_address || 'Destination'}
            </CardTitle>
            <CardDescription>
              Pickup: {incomingRequest.ride?.pickup_address || 'Pickup Point'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <span>Distance: <strong>{incomingRequest.ride?.distance_km || 6.4} km</strong></span>
              <span>&bull;</span>
              <span>Duration: <strong>~{incomingRequest.ride?.duration_minutes || 20} mins</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleAcceptRide(incomingRequest.ride?.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <CheckCircle2 className="size-4 mr-2" /> Accept Ride
              </Button>
              <Button
                onClick={handleRejectRide}
                variant="outline"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <XCircle className="size-4 mr-2" /> Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Trip Workflow Controller */}
      {activeRide && (
        <Card className="border-2 border-blue-500 bg-card shadow-md">
          <CardHeader className="pb-3 border-b border-border bg-blue-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-blue-600 animate-ping" />
                <CardTitle className="text-base">Current Active Dispatch</CardTitle>
              </div>
              <Badge variant={RIDE_STATUS_CONFIG[activeRide.status]?.variant || 'default'}>
                {RIDE_STATUS_CONFIG[activeRide.status]?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px]">Pickup Location</p>
                <p className="font-medium text-foreground mt-0.5">{activeRide.pickup_address}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px]">Destination</p>
                <p className="font-medium text-foreground mt-0.5">{activeRide.dropoff_address}</p>
              </div>
            </div>

            {/* Step Controls for Driver */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              {activeRide.status === RideStatus.ACCEPTED && (
                <Button
                  onClick={() => handleUpdateTripStatus(RideStatus.DRIVER_ARRIVING)}
                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  <Navigation className="size-3.5 mr-1.5" /> Start Driving to Pickup
                </Button>
              )}

              {activeRide.status === RideStatus.DRIVER_ARRIVING && (
                <Button
                  onClick={() => handleUpdateTripStatus(RideStatus.ARRIVED)}
                  className="bg-amber-600 hover:bg-amber-700 text-xs"
                >
                  <MapPin className="size-3.5 mr-1.5" /> I Have Arrived at Pickup
                </Button>
              )}

              {activeRide.status === RideStatus.ARRIVED && (
                <Button
                  onClick={() => handleUpdateTripStatus(RideStatus.IN_PROGRESS)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  <Car className="size-3.5 mr-1.5" /> Passenger Boarded &bull; Start Trip
                </Button>
              )}

              {activeRide.status === RideStatus.IN_PROGRESS && (
                <Button
                  onClick={() => handleUpdateTripStatus(RideStatus.COMPLETED)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-xs font-bold"
                >
                  <CheckCircle2 className="size-3.5 mr-1.5" /> Complete Trip & Generate Bill
                </Button>
              )}

              <Link href={`/rides/${activeRide.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  Open Route Map <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Earnings & Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Earnings"
          value={`₹${earnings.today}`}
          subtitle="Net after commission"
          icon={DollarSign}
          color="text-emerald-500"
          trend={{ value: '+14% vs yesterday', isPositive: true }}
        />
        <StatCard
          title="This Week"
          value={`₹${earnings.thisWeek}`}
          subtitle="Mon - Sun total"
          icon={TrendingUp}
          color="text-blue-500"
        />
        <StatCard
          title="Driver Rating"
          value={`${driverData?.profile?.average_rating || 4.88} / 5`}
          subtitle="Based on 142 reviews"
          icon={Star}
          color="text-amber-500"
        />
        <StatCard
          title="Completed Trips"
          value={driverData?.profile?.total_rides || 142}
          subtitle="98% Acceptance Rate"
          icon={Car}
          color="text-indigo-500"
        />
      </div>

      {/* Navigation Shortcuts for Drivers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/driver/earnings" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Earnings & Payouts</p>
                <p className="text-xs text-muted-foreground">View breakdown & history</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/vehicles" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <Car className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Vehicle Details</p>
                <p className="text-xs text-muted-foreground">Manage registration & model</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/documents" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Driver Documents</p>
                <p className="text-xs text-muted-foreground">License, RC, & Insurance</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
