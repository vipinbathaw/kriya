import { Router } from 'express';
import { aiConfigController } from '../controllers/ai-config.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateAIConfigSchema, apiKeySchema } from '../validators/ai-config.validator.js';
import { z } from 'zod';

const moduleParamSchema = z.object({
  module: z.enum(['notes', 'finance', 'nutrition']),
});

const providerParamSchema = z.object({
  provider: z.string().min(1),
});

const router = Router();

router.get('/configs', authenticate, aiConfigController.getConfigs);
router.get('/providers', authenticate, aiConfigController.getProviders);
router.put(
  '/configs/:module',
  authenticate,
  validate(moduleParamSchema, 'params'),
  validate(updateAIConfigSchema),
  aiConfigController.updateConfig,
);
router.post('/keys', authenticate, validate(apiKeySchema), aiConfigController.storeApiKey);
router.get('/keys', authenticate, aiConfigController.listApiKeys);
router.delete(
  '/keys/:provider',
  authenticate,
  validate(providerParamSchema, 'params'),
  aiConfigController.deleteApiKey,
);

export default router;
