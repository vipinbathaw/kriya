export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type NutritionEntryStatus = 'pending' | 'completed' | 'failed';

export interface NutritionItem {
  id: string;
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

export interface NutritionEntry {
  id: string;
  userId: string;
  rawInput: string;
  mealType: MealType;
  entryDate: string;
  status: NutritionEntryStatus;
  items: NutritionItem[];
  aiGenerated: boolean;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNutritionEntryInput {
  rawInput: string;
  mealType: MealType;
  entryDate?: string;
}
