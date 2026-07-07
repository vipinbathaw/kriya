import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

const router = Router();

router.get('/profile', authenticate, settingsController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), settingsController.updateProfile);

export default router;
