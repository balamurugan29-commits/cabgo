import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  Ride,
  RideStatus,
  VehicleType,
  RideStop,
  DriverEarning,
} from '../types';
import { memoryStore } from '../utils/store';
import { NotFoundError, AppError } from '../utils/errors';
import { fareService } from './fare.service';
import { driverService } from './driver.service';
import { emailService } from './email.service';
import { notificationService } from './notification.service';

const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  [RideStatus.REQUESTED]: [RideStatus.SEARCHING, RideStatus.CANCELLED],
  [RideStatus.SEARCHING]: [RideStatus.ACCEPTED, RideStatus.CANCELLED],
  [RideStatus.ACCEPTED]: [RideStatus.DRIVER_ARRIVING, RideStatus.CANCELLED],
  [RideStatus.DRIVER_ARRIVING]: [RideStatus.ARRIVED, RideStatus.CANCELLED],
  [RideStatus.ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.CANCELLED],
  [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED],
  [RideStatus.COMPLETED]: [],
  [RideStatus.CANCELLED]: [],
};

export class RideService {
  async createRide(
    customerId: string,
    data: {
      vehicle_type: VehicleType;
      pickup_address: string;
      pickup_lat: number;
      pickup_lng: number;
      dropoff_address: string;
      dropoff_lat: number;
      dropoff_lng: number;
      distance_km: number;
      duration_minutes: number;
      stops?: Array<{ address: string; lat: number; lng: number; stop_order: number }>;
      promo_code?: string;
    }
  ): Promise<Ride> {
    const fareCalculation = await fareService.calculateFare(
      data.vehicle_type,
      data.distance_km,
      data.duration_minutes,
      data.promo_code
    );

    const rideId = uuidv4();
    const ride: Ride = {
      id: rideId,
      customer_id: customerId,
      driver_id: null,
      vehicle_id: null,
      status: RideStatus.SEARCHING,
      vehicle_type: data.vehicle_type,
      pickup_address: data.pickup_address,
      pickup_lat: data.pickup_lat,
      pickup_lng: data.pickup_lng,
      dropoff_address: data.dropoff_address,
      dropoff_lat: data.dropoff_lat,
      dropoff_lng: data.dropoff_lng,
      distance_km: data.distance_km,
      duration_minutes: data.duration_minutes,
      estimated_fare: fareCalculation.estimatedFare,
      actual_fare: null,
      promo_code_id: null,
      discount_amount: fareCalculation.breakdown.discountAmount,
      cancellation_reason: null,
      cancelled_by: null,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('rides').insert(ride);
    } catch {
      // fallback
    }

    memoryStore.rides.set(rideId, ride);

    if (data.stops && data.stops.length > 0) {
      const stops: RideStop[] = data.stops.map((s) => ({
        id: uuidv4(),
        ride_id: rideId,
        stop_order: s.stop_order,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        arrived_at: null,
        created_at: new Date().toISOString(),
      }));
      memoryStore.rideStops.set(rideId, stops);
      try {
        await supabase.from('ride_stops').insert(stops);
      } catch {
        // fallback
      }
    }

    // Trigger notification and email
    const customer = memoryStore.users.get(customerId);
    if (customer?.email) {
      emailService.sendRideConfirmation(customer.email, {
        rideId,
        pickup: data.pickup_address,
        dropoff: data.dropoff_address,
        fare: fareCalculation.estimatedFare,
      }).catch(console.error);
    }

    notificationService.create(
      customerId,
      'Ride Requested',
      `Searching for nearby ${data.vehicle_type} drivers...`,
      'ride_update',
      { rideId }
    ).catch(console.error);

    return ride;
  }

  async getRideById(rideId: string): Promise<any> {
    let ride = memoryStore.rides.get(rideId);
    if (!ride) {
      try {
        const { data, error } = await supabase.from('rides').select('*').eq('id', rideId).single();
        if (!error && data) {
          ride = data as Ride;
          memoryStore.rides.set(rideId, ride);
        }
      } catch {
        // fallback
      }
    }

    if (!ride) throw new NotFoundError('Ride not found');

    const customer = memoryStore.users.get(ride.customer_id);
    let driver = null;
    let vehicle = null;

    if (ride.driver_id) {
      const driverProfile = memoryStore.driverProfiles.get(ride.driver_id);
      if (driverProfile) {
        const driverUser = memoryStore.users.get(driverProfile.user_id);
        driver = {
          profile: driverProfile,
          user: driverUser,
        };
      }
    }

    if (ride.vehicle_id) {
      vehicle = memoryStore.vehicles.get(ride.vehicle_id);
    }

    const stops = memoryStore.rideStops.get(rideId) || [];
    const payment = memoryStore.payments.get(rideId);

    return {
      ...ride,
      customer,
      driver,
      vehicle,
      stops,
      payment,
    };
  }

