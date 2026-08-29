import { randomUUID, createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { emailService } from './email.service.js';
import { logger } from '../utils/logger.js';
import { ConflictError, UnauthorizedError, AppError } from '../middleware/errorHandler.js';
import type { UserRow } from '../repositories/user.repository.js';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user: Pick<UserRow, 'id' | 'email'>): string {
  return jwt.sign({ sub: user.id, email: user.email }, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY as `${number}${'s' | 'm' | 'h' | 'd'}`,
  });
}

function generateRefreshToken(): string {
  return randomUUID() + randomUUID();
}

function toUserResponse(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    emailVerified: !!user.email_verified,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  switch (match[2]) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

async function generateTokens(user: Pick<UserRow, 'id' | 'email'>) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDuration(config.JWT_REFRESH_EXPIRY));

  await refreshTokenRepository.create({
    id: randomUUID(),
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<{
    user: ReturnType<typeof toUserResponse>;
    verificationRequired: boolean;
    accessToken?: string;
    refreshToken?: string;
  }> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = randomUUID();

    // When no email provider is configured (dev, or a self-hosted install without
    // a RESEND_API_KEY) auto-verify so accounts are never permanently locked out.
    const emailProviderConfigured = !!config.RESEND_API_KEY;
    const autoVerify = config.NODE_ENV === 'development' || !emailProviderConfigured;
    const verifyToken = autoVerify ? null : randomUUID();

    if (!emailProviderConfigured && config.NODE_ENV === 'production') {
      logger.warn('RESEND_API_KEY not configured — new accounts are auto-verified and no verification email is sent');
    }

    await userRepository.create({
      id,
      email,
      password_hash: passwordHash,
      display_name: displayName,
      email_verified: autoVerify,
      email_verify_token: verifyToken,
    });

    const user = await userRepository.findById(id)!;

    // Email verification required: do not log the user in yet. They must
    // click the link in the email before they can use the app.
    if (!autoVerify && verifyToken) {
      await emailService.sendVerificationEmail(email, verifyToken);
      return { user: toUserResponse(user!), verificationRequired: true };
    }

    const tokens = await generateTokens(user!);
    return { user: toUserResponse(user!), verificationRequired: false, ...tokens };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.email_verified && config.NODE_ENV !== 'development') {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
    }

    const tokens = await generateTokens(user);
    return { user: toUserResponse(user), ...tokens };
  },

  async resendVerification(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Fail silently for unknown or already-verified addresses to avoid
    // leaking which emails have accounts.
    if (!user || user.email_verified) return;

    const verifyToken = randomUUID();
    await userRepository.updateVerifyToken(user.id, verifyToken);
    await emailService.sendVerificationEmail(user.email, verifyToken);
  },

  async verifyEmail(token: string) {
    const user = await userRepository.findByVerifyToken(token);
    if (!user) {
      throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired verification token');
    }
    await userRepository.verifyEmail(user.id);
  },

  async refreshToken(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (new Date(stored.expires_at) < new Date()) {
      await refreshTokenRepository.deleteById(stored.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    await refreshTokenRepository.deleteById(stored.id);

    const user = await userRepository.findById(stored.user_id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = await generateTokens(user);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (stored) {
      await refreshTokenRepository.deleteById(stored.id);
    }
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return toUserResponse(user);
  },
};
