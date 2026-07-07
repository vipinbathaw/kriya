import type { Request, Response, NextFunction } from 'express';
import { nutritionService } from '../services/nutrition.service.js';

export const nutritionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await nutritionService.list(req.user!.id, {
        cursor: req.query.cursor as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        mealType: req.query.mealType as string | undefined,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await nutritionService.getById(req.params.id as string, req.user!.id);
      res.json(entry);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await nutritionService.create(req.user!.id, req.body);
      res.status(201).json(entry);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await nutritionService.delete(req.params.id as string, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
