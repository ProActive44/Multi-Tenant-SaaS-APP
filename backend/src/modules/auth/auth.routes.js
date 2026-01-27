import express from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (authentication required)
router.get('/me', authenticate, authController.getProfile);

export default router;
