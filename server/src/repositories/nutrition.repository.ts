import db from '../config/database.js';
import knexLib from 'knex';
import { buildCursorWhere, buildPaginatedResponse } from '../utils/pagination.js';
import type { PaginatedResult } from '../utils/pagination.js';
const k = knexLib(db);

export interface NutritionEntryRow {
  id: string;
  user_id: string;
  raw_input: string;
  meal_type: string;
  entry_date: string;
  status: string;
  error_message: string | null;
  ai_generated: number;
  created_at: string;
  updated_at: string;
}

export interface NutritionItemRow {
  id: string;
  nutrition_entry_id: string;
  food_name: string;
  quantity: number | null;
  unit: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  trans_fat_g: number | null;
  monounsaturated_fat_g: number | null;
  polyunsaturated_fat_g: number | null;
  cholesterol_mg: number | null;
  potassium_mg: number | null;
  calcium_mg: number | null;
  iron_mg: number | null;
  vitamin_a_iug: number | null;
  vitamin_c_mg: number | null;
  vitamin_d_iug: number | null;
  vitamin_e_mg: number | null;
  vitamin_k_iug: number | null;
  vitamin_b6_mg: number | null;
  vitamin_b12_iug: number | null;
  folate_iug: number | null;
  magnesium_mg: number | null;
  zinc_mg: number | null;
  phosphorus_mg: number | null;
  selenium_iug: number | null;
  copper_mg: number | null;
  manganese_mg: number | null;
  metadata: string | null;
}

function toItemResponse(row: NutritionItemRow) {
  return {
    id: row.id,
    foodName: row.food_name,
    quantity: Number(row.quantity ?? 0),
    unit: row.unit ?? 'serving',
    calories: Number(row.calories ?? 0),
    proteinG: Number(row.protein_g ?? 0),
    carbsG: Number(row.carbs_g ?? 0),
    fatG: Number(row.fat_g ?? 0),
    fiberG: Number(row.fiber_g ?? 0),
    sugarG: Number(row.sugar_g ?? 0),
    sodiumMg: Number(row.sodium_mg ?? 0),
    saturatedFatG: Number(row.saturated_fat_g ?? 0),
    transFatG: Number(row.trans_fat_g ?? 0),
    monounsaturatedFatG: Number(row.monounsaturated_fat_g ?? 0),
    polyunsaturatedFatG: Number(row.polyunsaturated_fat_g ?? 0),
    cholesterolMg: Number(row.cholesterol_mg ?? 0),
    potassiumMg: Number(row.potassium_mg ?? 0),
    calciumMg: Number(row.calcium_mg ?? 0),
    ironMg: Number(row.iron_mg ?? 0),
    vitaminAIug: Number(row.vitamin_a_iug ?? 0),
    vitaminCMg: Number(row.vitamin_c_mg ?? 0),
    vitaminDIug: Number(row.vitamin_d_iug ?? 0),
    vitaminEMg: Number(row.vitamin_e_mg ?? 0),
    vitaminKIug: Number(row.vitamin_k_iug ?? 0),
    vitaminB6Mg: Number(row.vitamin_b6_mg ?? 0),
    vitaminB12Iug: Number(row.vitamin_b12_iug ?? 0),
    folateIug: Number(row.folate_iug ?? 0),
    magnesiumMg: Number(row.magnesium_mg ?? 0),
    zincMg: Number(row.zinc_mg ?? 0),
    phosphorusMg: Number(row.phosphorus_mg ?? 0),
    seleniumIug: Number(row.selenium_iug ?? 0),
    copperMg: Number(row.copper_mg ?? 0),
    manganeseMg: Number(row.manganese_mg ?? 0),
  };
}

