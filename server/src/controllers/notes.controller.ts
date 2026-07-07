import type { Request, Response, NextFunction } from 'express';
import { notesService } from '../services/notes.service.js';

export const notesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notesService.list(req.user!.id, {
        cursor: req.query.cursor as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        tag: req.query.tag as string | undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await notesService.getById(req.params.id as string, req.user!.id);
      res.json(note);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await notesService.create(req.user!.id, req.body);
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await notesService.update(req.params.id as string, req.user!.id, req.body);
      res.json(note);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await notesService.delete(req.params.id as string, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
