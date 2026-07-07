import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nutrition_items', (table) => {
    table.decimal('saturated_fat_g', 10, 2).defaultTo(0);
    table.decimal('trans_fat_g', 10, 2).defaultTo(0);
    table.decimal('monounsaturated_fat_g', 10, 2).defaultTo(0);
    table.decimal('polyunsaturated_fat_g', 10, 2).defaultTo(0);
    table.decimal('cholesterol_mg', 10, 2).defaultTo(0);
    table.decimal('potassium_mg', 10, 2).defaultTo(0);
    table.decimal('calcium_mg', 10, 2).defaultTo(0);
    table.decimal('iron_mg', 10, 2).defaultTo(0);
    table.decimal('vitamin_a_iug', 10, 2).defaultTo(0);
    table.decimal('vitamin_c_mg', 10, 2).defaultTo(0);
    table.decimal('vitamin_d_iug', 10, 2).defaultTo(0);
    table.decimal('vitamin_e_mg', 10, 2).defaultTo(0);
    table.decimal('vitamin_k_iug', 10, 2).defaultTo(0);
    table.decimal('vitamin_b6_mg', 10, 2).defaultTo(0);
    table.decimal('vitamin_b12_iug', 10, 2).defaultTo(0);
    table.decimal('folate_iug', 10, 2).defaultTo(0);
    table.decimal('magnesium_mg', 10, 2).defaultTo(0);
    table.decimal('zinc_mg', 10, 2).defaultTo(0);
    table.decimal('phosphorus_mg', 10, 2).defaultTo(0);
    table.decimal('selenium_iug', 10, 2).defaultTo(0);
    table.decimal('copper_mg', 10, 2).defaultTo(0);
    table.decimal('manganese_mg', 10, 2).defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nutrition_items', (table) => {
    table.dropColumn('saturated_fat_g');
    table.dropColumn('trans_fat_g');
    table.dropColumn('monounsaturated_fat_g');
    table.dropColumn('polyunsaturated_fat_g');
    table.dropColumn('cholesterol_mg');
    table.dropColumn('potassium_mg');
    table.dropColumn('calcium_mg');
    table.dropColumn('iron_mg');
    table.dropColumn('vitamin_a_iug');
    table.dropColumn('vitamin_c_mg');
    table.dropColumn('vitamin_d_iug');
    table.dropColumn('vitamin_e_mg');
    table.dropColumn('vitamin_k_iug');
    table.dropColumn('vitamin_b6_mg');
    table.dropColumn('vitamin_b12_iug');
    table.dropColumn('folate_iug');
    table.dropColumn('magnesium_mg');
    table.dropColumn('zinc_mg');
    table.dropColumn('phosphorus_mg');
    table.dropColumn('selenium_iug');
    table.dropColumn('copper_mg');
    table.dropColumn('manganese_mg');
  });
}
