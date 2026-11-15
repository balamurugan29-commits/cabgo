import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { supabase } from '../config/supabase';
import { UserRole } from '../types';
import { AuthorizationError, AppError } from '../utils/errors';
import { memoryStore } from '../utils/store';

/**
 * Initialize Clerk middleware for JWT verification.
 */
export const clerkAuth = clerkMiddleware();

/**
 * Requires a valid Clerk JWT or dev simulation header. Attaches userId (clerkId) to req.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  // Allow Clerk auth first
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.userId = auth.userId;
      return next();
    }
  } catch {
    // Clerk middleware may not be active or request without bearer
  }

  // Developer / Demo fallback header
  const devUserId = req.headers['x-user-id'] || req.headers['x-clerk-id'];
  if (devUserId && typeof devUserId === 'string') {
    req.userId = devUserId;
    return next();
  }

  // If in development mode and no auth passed, default to first customer for smooth UI testing
  if (process.env.NODE_ENV !== 'production') {
    const devRole = req.headers['x-role'];
    if (devRole === 'admin') {
      req.userId = 'clerk_admin_001';
    } else if (devRole === 'driver') {
      req.userId = 'clerk_driver_001';
    } else {
      req.userId = 'clerk_customer_001';
    }
    return next();
  }

  throw new AppError('Authentication required', 401);
}

/**
 * Requires the authenticated user to have a specific role.
 */
export function requireRole(...roles: UserRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const clerkId = req.userId;
      if (!clerkId) {
        throw new AppError('Authentication required', 401);
      }

      let user = null;
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', clerkId)
          .single();
        user = data;
      } catch {
        // fallback
      }

      if (!user) {
        user = Array.from(memoryStore.users.values()).find((u) => u.clerk_id === clerkId);
      }

      if (!user) {
        if (roles.includes(UserRole.ADMIN) && clerkId === 'clerk_admin_001') return next();
        if (roles.includes(UserRole.DRIVER) && clerkId === 'clerk_driver_001') return next();
        if (roles.includes(UserRole.CUSTOMER)) return next();
        throw new AppError('User not found in database', 404);
      }

      if (!roles.includes(user.role as UserRole)) {
        throw new AuthorizationError(`Requires one of roles: ${roles.join(', ')}`);
      }

      req.dbUser = user;
      req.userRole = user.role as UserRole;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Requires the authenticated user to be an admin.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.ADMIN)(req, res, next);
}
