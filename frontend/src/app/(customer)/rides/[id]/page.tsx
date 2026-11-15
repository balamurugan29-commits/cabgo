'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  MapPin,
  Clock,
  Phone,
  ShieldAlert,
  Star,
  CheckCircle2,
  XCircle,
  CreditCard,
  Download,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/maps/map-view';
import { rideApi, paymentApi } from '@/services/api';
import { Ride, RideStatus } from '@/types';
import { RIDE_STATUS_CONFIG } from '@/lib/constants';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';

function RideDetailContent({ rideId }: { rideId: string }) {
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Rating & Payment states
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Fetch ride details
  const fetchRide = () => {
    rideApi
      .getById(rideId)
      .then((res) => {
        setRide(res.data);
        if (res.data.driver?.profile?.current_lat && res.data.driver?.profile?.current_lng) {
          setDriverLocation({
            lat: Number(res.data.driver.profile.current_lat),
            lng: Number(res.data.driver.profile.current_lng),
          });
        }
      })
      .catch((err) => {
        toast.error('Failed to load ride details');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRide();

    // Socket.IO real-time tracking
    const socket = getSocket();
    socket.emit('ride:join', { rideId });

    socket.on('ride:driver-location', (data: { lat: number; lng: number }) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    socket.on('ride:status-updated', (updatedRide: Ride) => {
      setRide(updatedRide);
      toast.info(`Ride status updated: ${updatedRide.status.replace('_', ' ').toUpperCase()}`);
    });

    socket.on('ride:accepted', (acceptedRide: Ride) => {
      setRide(acceptedRide);
      toast.success('A driver has accepted your ride!');
    });

    socket.on('ride:cancelled', (cancelledRide: Ride) => {
      setRide(cancelledRide);
      toast.error('This ride has been cancelled.');
    });

    return () => {
      socket.emit('ride:leave', { rideId });
      socket.off('ride:driver-location');
      socket.off('ride:status-updated');
      socket.off('ride:accepted');
      socket.off('ride:cancelled');
    };
  }, [rideId]);

  const handleCancelRide = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await rideApi.cancel(rideId, 'Cancelled by passenger');
      toast.success('Ride cancelled');
      fetchRide();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel ride');
    }
  };

  const handlePayNow = async () => {
    try {
      setIsPaying(true);
      const intentRes = await paymentApi.createIntent(rideId);
      const confirmRes = await paymentApi.confirm(intentRes.data.clientSecret, 'stripe_card');
      toast.success('Payment completed successfully!');
      fetchRide();
    } catch (err: any) {
      toast.error(err.message || 'Payment processing failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      setIsSubmittingRating(true);
      await rideApi.rate(rideId, rating, review);
      toast.success('Thank you for rating your driver!');
      setHasRated(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
        Loading ride information...
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-lg font-bold">Ride Not Found</h3>
        <Link href="/dashboard" className="text-primary text-sm hover:underline mt-2 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = ride.status === RideStatus.COMPLETED;
  const isCancelled = ride.status === RideStatus.CANCELLED;
  const isPaid = ride.payment?.status === 'completed';

  const steps = [
    { key: RideStatus.REQUESTED, label: 'Booked' },
    { key: RideStatus.ACCEPTED, label: 'Driver Assigned' },
    { key: RideStatus.DRIVER_ARRIVING, label: 'Driver En Route' },
    { key: RideStatus.ARRIVED, label: 'Arrived at Pickup' },
    { key: RideStatus.IN_PROGRESS, label: 'Trip in Progress' },
    { key: RideStatus.COMPLETED, label: 'Arrived at Destination' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === ride.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/rides"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back to My Rides
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant={RIDE_STATUS_CONFIG[ride.status]?.variant || 'default'} className="text-xs px-2.5 py-1">
            {RIDE_STATUS_CONFIG[ride.status]?.label}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">ID: #{ride.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Stepper */}
      {!isCancelled && (
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx || isCompleted;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                        isPassed
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[11px] font-medium ${isPassed ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Live Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Panel */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
              <span className="text-xs font-semibold">Live Ride Tracking</span>
              <span className="text-[11px] text-muted-foreground">
                {driverLocation ? '📍 Live GPS streaming active' : 'Connecting to vehicle GPS...'}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[460px] w-full">
                <MapView
                  pickup={{ lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng), address: ride.pickup_address }}
                  dropoff={{ lat: Number(ride.dropoff_lat), lng: Number(ride.dropoff_lng), address: ride.dropoff_address }}
                  driverLocation={driverLocation || undefined}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Driver & Vehicle Card */}
          {ride.driver && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assigned Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-foreground">
                      👨‍✈️
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {ride.driver.user?.first_name || 'Driver'} {ride.driver.user?.last_name || ''}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                        <Star className="size-3.5 fill-current" />
                        <span>{ride.driver.profile.average_rating || 4.9}</span>
                        <span className="text-muted-foreground">({ride.driver.profile.total_rides || 140} trips)</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${ride.driver.user?.phone || '+919876543210'}`}
                    className="size-10 rounded-full border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-primary"
                  >
                    <Phone className="size-4" />
                  </a>
                </div>

                {ride.vehicle && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {ride.vehicle.type?.toUpperCase()} &bull; Year {ride.vehicle.year}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs font-bold border-foreground/30">
                      {ride.vehicle.license_plate}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Route & Trip Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Pickup</p>
                  <p className="text-xs font-medium text-foreground">{ride.pickup_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Destination</p>
                  <p className="text-xs font-medium text-foreground">{ride.dropoff_address}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
                <span>Distance: <strong>{ride.distance_km || 6.4} km</strong></span>
                <span>Duration: <strong>~{ride.duration_minutes || 22} mins</strong></span>
                <span className="text-sm font-bold text-foreground">
                  ₹{(Number(ride.actual_fare || ride.estimated_fare) || 0).toFixed(0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section (upon completion) */}
          {isCompleted && (
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    <span className="font-semibold text-sm">
                      {isPaid ? 'Payment Confirmed' : 'Trip Completed - Payment Due'}
                    </span>
                  </div>
                  <span className="font-bold text-base">
                    ₹{(Number(ride.actual_fare || ride.estimated_fare) || 0).toFixed(0)}
                  </span>
                </div>

                {!isPaid ? (
                  <Button onClick={handlePayNow} disabled={isPaying} className="w-full">
                    <CreditCard className="size-4 mr-2" /> Pay with Stripe / Card
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadReceipt} className="w-full text-xs">
                      <Download className="size-3.5 mr-1.5" /> Download Ride Receipt
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rating Section */}
          {isCompleted && !hasRated && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rate Your Driver</CardTitle>
                <CardDescription>How was your ride experience?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`size-6 ${
                          star <= rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Leave a comment for the driver (optional)..."
                  className="w-full text-xs rounded-lg border border-border bg-transparent p-2.5 outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                />

                <Button
                  size="sm"
                  onClick={handleSubmitRating}
                  disabled={isSubmittingRating}
                  className="w-full text-xs"
                >
                  Submit Rating
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cancel Option */}
          {!isCompleted && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelRide}
              className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              Cancel Ride
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
          Loading ride telemetry...
        </div>
      }
    >
      <RideDetailContent rideId={resolvedParams.id} />
    </Suspense>
  );
}
