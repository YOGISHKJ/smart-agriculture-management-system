import { Router } from 'express';
import {
  getFertilizerUsages,
  getFertilizerById,
  createFertilizerUsage,
  updateFertilizerUsage,
  deleteFertilizerUsage,
  fertilizerUsageSchema
} from '../controllers/fertilizer.controller';
import { authenticateJwt } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticateJwt);

router.get('/', getFertilizerUsages);
router.get('/:id', getFertilizerById);
router.post('/', validate(fertilizerUsageSchema), createFertilizerUsage);
router.put('/:id', validate(fertilizerUsageSchema), updateFertilizerUsage);
router.delete('/:id', deleteFertilizerUsage);

export default router;
