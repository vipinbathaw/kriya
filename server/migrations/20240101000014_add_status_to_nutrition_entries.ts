import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nutrition_entries', (table) => {
    table.enu('status', ['pending', 'completed', 'failed']).defaultTo('pending');
    table.text('error_message');
    table.index(['status']);
  });

  await knex('nutrition_entries').update({ status: 'completed' });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nutrition_entries', (table) => {
    table.dropIndex(['status']);
    table.dropColumn('status');
    table.dropColumn('error_message');
  });
}
