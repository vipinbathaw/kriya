import { z } from 'zod';

export const nutritionResultSchema = z.object({
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

export const tagsResponseSchema = z.array(z.string());

export const nutritionResponseSchema = z.array(nutritionResultSchema);

export interface NutritionResult {
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  saturatedFatG: number;
  transFatG: number;
  monounsaturatedFatG: number;
  polyunsaturatedFatG: number;
  cholesterolMg: number;
  potassiumMg: number;
  calciumMg: number;
  ironMg: number;
  vitaminAIug: number;
  vitaminCMg: number;
  vitaminDIug: number;
  vitaminEMg: number;
  vitaminKIug: number;
  vitaminB6Mg: number;
  vitaminB12Iug: number;
  folateIug: number;
  magnesiumMg: number;
  zincMg: number;
  phosphorusMg: number;
  seleniumIug: number;
  copperMg: number;
  manganeseMg: number;
}

export interface TagGenerationParams {
  title: string;
  description?: string;
  module: 'notes' | 'finance';
  apiKey: string;
  model: string;
}

export interface NutritionParseParams {
  rawInput: string;
  apiKey: string;
  model: string;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;

  generateTags(params: TagGenerationParams): Promise<string[]>;
  parseNutrition(params: NutritionParseParams): Promise<NutritionResult[]>;
}
