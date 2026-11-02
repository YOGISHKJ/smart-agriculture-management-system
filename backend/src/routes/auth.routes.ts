import { Router } from 'express';
import { login, register, getMe, loginSchema, registerSchema } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/me', authenticateJwt, getMe);

export default router;
