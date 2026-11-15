import { z } from 'zod';

export const syncUserSchema = z.object({
  clerk_id: z.string().min(1, 'clerk_id is required'),
  email: z.string().email('Invalid email'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().min(5).max(20).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});