export const nutritionRepository = {
  async create(data: {
    id: string;
    user_id: string;
    raw_input: string;
    meal_type: string;
    entry_date: string;
  }) {
    await k('nutrition_entries').insert({
      id: data.id,
      user_id: data.user_id,
      raw_input: data.raw_input,
      meal_type: data.meal_type,
      entry_date: data.entry_date,
      status: 'pending',
      ai_generated: true,
    });

    return this.findById(data.id, data.user_id);
  },

  async updateWithResults(id: string, userId: string, items: Array<{
    foodName: string; quantity: number; unit: string; calories: number;
    proteinG: number; carbsG: number; fatG: number; fiberG: number; sugarG: number; sodiumMg: number;
    saturatedFatG: number; transFatG: number; monounsaturatedFatG: number; polyunsaturatedFatG: number;
    cholesterolMg: number; potassiumMg: number; calciumMg: number; ironMg: number;
    vitaminAIug: number; vitaminCMg: number; vitaminDIug: number; vitaminEMg: number; vitaminKIug: number;
    vitaminB6Mg: number; vitaminB12Iug: number; folateIug: number;
    magnesiumMg: number; zincMg: number; phosphorusMg: number; seleniumIug: number; copperMg: number; manganeseMg: number;
  }>) {
    if (items.length > 0) {
      await k('nutrition_items').insert(
        items.map((item) => ({
          id: crypto.randomUUID(),
          nutrition_entry_id: id,
          food_name: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein_g: item.proteinG,
          carbs_g: item.carbsG,
          fat_g: item.fatG,
          fiber_g: item.fiberG,
          sugar_g: item.sugarG,
          sodium_mg: item.sodiumMg,
          saturated_fat_g: item.saturatedFatG,
          trans_fat_g: item.transFatG,
          monounsaturated_fat_g: item.monounsaturatedFatG,
          polyunsaturated_fat_g: item.polyunsaturatedFatG,
          cholesterol_mg: item.cholesterolMg,
          potassium_mg: item.potassiumMg,
          calcium_mg: item.calciumMg,
          iron_mg: item.ironMg,
          vitamin_a_iug: item.vitaminAIug,
          vitamin_c_mg: item.vitaminCMg,
          vitamin_d_iug: item.vitaminDIug,
          vitamin_e_mg: item.vitaminEMg,
          vitamin_k_iug: item.vitaminKIug,
          vitamin_b6_mg: item.vitaminB6Mg,
          vitamin_b12_iug: item.vitaminB12Iug,
          folate_iug: item.folateIug,
          magnesium_mg: item.magnesiumMg,
          zinc_mg: item.zincMg,
          phosphorus_mg: item.phosphorusMg,
          selenium_iug: item.seleniumIug,
          copper_mg: item.copperMg,
          manganese_mg: item.manganeseMg,
        })),
      );
    }

    await k('nutrition_entries').where({ id, user_id: userId }).update({
      status: 'completed',
    });

    return this.findById(id, userId);
  },

  async markFailed(id: string, userId: string, errorMessage: string) {
    await k('nutrition_entries').where({ id, user_id: userId }).update({
      status: 'failed',
      error_message: errorMessage,
    });
  },

  async findPending(): Promise<NutritionEntryRow[]> {
    return k('nutrition_entries')
      .where({ status: 'pending' })
      .orderBy('created_at', 'asc')
      .limit(5) as Promise<NutritionEntryRow[]>;
  },

  async findById(id: string, userId: string) {
    const entry = await k('nutrition_entries')
      .where({ id, user_id: userId })
      .first() as NutritionEntryRow | undefined;
    if (!entry) return undefined;

    const items = await k('nutrition_items')
      .where({ nutrition_entry_id: id })
      .orderBy('food_name') as NutritionItemRow[];

    return { entry, items: items.map(toItemResponse) };
  },

  async findByUser(
    userId: string,
    params: { cursor?: string; limit?: number; from?: string; to?: string; mealType?: string },
  ): Promise<PaginatedResult<{ entry: NutritionEntryRow; items: ReturnType<typeof toItemResponse>[] }>> {
    const limit = Math.min(params.limit ?? 20, 100);
    let query = k('nutrition_entries').where({ user_id: userId });

    const cursor = params.cursor ? buildCursorWhere(params.cursor) : null;
    if (cursor) {
      query = query.whereRaw('(entry_date < ? OR (entry_date = ? AND id > ?))', [
        cursor.createdAt as string,
        cursor.createdAt as string,
        cursor.id as string,
      ]);
    }

    if (params.from) query = query.where('entry_date', '>=', params.from);
    if (params.to) query = query.where('entry_date', '<=', params.to);
    if (params.mealType) query = query.where({ meal_type: params.mealType });

    const rows = await query
      .orderBy('entry_date', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limit + 1) as NutritionEntryRow[];

    const result = buildPaginatedResponse(rows, limit);

    const entryIds = result.data.map((r) => r.id);
    const allItems = await k('nutrition_items')
      .whereIn('nutrition_entry_id', entryIds)
      .orderBy('food_name') as NutritionItemRow[];

    const itemsByEntry = new Map<string, ReturnType<typeof toItemResponse>[]>();
    for (const item of allItems) {
      const list = itemsByEntry.get(item.nutrition_entry_id) ?? [];
      list.push(toItemResponse(item));
      itemsByEntry.set(item.nutrition_entry_id, list);
    }

    return {
      data: result.data.map((row) => ({
        entry: row,
        items: itemsByEntry.get(row.id) ?? [],
      })),
      nextCursor: result.nextCursor,
    };
  },

  async delete(id: string, userId: string) {
    await k('nutrition_entries').where({ id, user_id: userId }).del();
  },
};
