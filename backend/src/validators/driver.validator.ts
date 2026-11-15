import { z } from 'zod';
import { VehicleType, DocumentType } from '../types';

export const registerDriverSchema = z.object({
  vehicle: z.object({
    type: z.nativeEnum(VehicleType),
    make: z.string().min(2),
    model: z.string().min(2),
    year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
    color: z.string().min(2),
    license_plate: z.string().min(4),
  }),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const updateOnlineStatusSchema = z.object({
  is_online: z.boolean(),
});

export const addVehicleSchema = z.object({
  type: z.nativeEnum(VehicleType),
  make: z.string().min(2),
  model: z.string().min(2),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  color: z.string().min(2),
  license_plate: z.string().min(4),
});

export const uploadDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  document_url: z.string().url('Valid document URL is required'),
});
