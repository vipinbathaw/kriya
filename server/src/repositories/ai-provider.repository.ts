import db from '../config/database.js';
import knexLib from 'knex';

const k = knexLib(db);

export interface AIProviderRow {
  id: string;
  name: string;
  models: string;
  is_active: number;
  created_at: string;
}

export const aiProviderRepository = {
  async findAll(): Promise<AIProviderRow[]> {
    return k('ai_providers').where({ is_active: true }).orderBy('name') as Promise<AIProviderRow[]>;
  },

  async findById(id: string): Promise<AIProviderRow | undefined> {
    return k('ai_providers').where({ id, is_active: true }).first() as Promise<AIProviderRow | undefined>;
  },
};
