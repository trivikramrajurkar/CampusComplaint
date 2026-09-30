import { Router } from 'express';
import { register, login, getMe, listClasses } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/classes', listClasses); // for registration dropdown

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
