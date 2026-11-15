import { Request, Response, NextFunction } from 'express';
import { supportService } from '../services/support.service';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { TicketStatus, TicketPriority } from '../types';

export class SupportController {
  async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const ticket = await supportService.createTicket(user.id, {
        ...req.body,
        priority: req.body.priority as TicketPriority,
      });
      sendSuccess(res, ticket, 'Support ticket created', 201);
    } catch (err) {
      next(err);
    }
  }

  async getUserTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserByClerkId(req.userId || 'clerk_customer_001');
      const tickets = await supportService.getUserTickets(user.id);
      sendSuccess(res, tickets);
    } catch (err) {
      next(err);
    }
  }

  async getAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const tickets = await supportService.getAllTickets(status as TicketStatus);
      sendSuccess(res, tickets);
    } catch (err) {
      next(err);
    }
  }

  async updateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await supportService.updateTicket(id, {
        ...req.body,
        priority: req.body.priority as TicketPriority,
      });
      sendSuccess(res, updated, 'Ticket updated');
    } catch (err) {
      next(err);
    }
  }
}

export const supportController = new SupportController();
