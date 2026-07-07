import db from '../config/database.js';
import knexLib from 'knex';

const k = knexLib(db);

export interface SettingsRow {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export const settingsRepository = {
  async findByUserId(userId: string): Promise<SettingsRow | undefined> {
    return k('user_settings').where({ user_id: userId }).first();
  },

  async upsert(userId: string, data: { theme: string }): Promise<void> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      await k('user_settings').where({ user_id: userId }).update(data);
    } else {
      const { randomUUID } = await import('crypto');
      await k('user_settings').insert({ id: randomUUID(), user_id: userId, ...data });
    }
  },
};
