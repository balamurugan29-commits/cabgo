import { Request, Response, NextFunction } from 'express';
import { rideService } from '../services/ride.service';
import { userService } from '../services/user.service';
import { driverService } from '../services/driver.service';
import { sendSuccess } from '../utils/response';
import { RideStatus } from '../types';

export class RideController {
  async createRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const ride = await rideService.createRide(user.id, req.body);
      sendSuccess(res, ride, 'Ride requested successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getRideById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ride = await rideService.getRideById(id);
      sendSuccess(res, ride);
    } catch (err) {
      next(err);
    }
  }

  async acceptRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Driver profile required' });
        return;
      }
      const updated = await rideService.assignDriver(id, profile.id);
      sendSuccess(res, updated, 'Ride accepted');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status, cancellation_reason } = req.body;
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const updated = await rideService.updateRideStatus(
        id,
        status as RideStatus,
        cancellation_reason,
        user.id
      );
      sendSuccess(res, updated, `Ride status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  async cancelRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const updated = await rideService.updateRideStatus(
        id,
        RideStatus.CANCELLED,
        req.body.reason,
        user.id
      );
      sendSuccess(res, updated, 'Ride cancelled');
    } catch (err) {
      next(err);
    }
  }

  async getCustomerRides(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const rides = await rideService.getCustomerRides(user.id);
      sendSuccess(res, rides);
    } catch (err) {
      next(err);
    }
  }

  async getDriverRides(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_driver_001');
      const profile = await driverService.getProfileByUserId(user.id);
      if (!profile) {
        sendSuccess(res, []);
        return;
      }
      const rides = await rideService.getDriverRides(profile.id);
      sendSuccess(res, rides);
    } catch (err) {
      next(err);
    }
  }

  async rateRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await rideService.rateRide(id, req.userId || 'customer-user-001', req.body.rating, req.body.review);
      sendSuccess(res, result, 'Rating submitted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const rideController = new RideController();
