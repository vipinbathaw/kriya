import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('nutrition_items', (table) => {
    table.uuid('id').primary();
    table.uuid('nutrition_entry_id').notNullable().references('id').inTable('nutrition_entries').onDelete('CASCADE');
    table.string('food_name', 255).notNullable();
    table.decimal('quantity', 10, 2);
    table.string('unit', 50);
    table.decimal('calories', 10, 2);
    table.decimal('protein_g', 10, 2);
    table.decimal('carbs_g', 10, 2);
    table.decimal('fat_g', 10, 2);
    table.decimal('fiber_g', 10, 2);
    table.decimal('sugar_g', 10, 2);
    table.decimal('sodium_mg', 10, 2);
    table.json('metadata');
    table.index(['nutrition_entry_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('nutrition_items');
}
