import { Router } from 'express';
import { register, login, logout, me, updateProfile } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);

export default router;
