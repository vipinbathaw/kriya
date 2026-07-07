import { Router } from 'express';
import { notesController } from '../controllers/notes.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createNoteSchema, updateNoteSchema } from '../validators/notes.validator.js';

const router = Router();

router.get('/', authenticate, notesController.list);
router.get('/:id', authenticate, notesController.getById);
router.post('/', authenticate, validate(createNoteSchema), notesController.create);
router.put('/:id', authenticate, validate(updateNoteSchema), notesController.update);
router.delete('/:id', authenticate, notesController.delete);

export default router;
