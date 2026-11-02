import { Router } from 'express';
import {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  cropSchema
} from '../controllers/crop.controller';
import { authenticateJwt } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticateJwt);

router.get('/', getCrops);
router.get('/:id', getCropById);
router.post('/', validate(cropSchema), createCrop);
router.put('/:id', validate(cropSchema), updateCrop);
router.delete('/:id', deleteCrop);

export default router;
