import { supabase, isSupabaseConfigured } from '../config/supabase';
import { VehicleType, FareSetting } from '../types';
import { memoryStore } from '../utils/store';
import { NotFoundError } from '../utils/errors';

export const DEFAULT_FARE_SETTINGS: Record<VehicleType, {
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  cancellation_fee: number;
  surge_multiplier: number;
}> = {
  [VehicleType.BIKE]: { base_fare: 15, per_km_rate: 5, per_minute_rate: 1, minimum_fare: 25, cancellation_fee: 10, surge_multiplier: 1.0 },
  [VehicleType.AUTO]: { base_fare: 25, per_km_rate: 9, per_minute_rate: 1.5, minimum_fare: 30, cancellation_fee: 15, surge_multiplier: 1.0 },
  [VehicleType.MINI]: { base_fare: 40, per_km_rate: 12, per_minute_rate: 2, minimum_fare: 50, cancellation_fee: 25, surge_multiplier: 1.0 },
  [VehicleType.SEDAN]: { base_fare: 60, per_km_rate: 15, per_minute_rate: 2.5, minimum_fare: 80, cancellation_fee: 30, surge_multiplier: 1.0 },
  [VehicleType.SUV]: { base_fare: 80, per_km_rate: 20, per_minute_rate: 3, minimum_fare: 100, cancellation_fee: 40, surge_multiplier: 1.0 },
};

export class FareService {
  async getFareSettings(): Promise<FareSetting[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('fare_settings').select('*');
        if (!error && data && data.length > 0) {
          return data as FareSetting[];
        }
      } catch {
        // Fallback
      }
    }

    return Object.entries(DEFAULT_FARE_SETTINGS).map(([type, setting], idx) => ({
      id: `fare-setting-${idx}`,
      vehicle_type: type as VehicleType,
      ...setting,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  async getSettingForVehicle(type: VehicleType): Promise<any> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('fare_settings')
          .select('*')
          .eq('vehicle_type', type)
          .eq('is_active', true)
          .single();

        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }
    return DEFAULT_FARE_SETTINGS[type] || DEFAULT_FARE_SETTINGS[VehicleType.MINI];
  }

  async calculateFare(
    vehicleType: VehicleType,
    distanceKm: number,
    durationMinutes: number,
    promoCode?: string
  ): Promise<{
    estimatedFare: number;
    breakdown: {
      baseFare: number;
      distanceFare: number;
      timeFare: number;
      subtotal: number;
      surgeMultiplier: number;
      discountAmount: number;
      finalFare: number;
    };
    promoDetails?: { code: string; discount: number };
  }> {
    const setting = await this.getSettingForVehicle(vehicleType);
    const baseFare = Number(setting.base_fare);
    const perKmRate = Number(setting.per_km_rate);
    const perMinuteRate = Number(setting.per_minute_rate);
    const minimumFare = Number(setting.minimum_fare);
    const surgeMultiplier = Number(setting.surge_multiplier || 1.0);

    const distanceFare = distanceKm * perKmRate;
    const timeFare = durationMinutes * perMinuteRate;
    const subtotal = Math.max(minimumFare, baseFare + distanceFare + timeFare);
    const fareWithSurge = subtotal * surgeMultiplier;

    let discountAmount = 0;
    let promoDetails: { code: string; discount: number } | undefined;

    if (promoCode) {
      let promo: any = null;
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode.toUpperCase())
            .eq('is_active', true)
            .single();
          if (!error && data) promo = data;
        } catch {
          // Fallback
        }
      }

      if (!promo) {
        promo = memoryStore.promoCodes.get(promoCode.toUpperCase());
      }

      if (promo) {
        const now = new Date();
        const validFrom = promo.valid_from ? new Date(promo.valid_from) : new Date(0);
        const validUntil = promo.valid_until ? new Date(promo.valid_until) : new Date(Date.now() + 86400000);

        if (now >= validFrom && now <= validUntil && fareWithSurge >= Number(promo.min_ride_amount || 0)) {
          if (promo.discount_type === 'percentage') {
            discountAmount = (fareWithSurge * Number(promo.discount_value)) / 100;
            if (promo.max_discount && discountAmount > Number(promo.max_discount)) {
              discountAmount = Number(promo.max_discount);
            }
          } else {
            discountAmount = Math.min(Number(promo.discount_value), fareWithSurge);
          }
          promoDetails = { code: promo.code, discount: Math.round(discountAmount * 100) / 100 };
        }
      }
    }

    const finalFare = Math.max(minimumFare, Math.round((fareWithSurge - discountAmount) * 100) / 100);

    return {
      estimatedFare: finalFare,
      breakdown: {
        baseFare,
        distanceFare: Math.round(distanceFare * 100) / 100,
        timeFare: Math.round(timeFare * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        surgeMultiplier,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalFare,
      },
      promoDetails,
    };
  }

  async calculateAllEstimates(distanceKm: number, durationMinutes: number, promoCode?: string) {
    const types = [
      VehicleType.BIKE,
      VehicleType.AUTO,
      VehicleType.MINI,
      VehicleType.SEDAN,
      VehicleType.SUV,
    ];

    const results = await Promise.all(
      types.map(async (type) => {
        const fare = await this.calculateFare(type, distanceKm, durationMinutes, promoCode);
        return {
          vehicleType: type,
          estimatedFare: fare.estimatedFare,
          durationMinutes,
          distanceKm,
          discount: fare.breakdown.discountAmount,
          breakdown: fare.breakdown,
          promoDetails: fare.promoDetails,
        };
      })
    );

    return results;
  }
}

export const fareService = new FareService();
