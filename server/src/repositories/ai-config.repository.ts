import db from '../config/database.js';
import knexLib from 'knex';
import { randomUUID } from 'crypto';

const k = knexLib(db);

export interface UserAIConfigRow {
  id: string;
  user_id: string;
  module: string;
  ai_enabled: number;
  provider: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
}

export const aiConfigRepository = {
  async findByUserAndModule(userId: string, module: string): Promise<UserAIConfigRow | undefined> {
    return k('user_ai_configs').where({ user_id: userId, module }).first() as Promise<UserAIConfigRow | undefined>;
  },

  async findByUser(userId: string): Promise<UserAIConfigRow[]> {
    return k('user_ai_configs').where({ user_id: userId }) as Promise<UserAIConfigRow[]>;
  },

  async upsert(userId: string, module: string, data: {
    aiEnabled?: boolean;
    provider?: string | null;
    model?: string | null;
  }): Promise<void> {
    const existing = await this.findByUserAndModule(userId, module);
    const updateData: Record<string, unknown> = {};
    if (data.aiEnabled !== undefined) updateData.ai_enabled = data.aiEnabled;
    if (data.provider !== undefined) updateData.provider = data.provider;
    if (data.model !== undefined) updateData.model = data.model;

    if (existing) {
      if (Object.keys(updateData).length > 0) {
        await k('user_ai_configs').where({ user_id: userId, module }).update(updateData);
      }
    } else {
      await k('user_ai_configs').insert({
        id: randomUUID(),
        user_id: userId,
        module,
        ai_enabled: data.aiEnabled ?? false,
        provider: data.provider ?? null,
        model: data.model ?? null,
      });
    }
  },
};
