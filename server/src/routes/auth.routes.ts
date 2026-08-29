import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, resendVerificationSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', rateLimiter(3, 60 * 60 * 1000), validate(registerSchema), authController.register);
router.post('/login', rateLimiter(5, 15 * 60 * 1000), validate(loginSchema), authController.login);
router.post(
  '/resend-verification',
  rateLimiter(3, 60 * 60 * 1000),
  validate(resendVerificationSchema),
  authController.resendVerification,
);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.get('/verify-email', authController.verifyEmail);

export default router;
