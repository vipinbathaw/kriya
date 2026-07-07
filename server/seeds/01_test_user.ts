import type { Knex } from 'knex';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('refresh_tokens').del();
  await knex('user_settings').del();
  await knex('users').del();

  const id = randomUUID();
  const passwordHash = await bcrypt.hash('password123', 12);

  await knex('users').insert({
    id,
    email: 'test@kriya.app',
    password_hash: passwordHash,
    display_name: 'Test User',
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });

  await knex('user_settings').insert({
    id: randomUUID(),
    user_id: id,
    theme: 'system',
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });
}
