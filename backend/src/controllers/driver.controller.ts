import { Request, Response, NextFunction } from 'express';
import { driverService } from '../services/driver.service';
import { rideService } from '../services/ride.service';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { UserRole } from '../types';

export class DriverController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let user = null;
      try {
        user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      } catch {
        user = await userService.syncUser(req.userId || 'clerk_driver_001', {
          email: `${req.userId || 'driver'}@cabgo.com`,
          role: UserRole.DRIVER,
        });
      }
      const result = await driverService.register(user.id, req.body);
      sendSuccess(res, result, 'Driver registered successfully. Pending approval.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        sendSuccess(res, { user, profile: null, vehicles: [], documents: [] });
        return;
      }
      const vehicles = await driverService.getVehicles(profile.id);
      const documents = await driverService.getDocuments(profile.id);
      sendSuccess(res, { user, profile, vehicles, documents });
    } catch (err) {
      next(err);
    }
  }

  async updateOnlineStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const updated = await driverService.updateOnlineStatus(profile.id, req.body.is_online);
      sendSuccess(res, updated, `Driver is now ${req.body.is_online ? 'online' : 'offline'}`);
    } catch (err) {
      next(err);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const updated = await driverService.updateLocation(profile.id, req.body.lat, req.body.lng);
      sendSuccess(res, updated, 'Location updated');
    } catch (err) {
      next(err);
    }
  }

  async addVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const vehicle = await driverService.addVehicle(profile.id, req.body);
      sendSuccess(res, vehicle, 'Vehicle added', 201);
    } catch (err) {
      next(err);
    }
  }

  async addDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const doc = await driverService.addDocument(profile.id, req.body.type, req.body.document_url);
      sendSuccess(res, doc, 'Document uploaded for verification', 201);
    } catch (err) {
      next(err);
    }
  }

  async getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const earnings = await driverService.getEarnings(profile.id);
      sendSuccess(res, earnings);
    } catch (err) {
      next(err);
    }
  }

  async getNearbyDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng, radius, vehicle_type } = req.query;
      const candidates = await driverService.findNearbyDrivers(
        Number(lat || 12.9352),
        Number(lng || 77.6245),
        Number(radius || 10),
        vehicle_type as any
      );
      sendSuccess(res, candidates);
    } catch (err) {
      next(err);
    }
  }

  async getActiveRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const activeRide = await rideService.getActiveRideByDriver(profile.id);
      sendSuccess(res, activeRide);
    } catch (err) {
      next(err);
    }
  }

  async rejectRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile not found' });
        return;
      }
      const { ride_id } = req.body;
      if (ride_id) {
        await rideService.rejectRideOffer(profile.id, ride_id);
      }
      sendSuccess(res, { rejected: true });
    } catch (err) {
      next(err);
    }
  }
}

export const driverController = new DriverController();
