import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/summary', getDashboardSummary);

export default router;
