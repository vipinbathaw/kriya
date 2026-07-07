import { Router } from 'express';
import { nutritionController } from '../controllers/nutrition.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createNutritionEntrySchema } from '../validators/nutrition.validator.js';

const router = Router();

router.get('/', authenticate, nutritionController.list);
router.get('/:id', authenticate, nutritionController.getById);
router.post('/', authenticate, validate(createNutritionEntrySchema), nutritionController.create);
router.delete('/:id', authenticate, nutritionController.delete);

export default router;
