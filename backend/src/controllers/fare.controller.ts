import { Request, Response, NextFunction } from 'express';
import { fareService } from '../services/fare.service';
import { sendSuccess } from '../utils/response';
import { VehicleType } from '../types';

export class FareController {
  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await fareService.getFareSettings();
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  }

  async estimateFare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vehicle_type, distance_km, duration_minutes, promo_code } = req.query;

      if (!distance_km || !duration_minutes) {
        res.status(400).json({ success: false, error: 'distance_km and duration_minutes are required' });
        return;
      }

      if (vehicle_type) {
        const result = await fareService.calculateFare(
          vehicle_type as VehicleType,
          Number(distance_km),
          Number(duration_minutes),
          promo_code as string | undefined
        );
        sendSuccess(res, result);
      } else {
        const results = await fareService.calculateAllEstimates(
          Number(distance_km),
          Number(duration_minutes)
        );
        sendSuccess(res, results);
      }
    } catch (err) {
      next(err);
    }
  }
}

export const fareController = new FareController();
