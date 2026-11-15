import { VehicleType, RideStatus } from '@/types';

export const VEHICLE_DETAILS: Record<VehicleType, {
  name: string;
  description: string;
  capacity: number;
  iconName: string;
  badge: string;
}> = {
  [VehicleType.BIKE]: {
    name: 'Moto Bike',
    description: 'Fast, pocket-friendly rides for solo trips through traffic',
    capacity: 1,
    iconName: 'Bike',
    badge: 'Quickest',
  },
  [VehicleType.AUTO]: {
    name: 'Auto Rickshaw',
    description: 'Everyday doorstep rides for up to 3 people',
    capacity: 3,
    iconName: 'Zap',
    badge: 'Popular',
  },
  [VehicleType.MINI]: {
    name: 'Mini Comfort',
    description: 'Affordable compact hatchbacks with AC',
    capacity: 4,
    iconName: 'Car',
    badge: 'Economy',
  },
  [VehicleType.SEDAN]: {
    name: 'Prime Sedan',
    description: 'Top-rated spacious sedans with extra legroom & top drivers',
    capacity: 4,
    iconName: 'ShieldCheck',
    badge: 'Premium',
  },
  [VehicleType.SUV]: {
    name: 'Prime SUV',
    description: 'Spacious 6-seater SUVs for family and group getaways',
    capacity: 6,
    iconName: 'Truck',
    badge: 'Large Group',
  },
};

export const RIDE_STATUS_CONFIG: Record<RideStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  description: string;
}> = {
  [RideStatus.REQUESTED]: {
    label: 'Requested',
    variant: 'warning',
    description: 'Waiting for system confirmation',
  },
  [RideStatus.SEARCHING]: {
    label: 'Searching Drivers',
    variant: 'info',
    description: 'Looking for nearby available drivers',
  },
  [RideStatus.ACCEPTED]: {
    label: 'Driver Assigned',
    variant: 'default',
    description: 'Driver confirmed and assigned',
  },
  [RideStatus.DRIVER_ARRIVING]: {
    label: 'Driver Arriving',
    variant: 'info',
    description: 'Driver is on the way to your pickup',
  },
  [RideStatus.ARRIVED]: {
    label: 'Driver Arrived',
    variant: 'warning',
    description: 'Driver has arrived at your location',
  },
  [RideStatus.IN_PROGRESS]: {
    label: 'Trip in Progress',
    variant: 'info',
    description: 'On the way to your destination',
  },
  [RideStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'success',
    description: 'Trip concluded successfully',
  },
  [RideStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'destructive',
    description: 'Trip was cancelled',
  },
};

export const DEFAULT_MAP_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
