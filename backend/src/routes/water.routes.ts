import { Router } from 'express';
import {
  getWaterUsages,
  getWaterById,
  createWaterUsage,
  updateWaterUsage,
  deleteWaterUsage,
  waterUsageSchema
} from '../controllers/water.controller';
import { authenticateJwt } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticateJwt);

router.get('/', getWaterUsages);
router.get('/:id', getWaterById);
router.post('/', validate(waterUsageSchema), createWaterUsage);
router.put('/:id', validate(waterUsageSchema), updateWaterUsage);
router.delete('/:id', deleteWaterUsage);

export default router;
