import { z } from 'zod';
import { VehicleType, RideStatus } from '../types';

export const createRideSchema = z.object({
  vehicle_type: z.nativeEnum(VehicleType),
  pickup_address: z.string().min(3, 'Pickup address is required'),
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  dropoff_address: z.string().min(3, 'Dropoff address is required'),
  dropoff_lat: z.number().min(-90).max(90),
  dropoff_lng: z.number().min(-180).max(180),
  distance_km: z.number().positive(),
  duration_minutes: z.number().int().positive(),
  stops: z
    .array(
      z.object({
        address: z.string().min(3),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        stop_order: z.number().int().positive(),
      })
    )
    .optional(),
  promo_code: z.string().optional(),
});

export const updateRideStatusSchema = z.object({
  status: z.nativeEnum(RideStatus),
  cancellation_reason: z.string().optional(),
});

export const cancelRideSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

export const rateRideSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
});
