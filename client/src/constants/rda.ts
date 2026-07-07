export interface RdaNutrient {
  key: string;
  label: string;
  target: number;
  unit: string;
  max?: boolean;
  color: string;
}

export const RDA_STANDARDS: RdaNutrient[] = [
  { key: 'calories', label: 'Calories', target: 2000, unit: 'kcal', color: '#f59e0b' },
  { key: 'proteinG', label: 'Protein', target: 50, unit: 'g', color: '#ef4444' },
  { key: 'carbsG', label: 'Carbs', target: 300, unit: 'g', color: '#3b82f6' },
  { key: 'fatG', label: 'Fat', target: 65, unit: 'g', color: '#8b5cf6' },
  { key: 'fiberG', label: 'Fiber', target: 25, unit: 'g', color: '#10b981' },
  { key: 'sugarG', label: 'Sugar', target: 50, unit: 'g', max: true, color: '#ec4899' },
  { key: 'sodiumMg', label: 'Sodium', target: 2300, unit: 'mg', max: true, color: '#6366f1' },
];

export const RDA_FULL: RdaNutrient[] = [
  { key: 'calories', label: 'Calories', target: 2000, unit: 'kcal', color: '#f59e0b' },
  { key: 'proteinG', label: 'Protein', target: 50, unit: 'g', color: '#ef4444' },
  { key: 'carbsG', label: 'Carbs', target: 300, unit: 'g', color: '#3b82f6' },
  { key: 'fatG', label: 'Fat', target: 65, unit: 'g', color: '#8b5cf6' },
  { key: 'fiberG', label: 'Fiber', target: 25, unit: 'g', color: '#10b981' },
  { key: 'sugarG', label: 'Sugar', target: 50, unit: 'g', max: true, color: '#ec4899' },
  { key: 'saturatedFatG', label: 'Saturated Fat', target: 20, unit: 'g', max: true, color: '#f97316' },
  { key: 'transFatG', label: 'Trans Fat', target: 2, unit: 'g', max: true, color: '#dc2626' },
  { key: 'monounsaturatedFatG', label: 'Monounsaturated Fat', target: 20, unit: 'g', color: '#a855f7' },
  { key: 'polyunsaturatedFatG', label: 'Polyunsaturated Fat', target: 20, unit: 'g', color: '#06b6d4' },
  { key: 'cholesterolMg', label: 'Cholesterol', target: 300, unit: 'mg', max: true, color: '#ef4444' },
  { key: 'sodiumMg', label: 'Sodium', target: 2300, unit: 'mg', max: true, color: '#6366f1' },
  { key: 'potassiumMg', label: 'Potassium', target: 4700, unit: 'mg', color: '#8b5cf6' },
  { key: 'calciumMg', label: 'Calcium', target: 1000, unit: 'mg', color: '#d97706' },
  { key: 'ironMg', label: 'Iron', target: 18, unit: 'mg', color: '#dc2626' },
  { key: 'vitaminAIug', label: 'Vitamin A', target: 900, unit: '\u00b5g', color: '#f59e0b' },
  { key: 'vitaminCMg', label: 'Vitamin C', target: 90, unit: 'mg', color: '#10b981' },
  { key: 'vitaminDIug', label: 'Vitamin D', target: 15, unit: '\u00b5g', color: '#eab308' },
  { key: 'vitaminEMg', label: 'Vitamin E', target: 15, unit: 'mg', color: '#84cc16' },
  { key: 'vitaminKIug', label: 'Vitamin K', target: 120, unit: '\u00b5g', color: '#22c55e' },
  { key: 'vitaminB6Mg', label: 'Vitamin B6', target: 1.7, unit: 'mg', color: '#a855f7' },
  { key: 'vitaminB12Iug', label: 'Vitamin B12', target: 2.4, unit: '\u00b5g', color: '#ec4899' },
  { key: 'folateIug', label: 'Folate', target: 400, unit: '\u00b5g', color: '#06b6d4' },
  { key: 'magnesiumMg', label: 'Magnesium', target: 420, unit: 'mg', color: '#059669' },
  { key: 'zincMg', label: 'Zinc', target: 11, unit: 'mg', color: '#7c3aed' },
  { key: 'phosphorusMg', label: 'Phosphorus', target: 700, unit: 'mg', color: '#0284c7' },
  { key: 'seleniumIug', label: 'Selenium', target: 55, unit: '\u00b5g', color: '#0d9488' },
  { key: 'copperMg', label: 'Copper', target: 0.9, unit: 'mg', color: '#b45309' },
  { key: 'manganeseMg', label: 'Manganese', target: 2.3, unit: 'mg', color: '#4d7c0f' },
];

export const RDA_BY_KEY = Object.fromEntries(
  RDA_FULL.map((n) => [n.key, n]),
) as Record<string, RdaNutrient>;
