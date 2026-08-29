import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('ai_providers').insert({
    id: 'deepseek',
    name: 'DeepSeek',
    models: JSON.stringify(['deepseek-v4-flash', 'deepseek-v4-pro']),
    is_active: true,
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('ai_providers').where({ id: 'deepseek' }).del();
}
