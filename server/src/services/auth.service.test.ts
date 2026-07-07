import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { ConflictError, UnauthorizedError } from '../middleware/errorHandler.js';
import { createMockUser } from '../test-utils/factory.js';

vi.mock('../repositories/user.repository.js');
vi.mock('../repositories/refresh-token.repository.js');

beforeEach(() => {
  vi.clearAllMocks();
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
