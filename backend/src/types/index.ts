// ============================================
// Enums
// ============================================
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

// ============================================
// Database Row Types
// ============================================
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
  saved_addresses: SavedAddress[];
  preferred_payment_method: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedAddress {
  label: string;
  address: string;
  lat: number;
  lng: number;
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
  type: VehicleType | null;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
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

export interface RideLocation {
  id: string;
  ride_id: string;
  lat: number;
  lng: number;
  recorded_at: string;
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

export interface DriverEarning {
  id: string;
  driver_id: string;
  ride_id: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  paid_out: boolean;
  created_at: string;
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

export interface Rating {
  id: string;
  ride_id: string;
  rated_by: string;
  rated_user: string;
  rating: number;
  created_at: string;
}

export interface Review {
  id: string;
  ride_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
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

export interface AdminUser {
  id: string;
  user_id: string;
  permissions: Record<string, boolean>;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// API Request Types
// ============================================
export interface SyncUserRequest {
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface CreateRideRequest {
  vehicle_type: VehicleType;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  distance_km: number;
  duration_minutes: number;
  promo_code?: string;
  stops?: Array<{
    address: string;
    lat: number;
    lng: number;
    stop_order: number;
  }>;
}

export interface UpdateRideStatusRequest {
  status: RideStatus;
}

export interface CancelRideRequest {
  reason: string;
}

export interface DriverRegistrationRequest {
  vehicle_type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
}

export interface AddVehicleRequest {
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
}

export interface UpdateLocationRequest {
  lat: number;
  lng: number;
}

export interface AddDocumentRequest {
  type: DocumentType;
  document_url: string;
}

export interface CreatePaymentIntentRequest {
  ride_id: string;
}

export interface RefundRequest {
  payment_id: string;
  reason: string;
}

export interface CreateTicketRequest {
  ride_id?: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export interface AddEmergencyContactRequest {
  name: string;
  phone: string;
  relationship?: string;
}

export interface CreatePromoCodeRequest {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount?: number;
  min_ride_amount?: number;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateFareSettingRequest {
  base_fare?: number;
  per_km_rate?: number;
  per_minute_rate?: number;
  minimum_fare?: number;
  cancellation_fee?: number;
  surge_multiplier?: number;
  is_active?: boolean;
}

export interface DriverApprovalRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  completedRides: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeRides: number;
  onlineDrivers: number;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalCommission: number;
  totalRides: number;
  averageFare: number;
  byVehicleType: Array<{
    vehicle_type: VehicleType;
    revenue: number;
    rides: number;
  }>;
}

// ============================================
// Socket Event Types
// ============================================
export interface SocketUser {
  userId: string;
  clerkId: string;
  role: UserRole;
}

export interface RideRequestEvent {
  rideId: string;
  customerId: string;
  vehicleType: VehicleType;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedFare: number;
}

export interface RideStatusUpdateEvent {
  rideId: string;
  status: RideStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  currentLat?: number;
  currentLng?: number;
}

export interface DriverLocationEvent {
  driverId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface LocationSearchResult {
  display_name: string;
  lat: number;
  lng: number;
  place_id?: string | number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      dbUser?: User;
    }
  }
}
