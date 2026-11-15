import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { rideService } from '../services/ride.service';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/response';
import { DriverStatus, RideStatus, VehicleType } from '../types';

export class AdminController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async getDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const drivers = await adminService.getDrivers(status as DriverStatus);
      sendSuccess(res, drivers);
    } catch (err) {
      next(err);
    }
  }

  async approveDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const driver = await adminService.approveDriver(id, req.userId || 'admin-001');
      sendSuccess(res, driver, 'Driver approved successfully');
    } catch (err) {
      next(err);
    }
  }

  async rejectDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason } = req.body;
      const driver = await adminService.rejectDriver(id, req.userId || 'admin-001', reason || 'Document requirements not met');
      sendSuccess(res, driver, 'Driver registration rejected');
    } catch (err) {
      next(err);
    }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { is_suspended } = req.body;
      const user = await adminService.suspendUser(id, !!is_suspended);
      sendSuccess(res, user, `User has been ${is_suspended ? 'suspended' : 'reactivated'}`);
    } catch (err) {
      next(err);
    }
  }

  async getRides(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const rides = await rideService.getAllRides(status as RideStatus);
      sendSuccess(res, rides);
    } catch (err) {
      next(err);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentService.getAllPayments();
      sendSuccess(res, payments);
    } catch (err) {
      next(err);
    }
  }

  async getPromoCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promoCodes = await adminService.getPromoCodes();
      sendSuccess(res, promoCodes);
    } catch (err) {
      next(err);
    }
  }

  async createPromoCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const promo = await adminService.createPromoCode(req.body);
      sendSuccess(res, promo, 'Promo code created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updatePromoStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const { is_active } = req.body;
      const promo = await adminService.updatePromoStatus(code, is_active);
      sendSuccess(res, promo, 'Promo code status updated');
    } catch (err) {
      next(err);
    }
  }

  async updateFareSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicleType = Array.isArray(req.params.vehicleType) ? req.params.vehicleType[0] : req.params.vehicleType;
      const updated = await adminService.updateFareSetting(vehicleType as VehicleType, req.body);
      sendSuccess(res, updated, 'Fare setting updated');
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
