import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { emailService } from './email.service.js';
import { ConflictError, UnauthorizedError } from '../middleware/errorHandler.js';
import { createMockUser } from '../test-utils/factory.js';

vi.mock('../repositories/user.repository.js');
vi.mock('../repositories/refresh-token.repository.js');
vi.mock('./email.service.js', () => ({
  emailService: { sendVerificationEmail: vi.fn() },
}));

const { mockConfig } = vi.hoisted(() => ({
  mockConfig: {
    NODE_ENV: 'test',
    RESEND_API_KEY: '',
    APP_URL: 'http://localhost:5173',
    JWT_SECRET: 'test-secret-test-secret-test-secret-12345',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
  },
}));
vi.mock('../config/index.js', () => ({ config: mockConfig }));

beforeEach(() => {
  vi.clearAllMocks();
  mockConfig.NODE_ENV = 'test';
  mockConfig.RESEND_API_KEY = '';
});

describe('authService', () => {
  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      const mockUser = createMockUser({ email: 'new@example.com' });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepository.create).mockResolvedValue(undefined);
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(refreshTokenRepository.create).mockResolvedValue(undefined);

      const result = await authService.register('new@example.com', 'password123', 'New User');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('new@example.com');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('throws ConflictError when email already exists', async () => {
      const mockUser = createMockUser({ email: 'existing@example.com' });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.register('existing@example.com', 'password123', 'User'),
      ).rejects.toThrow(ConflictError);
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('does not issue tokens and sends a verification email when verification is required', async () => {
      mockConfig.NODE_ENV = 'production';
      mockConfig.RESEND_API_KEY = 're_test_key';
      const mockUser = createMockUser({ email: 'new@example.com', email_verified: 0 });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepository.create).mockResolvedValue(undefined);
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

      const result = await authService.register('new@example.com', 'password123', 'New User');

      expect(result.verificationRequired).toBe(true);
      expect(result.accessToken).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(refreshTokenRepository.create).not.toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith('new@example.com', expect.any(String));
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const mockUser = createMockUser();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(refreshTokenRepository.create).mockResolvedValue(undefined);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('throws UnauthorizedError when user not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);

      await expect(
        authService.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when password is wrong', async () => {
      const mockUser = createMockUser();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when password is empty', async () => {
      const mockUser = createMockUser();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', ''),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws EMAIL_NOT_VERIFIED for an unverified account in production', async () => {
      mockConfig.NODE_ENV = 'production';
      const mockUser = createMockUser({ email_verified: 0 });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'password123'),
      ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED', statusCode: 403 });
    });
  });

  describe('resendVerification', () => {
    it('regenerates the token and sends an email for an unverified user', async () => {
      const mockUser = createMockUser({ email_verified: 0 });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(userRepository.updateVerifyToken).mockResolvedValue(undefined);

      await authService.resendVerification('test@example.com');

      expect(userRepository.updateVerifyToken).toHaveBeenCalledWith(mockUser.id, expect.any(String));
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
    });

    it('does nothing for an already verified user', async () => {
      const mockUser = createMockUser({ email_verified: 1 });
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await authService.resendVerification('test@example.com');

      expect(userRepository.updateVerifyToken).not.toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('does nothing for an unknown email', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);

      await authService.resendVerification('missing@example.com');

      expect(userRepository.updateVerifyToken).not.toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('rotates tokens for a valid refresh token', async () => {
      const mockUser = createMockUser();
      const mockToken = createMockRefreshToken();
      vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(mockToken);
      vi.mocked(refreshTokenRepository.deleteById).mockResolvedValue(undefined);
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(refreshTokenRepository.create).mockResolvedValue(undefined);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.refreshToken).not.toBe('valid-refresh-token');
      expect(refreshTokenRepository.deleteById).toHaveBeenCalledWith(mockToken.id);
      expect(refreshTokenRepository.create).toHaveBeenCalled();
    });

    it('throws UnauthorizedError for invalid refresh token', async () => {
      vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(undefined);

      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for expired refresh token', async () => {
      const expiredToken = createMockRefreshToken({
        expires_at: new Date(Date.now() - 100000).toISOString(),
      });
      vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(expiredToken);
      vi.mocked(refreshTokenRepository.deleteById).mockResolvedValue(undefined);

      await expect(
        authService.refreshToken('expired-token'),
      ).rejects.toThrow(UnauthorizedError);

      expect(refreshTokenRepository.deleteById).toHaveBeenCalledWith(expiredToken.id);
    });
  });

  describe('logout', () => {
    it('deletes refresh token if found', async () => {
      const mockToken = createMockRefreshToken();
      vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(mockToken);
      vi.mocked(refreshTokenRepository.deleteById).mockResolvedValue(undefined);

      await authService.logout('valid-token');
      expect(refreshTokenRepository.deleteById).toHaveBeenCalledWith(mockToken.id);
    });

    it('does nothing if token not found', async () => {
      vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(undefined);

      await authService.logout('unknown-token');
      expect(refreshTokenRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('returns user data for valid userId', async () => {
      const mockUser = createMockUser();
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

      const result = await authService.getMe(mockUser.id);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.displayName).toBe(mockUser.display_name);
    });

    it('throws UnauthorizedError if user not found', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(undefined);

      await expect(authService.getMe('nonexistent-id')).rejects.toThrow(UnauthorizedError);
    });
  });
});

function createMockRefreshToken(overrides?: Partial<{
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}>) {
  return {
    id: 'mock-token-id',
    user_id: 'mock-user-id',
    token_hash: 'a'.repeat(64),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
