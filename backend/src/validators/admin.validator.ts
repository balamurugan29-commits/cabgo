import { z } from 'zod';
import { VehicleType, DriverStatus } from '../types';

export const updateDriverStatusSchema = z.object({
  status: z.nativeEnum(DriverStatus),
  rejection_reason: z.string().optional(),
});

export const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  max_discount: z.number().positive().optional(),
  min_ride_amount: z.number().nonnegative().default(0),
  max_uses: z.number().int().positive().optional(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime(),
});

export const updateFareSettingSchema = z.object({
  vehicle_type: z.nativeEnum(VehicleType),
  base_fare: z.number().nonnegative(),
  per_km_rate: z.number().nonnegative(),
  per_minute_rate: z.number().nonnegative(),
  minimum_fare: z.number().nonnegative(),
  cancellation_fee: z.number().nonnegative(),
  surge_multiplier: z.number().min(1.0).max(5.0).default(1.0),
});
