import { Router } from 'express';
import { financeController } from '../controllers/finance.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createFinanceEntrySchema } from '../validators/finance.validator.js';

const router = Router();

router.get('/', authenticate, financeController.list);
router.get('/summary', authenticate, financeController.summary);
router.get('/:id', authenticate, financeController.getById);
router.post('/', authenticate, validate(createFinanceEntrySchema), financeController.create);
router.put('/:id', authenticate, validate(createFinanceEntrySchema), financeController.update);
router.delete('/:id', authenticate, financeController.delete);

export default router;
