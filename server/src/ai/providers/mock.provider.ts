import type { AIProvider, NutritionResult } from '../types.js';

export class MockAIProvider implements AIProvider {
  readonly id = 'mock';
  readonly name = 'Mock AI (Development)';

  async generateTags(): Promise<string[]> {
    return ['tag1', 'tag2', 'tag3'];
  }

  async parseNutrition(params: { rawInput: string }): Promise<NutritionResult[]> {
    const lower = params.rawInput.toLowerCase();

    if (lower.includes('kadhai') || lower.includes('paneer')) {
      return [
        { foodName: 'Kadhai Paneer', quantity: 1, unit: 'serving', calories: 320, proteinG: 18, carbsG: 12, fatG: 24, fiberG: 3, sugarG: 4, sodiumMg: 620, saturatedFatG: 12, transFatG: 0.5, monounsaturatedFatG: 6, polyunsaturatedFatG: 2, cholesterolMg: 65, potassiumMg: 280, calciumMg: 380, ironMg: 2.5, vitaminAIug: 180, vitaminCMg: 12, vitaminDIug: 0.5, vitaminEMg: 1.2, vitaminKIug: 8, vitaminB6Mg: 0.3, vitaminB12Iug: 0.8, folateIug: 45, magnesiumMg: 40, zincMg: 2.8, phosphorusMg: 320, seleniumIug: 22, copperMg: 0.3, manganeseMg: 0.4 },
        { foodName: 'Roti', quantity: 4, unit: 'piece', calories: 320, proteinG: 12, carbsG: 64, fatG: 4, fiberG: 8, sugarG: 2, sodiumMg: 80, saturatedFatG: 0.6, transFatG: 0, monounsaturatedFatG: 1.2, polyunsaturatedFatG: 1.6, cholesterolMg: 0, potassiumMg: 120, calciumMg: 40, ironMg: 3.2, vitaminAIug: 0, vitaminCMg: 0, vitaminDIug: 0, vitaminEMg: 0.4, vitaminKIug: 1, vitaminB6Mg: 0.1, vitaminB12Iug: 0, folateIug: 60, magnesiumMg: 30, zincMg: 1.2, phosphorusMg: 100, seleniumIug: 18, copperMg: 0.2, manganeseMg: 0.6 },
      ];
    }

    if (lower.includes('rice') || lower.includes('dal') || lower.includes('daal')) {
      return [
        { foodName: 'Rice', quantity: 1, unit: 'bowl', calories: 240, proteinG: 5, carbsG: 53, fatG: 0.4, fiberG: 1, sugarG: 0.1, sodiumMg: 2, saturatedFatG: 0.1, transFatG: 0, monounsaturatedFatG: 0.1, polyunsaturatedFatG: 0.1, cholesterolMg: 0, potassiumMg: 55, calciumMg: 10, ironMg: 1.2, vitaminAIug: 0, vitaminCMg: 0, vitaminDIug: 0, vitaminEMg: 0, vitaminKIug: 0, vitaminB6Mg: 0.1, vitaminB12Iug: 0, folateIug: 90, magnesiumMg: 15, zincMg: 0.6, phosphorusMg: 60, seleniumIug: 8, copperMg: 0.1, manganeseMg: 0.3 },
        { foodName: 'Dal', quantity: 1, unit: 'bowl', calories: 180, proteinG: 12, carbsG: 24, fatG: 5, fiberG: 6, sugarG: 1, sodiumMg: 400, saturatedFatG: 0.8, transFatG: 0, monounsaturatedFatG: 2, polyunsaturatedFatG: 1.5, cholesterolMg: 0, potassiumMg: 350, calciumMg: 30, ironMg: 2.8, vitaminAIug: 10, vitaminCMg: 3, vitaminDIug: 0, vitaminEMg: 0.5, vitaminKIug: 5, vitaminB6Mg: 0.2, vitaminB12Iug: 0, folateIug: 120, magnesiumMg: 55, zincMg: 1.5, phosphorusMg: 180, seleniumIug: 6, copperMg: 0.3, manganeseMg: 0.4 },
      ];
    }

    if (lower.includes('egg') || lower.includes('omelette')) {
      return [
        { foodName: 'Egg Omelette', quantity: 2, unit: 'piece', calories: 180, proteinG: 16, carbsG: 2, fatG: 12, fiberG: 0, sugarG: 1, sodiumMg: 300, saturatedFatG: 3.5, transFatG: 0, monounsaturatedFatG: 5, polyunsaturatedFatG: 2, cholesterolMg: 370, potassiumMg: 140, calciumMg: 50, ironMg: 1.5, vitaminAIug: 240, vitaminCMg: 0, vitaminDIug: 2, vitaminEMg: 0.5, vitaminKIug: 0.5, vitaminB6Mg: 0.2, vitaminB12Iug: 1.2, folateIug: 45, magnesiumMg: 12, zincMg: 1.2, phosphorusMg: 200, seleniumIug: 30, copperMg: 0.1, manganeseMg: 0 },
      ];
    }

    return [
      { foodName: params.rawInput, quantity: 1, unit: 'serving', calories: 200, proteinG: 10, carbsG: 20, fatG: 8, fiberG: 3, sugarG: 2, sodiumMg: 300, saturatedFatG: 2, transFatG: 0.1, monounsaturatedFatG: 3, polyunsaturatedFatG: 1.5, cholesterolMg: 30, potassiumMg: 200, calciumMg: 50, ironMg: 1.5, vitaminAIug: 50, vitaminCMg: 5, vitaminDIug: 0.5, vitaminEMg: 0.8, vitaminKIug: 10, vitaminB6Mg: 0.2, vitaminB12Iug: 0.3, folateIug: 30, magnesiumMg: 30, zincMg: 1, phosphorusMg: 120, seleniumIug: 10, copperMg: 0.2, manganeseMg: 0.3 },
    ];
  }
}
