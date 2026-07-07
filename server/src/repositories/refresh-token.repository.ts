import db from '../config/database.js';
import knexLib from 'knex';

const k = knexLib(db);

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export const refreshTokenRepository = {
  async create(data: {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
  }): Promise<void> {
    await k('refresh_tokens').insert(data);
  },

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRow | undefined> {
    return k('refresh_tokens').where({ token_hash: tokenHash }).first();
  },

  async deleteById(id: string): Promise<void> {
    await k('refresh_tokens').where({ id }).del();
  },

  async deleteAllForUser(userId: string): Promise<void> {
    await k('refresh_tokens').where({ user_id: userId }).del();
  },

  async deleteExpired(): Promise<void> {
    await k('refresh_tokens').where('expires_at', '<', k.fn.now()).del();
  },
};
