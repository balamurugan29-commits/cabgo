import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class CustomerController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const profile = await customerService.getProfile(user.id);
      sendSuccess(res, { user, profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const profile = await customerService.updateProfile(user.id, req.body);
      sendSuccess(res, profile, 'Customer profile updated');
    } catch (err) {
      next(err);
    }
  }

  async addSavedAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const updated = await customerService.addSavedAddress(user.id, req.body);
      sendSuccess(res, updated, 'Address saved');
    } catch (err) {
      next(err);
    }
  }

  async getEmergencyContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const contacts = await customerService.getEmergencyContacts(user.id);
      sendSuccess(res, contacts);
    } catch (err) {
      next(err);
    }
  }

  async addEmergencyContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const contact = await customerService.addEmergencyContact(user.id, req.body);
      sendSuccess(res, contact, 'Emergency contact added', 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteEmergencyContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const contactId = Array.isArray(req.params.contactId) ? req.params.contactId[0] : req.params.contactId;
      await customerService.deleteEmergencyContact(user.id, contactId);
      sendSuccess(res, null, 'Emergency contact deleted');
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
