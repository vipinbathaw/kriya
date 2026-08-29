import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName } = req.body;
      const result = await authService.register(email, password, displayName);
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/api/auth',
        });
      }
      res.status(201).json({
        user: result.user,
        ...(result.accessToken ? { accessToken: result.accessToken } : {}),
        verificationRequired: result.verificationRequired,
      });
    } catch (err) {
      next(err);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendVerification(email);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });
      res.json({ user: result.user, accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
        return;
      }
      const result = await authService.refreshToken(token);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });
      res.json({ accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie('refreshToken', { path: '/api/auth' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      if (typeof token !== 'string') {
        res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Verification token is required' } });
        return;
      }
      await authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (err) {
      next(err);
    }
  },
};
