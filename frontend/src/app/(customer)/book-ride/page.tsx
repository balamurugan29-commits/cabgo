'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Navigation,
  Plus,
  Trash2,
  Car,
  Bike,
  Zap,
  ShieldCheck,
  Truck,
  Tag,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/maps/map-view';
import { rideApi, fareApi } from '@/services/api';
import { VehicleType, RideStatus } from '@/types';
import { VEHICLE_DETAILS } from '@/lib/constants';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';

function BookRideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Locations state
  const [pickup, setPickup] = useState({
    address: 'Koramangala 4th Block, Bengaluru',
    lat: 12.9345,
    lng: 77.6265,
  });

  const [dropoff, setDropoff] = useState({
    address: 'Indiranagar 100ft Road, Bengaluru',
    lat: 12.9719,
    lng: 77.6412,
  });

  const [stops, setStops] = useState<Array<{ address: string; lat: number; lng: number }>>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.SEDAN);

  // Estimates state
  const [distanceKm, setDistanceKm] = useState(6.4);
  const [durationMinutes, setDurationMinutes] = useState(22);
  const [fares, setFares] = useState<Record<VehicleType, number>>({
    [VehicleType.BIKE]: 45,
    [VehicleType.AUTO]: 85,
    [VehicleType.MINI]: 140,
    [VehicleType.SEDAN]: 190,
    [VehicleType.SUV]: 260,
  });

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  // Booking states
  const [isBooking, setIsBooking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const preset = searchParams?.get('preset');
    if (preset === 'work') {
      setDropoff({
        address: 'Manyata Tech Park, Nagavara, Bengaluru',
        lat: 13.0494,
        lng: 77.6202,
      });
      setDistanceKm(14.8);
      setDurationMinutes(45);
    }
  }, [searchParams]);

  // Fetch updated fare estimates
  useEffect(() => {
    fareApi
      .estimate(distanceKm, durationMinutes, undefined, appliedPromo?.code)
      .then((res) => {
        if (Array.isArray(res.data)) {
          const map: any = {};
          res.data.forEach((item: any) => {
            map[item.vehicleType] = item.estimatedFare;
          });
          setFares(map);
        }
      })
      .catch(() => {});
  }, [distanceKm, durationMinutes, appliedPromo]);

  // Current Geolocation detection
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      toast.info('Detecting your GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickup({
            address: 'My Current Location (GPS)',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success('Current location detected!');
        },
        () => {
          toast.error('Unable to retrieve location. Please check browser permissions.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleAddStop = () => {
    if (stops.length >= 3) {
      toast.warning('Maximum of 3 stops allowed per ride');
      return;
    }
    setStops([...stops, { address: 'Intermediate Waypoint', lat: 12.9525, lng: 77.6325 }]);
    setDistanceKm((prev) => Math.round((prev + 2.5) * 10) / 10);
    setDurationMinutes((prev) => prev + 10);
  };

  const handleRemoveStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index);
    setStops(updated);
    setDistanceKm((prev) => Math.max(3, Math.round((prev - 2.5) * 10) / 10));
    setDurationMinutes((prev) => Math.max(10, prev - 10));
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'FIRST50') {
      setAppliedPromo({ code: 'FIRST50', discount: 50 });
      toast.success('Promo code FIRST50 applied! ₹50 off');
    } else if (promoCode.toUpperCase() === 'UBERFREE') {
      setAppliedPromo({ code: 'UBERFREE', discount: 40 });
      toast.success('Promo code UBERFREE applied! ₹40 off');
    } else {
      toast.error('Invalid or expired promo code');
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);
      setIsSearching(true);

      const res = await rideApi.create({
        vehicle_type: selectedVehicle,
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        distance_km: distanceKm,
        duration_minutes: durationMinutes,
        stops: stops.map((s, idx) => ({ ...s, stop_order: idx + 1 })),
        promo_code: appliedPromo?.code,
      });

      const newRide = res.data;
      toast.success('Ride requested! Searching for available drivers...');

      const socket = getSocket();
      socket.emit('ride:request', {
        rideId: newRide.id,
        vehicleType: selectedVehicle,
        lat: pickup.lat,
        lng: pickup.lng,
      });

      setTimeout(() => {
        router.push(`/rides/${newRide.id}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to book ride');
      setIsBooking(false);
      setIsSearching(false);
    }
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case VehicleType.BIKE:
        return <Bike className="size-6 text-amber-500" />;
      case VehicleType.AUTO:
        return <Zap className="size-6 text-emerald-500" />;
      case VehicleType.MINI:
        return <Car className="size-6 text-blue-500" />;
      case VehicleType.SEDAN:
        return <ShieldCheck className="size-6 text-indigo-500" />;
      case VehicleType.SUV:
        return <Truck className="size-6 text-purple-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Form & Vehicle Choices */}
      <div className="lg:col-span-5 space-y-5">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Where to?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pickup Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Pickup Location</span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Navigation className="size-3" /> Current Location
                </button>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 size-2.5 rounded-full bg-blue-600" />
                <Input
                  value={pickup.address}
                  onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                  placeholder="Enter pickup address"
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            {/* Intermediate Stops */}
            {stops.map((stop, idx) => (
              <div key={idx} className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Stop #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    className="text-rose-500 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 size-2.5 rounded-full bg-amber-500" />
                  <Input
                    value={stop.address}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[idx].address = e.target.value;
                      setStops(updated);
                    }}
                    placeholder={`Stop #${idx + 1} address`}
                    className="pl-8 text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Destination Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Destination</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 size-2.5 rounded-full bg-emerald-500" />
                <Input
                  value={dropoff.address}
                  onChange={(e) => setDropoff({ ...dropoff, address: e.target.value })}
                  placeholder="Enter destination"
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStop}
              className="w-full text-xs"
            >
              <Plus className="size-3.5 mr-1.5" /> Add Stop Along Route
            </Button>
          </CardContent>
        </Card>

        {/* Vehicle Selection Cards */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Available Categories
          </p>

          <div className="space-y-2">
            {(Object.keys(VEHICLE_DETAILS) as VehicleType[]).map((type) => {
              const details = VEHICLE_DETAILS[type];
              const isSelected = selectedVehicle === type;
              const fare = fares[type] || 150;

              return (
                <div
                  key={type}
                  onClick={() => setSelectedVehicle(type)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                      {getVehicleIcon(type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{details.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {details.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{details.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {durationMinutes} mins away
                        </span>
                        <span>&bull;</span>
                        <span>Capacity: {details.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-foreground">
                      ₹{fare.toFixed(0)}
                    </span>
                    {appliedPromo && (
                      <span className="block text-[10px] text-emerald-600 line-through">
                        ₹{(fare + appliedPromo.discount).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promo Code Box */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code (e.g. FIRST50)"
                className="text-xs uppercase"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleApplyPromo}>
                Apply
              </Button>
            </div>
            {appliedPromo && (
              <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Coupon &quot;{appliedPromo.code}&quot; applied successfully!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Booking CTA Button */}
        <Button
          onClick={handleConfirmBooking}
          disabled={isBooking}
          className="w-full h-12 text-base font-bold shadow-md"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Searching Nearby Drivers...
            </span>
          ) : (
            <span className="flex items-center justify-between w-full">
              <span>Book {VEHICLE_DETAILS[selectedVehicle].name}</span>
              <span>₹{(fares[selectedVehicle] || 190).toFixed(0)} &rarr;</span>
            </span>
          )}
        </Button>
      </div>

      {/* Right Column: Interactive Map Preview */}
      <div className="lg:col-span-7 sticky top-20">
        <Card className="shadow-sm overflow-hidden border-border">
          <CardHeader className="py-3 px-4 border-b border-border/80 flex flex-row items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span className="text-xs font-semibold">Live Route Visualization</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Distance: <strong>{distanceKm} km</strong></span>
              <span>&bull;</span>
              <span>Duration: <strong>~{durationMinutes} mins</strong></span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[550px] w-full">
              <MapView
                pickup={pickup}
                dropoff={dropoff}
                stops={stops}
                driverLocation={{ lat: pickup.lat + 0.005, lng: pickup.lng + 0.005 }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookRidePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
          Loading booking interface...
        </div>
      }
    >
      <BookRideContent />
    </Suspense>
  );
}
