import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ai_providers', (table) => {
    table.string('id', 50).primary();
    table.string('name', 100).notNullable();
    table.specificType('models', 'json').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex('ai_providers').insert([
    {
      id: 'openai',
      name: 'OpenAI',
      models: JSON.stringify(['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']),
      is_active: true,
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      models: JSON.stringify(['claude-sonnet-4-20250514', 'claude-haiku-3-5-20241022']),
      is_active: true,
    },
    {
      id: 'mock',
      name: 'Mock AI (Development)',
      models: JSON.stringify(['mock']),
      is_active: true,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ai_providers');
}
