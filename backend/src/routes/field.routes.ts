import { Router } from 'express';
import {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  fieldSchema
} from '../controllers/field.controller';
import { authenticateJwt } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticateJwt);

router.get('/', getFields);
router.get('/:id', getFieldById);
router.post('/', validate(fieldSchema), createField);
router.put('/:id', validate(fieldSchema), updateField);
router.delete('/:id', deleteField);

export default router;
