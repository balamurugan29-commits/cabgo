import { apiClient } from '@/lib/api';
import {
  User,
  CustomerProfile,
  DriverProfile,
  Vehicle,
  DriverDocument,
  Ride,
  Payment,
  FareSetting,
  PromoCode,
  Notification,
  SupportTicket,
  EmergencyContact,
  VehicleType,
  RideStatus,
  DriverStatus,
} from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const authApi = {
  sync: (data: any) => apiClient.post<any, ApiResponse<User>>('/auth/sync', data),
  getMe: () => apiClient.get<any, ApiResponse<User>>('/auth/me'),
  updateProfile: (data: any) => apiClient.put<any, ApiResponse<User>>('/auth/profile', data),
};

export const customerApi = {
  getProfile: () => apiClient.get<any, ApiResponse<{ user: User; profile: CustomerProfile }>>('/customer/profile'),
  updateProfile: (data: Partial<CustomerProfile>) => apiClient.put<any, ApiResponse<CustomerProfile>>('/customer/profile', data),
  addSavedAddress: (address: { label: string; address: string; lat: number; lng: number }) =>
    apiClient.post<any, ApiResponse<CustomerProfile>>('/customer/saved-addresses', address),
  getEmergencyContacts: () => apiClient.get<any, ApiResponse<EmergencyContact[]>>('/customer/emergency-contacts'),
  addEmergencyContact: (data: { name: string; phone: string; relationship?: string }) =>
    apiClient.post<any, ApiResponse<EmergencyContact>>('/customer/emergency-contacts', data),
  deleteEmergencyContact: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/customer/emergency-contacts/${id}`),
};

export const driverApi = {
  register: (data: any) => apiClient.post<any, ApiResponse<{ profile: DriverProfile; vehicle: Vehicle }>>('/driver/register', data),
  getProfile: () => apiClient.get<any, ApiResponse<{ user: User; profile: DriverProfile; vehicles: Vehicle[]; documents: DriverDocument[] }>>('/driver/profile'),
  updateOnlineStatus: (is_online: boolean) => apiClient.put<any, ApiResponse<DriverProfile>>('/driver/online-status', { is_online }),
  updateLocation: (lat: number, lng: number) => apiClient.put<any, ApiResponse<DriverProfile>>('/driver/location', { lat, lng }),
  addVehicle: (data: any) => apiClient.post<any, ApiResponse<Vehicle>>('/driver/vehicles', data),
  addDocument: (data: any) => apiClient.post<any, ApiResponse<DriverDocument>>('/driver/documents', data),
  getEarnings: () => apiClient.get<any, ApiResponse<{ today: number; thisWeek: number; thisMonth: number; total: number; recentEarnings: any[] }>>('/driver/earnings'),
  getActiveRide: () => apiClient.get<any, ApiResponse<any>>('/driver/active-ride'),
  rejectRide: (ride_id: string) => apiClient.post<any, ApiResponse<{ rejected: boolean }>>('/driver/reject-ride', { ride_id }),
  getNearby: (lat: number, lng: number, vehicleType?: VehicleType) =>
    apiClient.get<any, ApiResponse<any[]>>(`/driver/nearby?lat=${lat}&lng=${lng}${vehicleType ? `&vehicle_type=${vehicleType}` : ''}`),
};

export const rideApi = {
  create: (data: {
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
  }) => apiClient.post<any, ApiResponse<Ride>>('/rides', data),
  getById: (id: string) => apiClient.get<any, ApiResponse<Ride>>(`/rides/${id}`),
  getCustomerRides: () => apiClient.get<any, ApiResponse<Ride[]>>('/rides/customer'),
  getDriverRides: () => apiClient.get<any, ApiResponse<Ride[]>>('/rides/driver'),
  accept: (id: string) => apiClient.post<any, ApiResponse<Ride>>(`/rides/${id}/accept`),
  updateStatus: (id: string, status: RideStatus, cancellation_reason?: string) =>
    apiClient.put<any, ApiResponse<Ride>>(`/rides/${id}/status`, { status, cancellation_reason }),
  cancel: (id: string, reason: string) => apiClient.post<any, ApiResponse<Ride>>(`/rides/${id}/cancel`, { reason }),
  rate: (id: string, rating: number, review?: string) => apiClient.post<any, ApiResponse<any>>(`/rides/${id}/rate`, { rating, review }),
};

export const fareApi = {
  getSettings: () => apiClient.get<any, ApiResponse<FareSetting[]>>('/fares/settings'),
  estimate: (distance_km: number, duration_minutes: number, vehicle_type?: VehicleType, promo_code?: string) => {
    let url = `/fares/estimate?distance_km=${distance_km}&duration_minutes=${duration_minutes}`;
    if (vehicle_type) url += `&vehicle_type=${vehicle_type}`;
    if (promo_code) url += `&promo_code=${promo_code}`;
    return apiClient.get<any, ApiResponse<any>>(url);
  },
};

export const paymentApi = {
  createIntent: (ride_id: string) => apiClient.post<any, ApiResponse<{ paymentId: string; clientSecret: string; amount: number; currency: string }>>('/payments/create-intent', { ride_id }),
  confirm: (payment_intent_id: string, payment_method?: string) =>
    apiClient.post<any, ApiResponse<Payment>>('/payments/confirm', { payment_intent_id, payment_method }),
  refund: (id: string, reason: string, amount?: number) => apiClient.post<any, ApiResponse<Payment>>(`/payments/${id}/refund`, { reason, amount }),
  getHistory: () => apiClient.get<any, ApiResponse<Payment[]>>('/payments/history'),
};

export const notificationApi = {
  getAll: () => apiClient.get<any, ApiResponse<Notification[]>>('/notifications'),
  getUnreadCount: () => apiClient.get<any, ApiResponse<{ unreadCount: number }>>('/notifications/unread-count'),
  markRead: (id: string) => apiClient.put<any, ApiResponse<null>>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put<any, ApiResponse<null>>('/notifications/mark-all-read'),
};

export const supportApi = {
  createTicket: (data: { subject: string; description: string; ride_id?: string; priority?: string }) =>
    apiClient.post<any, ApiResponse<SupportTicket>>('/support', data),
  getUserTickets: () => apiClient.get<any, ApiResponse<SupportTicket[]>>('/support'),
  getAllTickets: (status?: string) => apiClient.get<any, ApiResponse<SupportTicket[]>>(`/support/all${status ? `?status=${status}` : ''}`),
  updateTicket: (id: string, data: any) => apiClient.put<any, ApiResponse<SupportTicket>>(`/support/${id}`, data),
};

export const adminApi = {
  getStats: () => apiClient.get<any, ApiResponse<any>>('/admin/stats'),
  getCustomers: () => apiClient.get<any, ApiResponse<any[]>>('/admin/customers'),
  getDrivers: (status?: DriverStatus) => apiClient.get<any, ApiResponse<any[]>>(`/admin/drivers${status ? `?status=${status}` : ''}`),
  approveDriver: (id: string) => apiClient.put<any, ApiResponse<DriverProfile>>(`/admin/drivers/${id}/approve`),
  rejectDriver: (id: string, reason: string) => apiClient.put<any, ApiResponse<DriverProfile>>(`/admin/drivers/${id}/reject`, { reason }),
  suspendUser: (id: string, is_suspended: boolean) => apiClient.put<any, ApiResponse<User>>(`/admin/users/${id}/suspend`, { is_suspended }),
  getAuditLogs: () => apiClient.get<any, ApiResponse<any[]>>('/admin/audit-logs'),
  getRides: (status?: RideStatus) => apiClient.get<any, ApiResponse<Ride[]>>(`/admin/rides${status ? `?status=${status}` : ''}`),
  getPayments: () => apiClient.get<any, ApiResponse<Payment[]>>('/admin/payments'),
  getPromoCodes: () => apiClient.get<any, ApiResponse<PromoCode[]>>('/admin/promo-codes'),
  createPromoCode: (data: any) => apiClient.post<any, ApiResponse<PromoCode>>('/admin/promo-codes', data),
  updatePromoStatus: (code: string, is_active: boolean) => apiClient.put<any, ApiResponse<PromoCode>>(`/admin/promo-codes/${code}/status`, { is_active }),
  updateFareSetting: (vehicleType: VehicleType, data: any) => apiClient.put<any, ApiResponse<FareSetting>>(`/admin/fare-settings/${vehicleType}`, data),
};

export const locationApi = {
  search: (q: string) => apiClient.get<any, ApiResponse<Array<{ display_name: string; lat: number; lng: number }>>>(`/location/search?q=${encodeURIComponent(q)}`),
  reverse: (lat: number, lng: number) => apiClient.get<any, ApiResponse<{ address: string; lat: number; lng: number }>>(`/location/reverse?lat=${lat}&lng=${lng}`),
};

export const uploadApi = {
  upload: (data: { file_base64: string; filename?: string; file_type?: string }) =>
    apiClient.post<any, ApiResponse<{ url: string; filename: string; size: number }>>('/upload', data),
};
