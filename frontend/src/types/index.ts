export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum DriverStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum VehicleType {
  BIKE = 'bike',
  AUTO = 'auto',
  MINI = 'mini',
  SEDAN = 'sedan',
  SUV = 'suv',
}

export enum DocumentType {
  DRIVING_LICENSE = 'driving_license',
  VEHICLE_REGISTRATION = 'vehicle_registration',
  INSURANCE = 'insurance',
  IDENTITY_PROOF = 'identity_proof',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum RideStatus {
  REQUESTED = 'requested',
  SEARCHING = 'searching',
  ACCEPTED = 'accepted',
  DRIVER_ARRIVING = 'driver_arriving',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  saved_addresses: Array<{ label: string; address: string; lat: number; lng: number }>;
  preferred_payment_method: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  status: DriverStatus;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  total_rides: number;
  average_rating: number;
  stripe_account_id: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  type: DocumentType;
  document_url: string;
  status: DocumentStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  customer_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: RideStatus;
  vehicle_type: VehicleType;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  distance_km: number | null;
  duration_minutes: number | null;
  estimated_fare: number | null;
  actual_fare: number | null;
  promo_code_id: string | null;
  discount_amount: number;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  driver?: {
    profile: DriverProfile;
    user: User;
  };
  vehicle?: Vehicle;
  stops?: RideStop[];
  payment?: Payment;
}

export interface RideStop {
  id: string;
  ride_id: string;
  stop_order: number;
  address: string;
  lat: number;
  lng: number;
  arrived_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  ride_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_client_secret: string | null;
  payment_method: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FareSetting {
  id: string;
  vehicle_type: VehicleType;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  cancellation_fee: number;
  surge_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount: number | null;
  min_ride_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  ride_id: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  created_at: string;
}
