import type { Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service.js';

export const financeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await financeService.list(req.user!.id, {
        cursor: req.query.cursor as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        type: req.query.type as string | undefined,
        tag: req.query.tag as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await financeService.getById(req.params.id as string, req.user!.id);
      res.json(entry);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await financeService.create(req.user!.id, req.body);
      res.status(201).json(entry);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await financeService.update(req.params.id as string, req.user!.id, req.body);
      res.json(entry);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await financeService.delete(req.params.id as string, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await financeService.getSummary(req.user!.id, {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });
      res.json(result);
    } catch (err) { next(err); }
  },
};