  async assignDriver(rideId: string, driverId: string): Promise<Ride> {
    const ride = memoryStore.rides.get(rideId);
    if (!ride) throw new NotFoundError('Ride not found');

    if (ride.status !== RideStatus.SEARCHING && ride.status !== RideStatus.REQUESTED) {
      throw new AppError('Ride is no longer available', 400);
    }

    const driverProfile = await driverService.getProfileById(driverId);
    const vehicles = await driverService.getVehicles(driverId);
    const vehicle = vehicles.find((v) => v.type === ride.vehicle_type && v.is_active) || vehicles[0];

    const updatedRide: Ride = {
      ...ride,
      driver_id: driverId,
      vehicle_id: vehicle ? vehicle.id : null,
      status: RideStatus.ACCEPTED,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('rides').update(updatedRide).eq('id', rideId);
    } catch {
      // fallback
    }

    memoryStore.rides.set(rideId, updatedRide);

    // Notify Customer
    const driverUser = memoryStore.users.get(driverProfile.user_id);
    notificationService.create(
      ride.customer_id,
      'Driver Assigned!',
      `${driverUser?.first_name || 'Your driver'} is on the way.`,
      'driver_assigned',
      { rideId, driverName: driverUser?.first_name }
    ).catch(console.error);

    return updatedRide;
  }

  async updateRideStatus(rideId: string, nextStatus: RideStatus, reason?: string, cancelledBy?: string): Promise<Ride> {
    const ride = memoryStore.rides.get(rideId);
    if (!ride) throw new NotFoundError('Ride not found');

    const allowed = VALID_TRANSITIONS[ride.status];
    if (!allowed.includes(nextStatus)) {
      throw new AppError(`Cannot transition ride from ${ride.status} to ${nextStatus}`, 400);
    }

    const updates: Partial<Ride> = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    if (nextStatus === RideStatus.IN_PROGRESS) {
      updates.started_at = new Date().toISOString();
    } else if (nextStatus === RideStatus.COMPLETED) {
      updates.completed_at = new Date().toISOString();
      updates.actual_fare = ride.estimated_fare; // Final fare set

      // Calculate driver earnings
      if (ride.driver_id && updates.actual_fare) {
        const gross = Number(updates.actual_fare);
        const commissionRate = 20; // 20% platform commission
        const commissionAmount = Math.round((gross * commissionRate) / 100 * 100) / 100;
        const netAmount = Math.round((gross - commissionAmount) * 100) / 100;

        const earning: DriverEarning = {
          id: uuidv4(),
          driver_id: ride.driver_id,
          ride_id: ride.id,
          gross_amount: gross,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          net_amount: netAmount,
          paid_out: false,
          created_at: new Date().toISOString(),
        };

        const existingEarnings = memoryStore.driverEarnings.get(ride.driver_id) || [];
        existingEarnings.push(earning);
        memoryStore.driverEarnings.set(ride.driver_id, existingEarnings);
      }
    } else if (nextStatus === RideStatus.CANCELLED) {
      updates.cancellation_reason = reason || null;
      updates.cancelled_by = cancelledBy || null;
    }

    const updated = { ...ride, ...updates };
    memoryStore.rides.set(rideId, updated);

    try {
      await supabase.from('rides').update(updates).eq('id', rideId);
    } catch {
      // fallback
    }

    // Send notifications
    notificationService.create(
      ride.customer_id,
      `Ride Status: ${nextStatus.replace('_', ' ').toUpperCase()}`,
      `Your ride is now ${nextStatus.replace('_', ' ')}.`,
      'ride_status',
      { rideId, status: nextStatus }
    ).catch(console.error);

    return updated;
  }

  async getCustomerRides(customerId: string) {
    const list = Array.from(memoryStore.rides.values()).filter((r) => r.customer_id === customerId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  async getDriverRides(driverId: string) {
    const list = Array.from(memoryStore.rides.values()).filter((r) => r.driver_id === driverId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  async getAllRides(status?: RideStatus) {
    let list = Array.from(memoryStore.rides.values());
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }
}

export const rideService = new RideService();
