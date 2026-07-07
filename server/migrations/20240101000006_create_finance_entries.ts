import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('finance_entries', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enu('type', ['credit', 'debit']).notNullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.bigInteger('amount').notNullable();
    table.string('currency', 3).defaultTo('INR');
    table.json('tags');
    table.date('entry_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.index(['user_id', 'entry_date']);
    table.index(['user_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('finance_entries');
}
