import { Router } from 'express';
import authRoutes from './auth.routes';
import fieldRoutes from './field.routes';
import cropRoutes from './crop.routes';
import waterRoutes from './water.routes';
import fertilizerRoutes from './fertilizer.routes';
import dashboardRoutes from './dashboard.routes';
import healthRoutes from './health.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/fields', fieldRoutes);
apiRouter.use('/crops', cropRoutes);
apiRouter.use('/water', waterRoutes);
apiRouter.use('/fertilizer', fertilizerRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/health', healthRoutes);

export default apiRouter;
