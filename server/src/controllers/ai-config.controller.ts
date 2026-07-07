import type { Request, Response, NextFunction } from 'express';
import { aiConfigService } from '../services/ai-config.service.js';
import { apiKeyService } from '../services/api-key.service.js';

export const aiConfigController = {
  async getConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await aiConfigService.getConfigs(req.user!.id);
      res.json(configs);
    } catch (err) {
      next(err);
    }
  },

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const module = req.params.module as string;
      await aiConfigService.updateConfig(req.user!.id, module, req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = await aiConfigService.getAvailableProviders();
      res.json(providers);
    } catch (err) {
      next(err);
    }
  },

  async storeApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, apiKey } = req.body;
      await apiKeyService.storeKey(req.user!.id, provider, apiKey);
      const keys = await apiKeyService.listKeys(req.user!.id);
      const updated = keys.find((k) => k.provider === provider);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async listApiKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const keys = await apiKeyService.listKeys(req.user!.id);
      res.json(keys);
    } catch (err) {
      next(err);
    }
  },

  async deleteApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = req.params.provider as string;
      await apiKeyService.deleteKey(req.user!.id, provider);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
