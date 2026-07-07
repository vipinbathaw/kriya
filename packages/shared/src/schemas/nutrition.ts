import { z } from 'zod';

export const createNutritionEntrySchema = z.object({
  rawInput: z.string().min(1, 'Food description is required'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export const nutritionItemSchema = z.object({
  foodName: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  calories: z.number(),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
  sugarG: z.number(),
  sodiumMg: z.number(),
  saturatedFatG: z.number(),
  transFatG: z.number(),
  monounsaturatedFatG: z.number(),
  polyunsaturatedFatG: z.number(),
  cholesterolMg: z.number(),
  potassiumMg: z.number(),
  calciumMg: z.number(),
  ironMg: z.number(),
  vitaminAIug: z.number(),
  vitaminCMg: z.number(),
  vitaminDIug: z.number(),
  vitaminEMg: z.number(),
  vitaminKIug: z.number(),
  vitaminB6Mg: z.number(),
  vitaminB12Iug: z.number(),
  folateIug: z.number(),
  magnesiumMg: z.number(),
  zincMg: z.number(),
  phosphorusMg: z.number(),
  seleniumIug: z.number(),
  copperMg: z.number(),
  manganeseMg: z.number(),
});

export type CreateNutritionEntrySchema = z.infer<typeof createNutritionEntrySchema>;
export type NutritionItemSchema = z.infer<typeof nutritionItemSchema>;
