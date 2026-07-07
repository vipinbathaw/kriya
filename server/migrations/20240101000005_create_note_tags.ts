import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('note_tags', (table) => {
    table.uuid('id').primary();
    table.uuid('note_id').notNullable().references('id').inTable('notes').onDelete('CASCADE');
    table.string('tag', 100).notNullable();
    table.unique(['note_id', 'tag']);
    table.index(['note_id']);
    table.index(['tag']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('note_tags');
}
