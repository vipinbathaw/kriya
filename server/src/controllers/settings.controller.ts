import type { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service.js';

export const settingsController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await settingsService.getProfile(req.user!.id);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await settingsService.updateProfile(req.user!.id, req.body);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },
};
