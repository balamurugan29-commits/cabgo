import { v4 as uuidv4 } from 'uuid';
import {
  User,
  CustomerProfile,
  DriverProfile,
  Vehicle,
  DriverDocument,
  Ride,
  RideStop,
  RideLocation,
  Payment,
  DriverEarning,
  Rating,
  Review,
  PromoCode,
  Notification,
  SupportTicket,
  EmergencyContact,
  UserRole,
  DriverStatus,
  RideStatus,
  VehicleType,
  PaymentStatus,
  DocumentStatus,
  DocumentType,
  TicketStatus,
  TicketPriority,
} from '../types';

/**
 * In-memory state store providing active state management and data persistence
 * across requests when Supabase is running with mock/local credentials.
 */
class MemoryStore {
  users: Map<string, User> = new Map();
  customerProfiles: Map<string, CustomerProfile> = new Map();
  driverProfiles: Map<string, DriverProfile> = new Map();
  vehicles: Map<string, Vehicle> = new Map();
  documents: Map<string, DriverDocument> = new Map();
  rides: Map<string, Ride> = new Map();
  rideStops: Map<string, RideStop[]> = new Map();
  rideLocations: Map<string, RideLocation[]> = new Map();
  payments: Map<string, Payment> = new Map();
  driverEarnings: Map<string, DriverEarning[]> = new Map();
  ratings: Map<string, Rating[]> = new Map();
  reviews: Map<string, Review[]> = new Map();
  promoCodes: Map<string, PromoCode> = new Map();
  notifications: Map<string, Notification[]> = new Map();
  supportTickets: Map<string, SupportTicket> = new Map();
  emergencyContacts: Map<string, EmergencyContact[]> = new Map();
  auditLogs: Map<string, any> = new Map();
  rejectedRideOffers: Map<string, Set<string>> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Default admin user
    const adminUser: User = {
      id: 'admin-user-001',
      clerk_id: 'clerk_admin_001',
      email: 'admin@uberclone.com',
      first_name: 'Super',
      last_name: 'Admin',
      phone: '+919876543210',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: UserRole.ADMIN,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);

    // Default Customer
    const customerUser: User = {
      id: 'customer-user-001',
      clerk_id: 'clerk_customer_001',
      email: 'customer@uberclone.com',
      first_name: 'Alex',
      last_name: 'Morgan',
      phone: '+919876543211',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: UserRole.CUSTOMER,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(customerUser.id, customerUser);
    this.customerProfiles.set(customerUser.id, {
      id: uuidv4(),
      user_id: customerUser.id,
      saved_addresses: [
        { label: 'Home', address: 'Koramangala 4th Block, Bengaluru', lat: 12.9345, lng: 77.6265 },
        { label: 'Work', address: 'Indiranagar 100ft Road, Bengaluru', lat: 12.9719, lng: 77.6412 },
      ],
      preferred_payment_method: 'stripe_card',
      stripe_customer_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Default Driver
    const driverUser: User = {
      id: 'driver-user-001',
      clerk_id: 'clerk_driver_001',
      email: 'driver@uberclone.com',
      first_name: 'Rajesh',
      last_name: 'Kumar',
      phone: '+919876543212',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: UserRole.DRIVER,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(driverUser.id, driverUser);

    const driverProfile: DriverProfile = {
      id: 'driver-profile-001',
      user_id: driverUser.id,
      status: DriverStatus.APPROVED,
      is_online: true,
      current_lat: 12.9352,
      current_lng: 77.6245,
      total_rides: 142,
      average_rating: 4.88,
      stripe_account_id: null,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.driverProfiles.set(driverProfile.id, driverProfile);

    const driverVehicle: Vehicle = {
      id: 'vehicle-001',
      driver_id: driverProfile.id,
      type: VehicleType.SEDAN,
      make: 'Honda',
      model: 'City',
      year: 2022,
      color: 'White',
      license_plate: 'KA 01 MJ 5566',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.vehicles.set(driverVehicle.id, driverVehicle);

    // Promo codes
    const promo1: PromoCode = {
      id: uuidv4(),
      code: 'FIRST50',
      description: '50% off on your first ride up to ₹100',
      discount_type: 'percentage',
      discount_value: 50,
      max_discount: 100,
      min_ride_amount: 100,
      max_uses: 1000,
      used_count: 32,
      valid_from: new Date(Date.now() - 7 * 86400000).toISOString(),
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const promo2: PromoCode = {
      id: uuidv4(),
      code: 'UBERFREE',
      description: 'Flat ₹50 off on Sedan or SUV',
      discount_type: 'fixed',
      discount_value: 50,
      max_discount: null,
      min_ride_amount: 150,
      max_uses: 500,
      used_count: 89,
      valid_from: new Date(Date.now() - 7 * 86400000).toISOString(),
      valid_until: new Date(Date.now() + 60 * 86400000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.promoCodes.set(promo1.code, promo1);
    this.promoCodes.set(promo2.code, promo2);
  }
}

export const memoryStore = new MemoryStore();
