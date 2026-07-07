import db from '../config/database.js';
import knexLib from 'knex';
import { randomUUID } from 'crypto';
import { encrypt, decrypt } from '../utils/encryption.js';

const k = knexLib(db);

export interface ApiKeyRow {
  id: string;
  user_id: string;
  provider: string;
  encrypted_key: string;
  key_preview: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const apiKeyRepository = {
  async store(userId: string, provider: string, apiKey: string): Promise<void> {
    const encrypted = encrypt(apiKey);
    const keyPreview = apiKey.length > 8 ? `${apiKey.slice(0, 8)}...` : apiKey;
    const payload = JSON.stringify(encrypted);

    const existing = await k('api_keys').where({ user_id: userId, provider }).first();
    if (existing) {
      await k('api_keys').where({ user_id: userId, provider }).update({
        encrypted_key: payload,
        key_preview: keyPreview,
        is_active: true,
      });
    } else {
      await k('api_keys').insert({
        id: randomUUID(),
        user_id: userId,
        provider,
        encrypted_key: payload,
        key_preview: keyPreview,
      });
    }
  },

  async getDecryptedKey(userId: string, provider: string): Promise<string | null> {
    const row = await k('api_keys')
      .where({ user_id: userId, provider, is_active: true })
      .first() as ApiKeyRow | undefined;
    if (!row) return null;

    const parsed = JSON.parse(row.encrypted_key) as { ciphertext: string; iv: string; authTag: string };
    return decrypt(parsed);
  },

  async findByUser(userId: string): Promise<Array<{ provider: string; keyPreview: string; isActive: boolean }>> {
    const rows = await k('api_keys')
      .where({ user_id: userId, is_active: true })
      .select('provider', 'key_preview', 'is_active') as Array<{ provider: string; key_preview: string; is_active: number }>;
    return rows.map((r) => ({ provider: r.provider, keyPreview: r.key_preview, isActive: !!r.is_active }));
  },

  async softDelete(userId: string, provider: string): Promise<void> {
    await k('api_keys').where({ user_id: userId, provider }).update({ is_active: false });
  },
};
