import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('finance_tags', (table) => {
    table.uuid('id').primary();
    table.uuid('finance_entry_id').notNullable().references('id').inTable('finance_entries').onDelete('CASCADE');
    table.string('tag', 100).notNullable();
    table.unique(['finance_entry_id', 'tag']);
    table.index(['finance_entry_id']);
    table.index(['tag']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('finance_tags');
}
