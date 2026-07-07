import type { User, Note, FinanceEntry, NutritionEntry, FinanceSummary } from '@kriya/shared';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockNote(overrides?: Partial<Note>): Note {
  return {
    id: 'note-1',
    userId: 'user-1',
    title: 'Test Note',
    description: 'A test note',
    tags: ['test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockFinanceEntry(overrides?: Partial<FinanceEntry>): FinanceEntry {
  return {
    id: 'finance-1',
    userId: 'user-1',
    type: 'debit',
    title: 'Groceries',
    description: 'Weekly groceries',
    amount: 2500,
    currency: 'INR',
    tags: ['groceries', 'food'],
    entryDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockFinanceSummary(overrides?: Partial<FinanceSummary>): FinanceSummary {
  return {
    totalCredits: 50000,
    totalDebits: 15000,
    balance: 35000,
    currency: 'INR',
    ...overrides,
  };
}

const defaultNutritionItemFields = {
  saturatedFatG: 0,
  transFatG: 0,
  monounsaturatedFatG: 0,
  polyunsaturatedFatG: 0,
  cholesterolMg: 0,
  potassiumMg: 0,
  calciumMg: 0,
  ironMg: 0,
  vitaminAIug: 0,
  vitaminCMg: 0,
  vitaminDIug: 0,
  vitaminEMg: 0,
  vitaminKIug: 0,
  vitaminB6Mg: 0,
  vitaminB12Iug: 0,
  folateIug: 0,
  magnesiumMg: 0,
  zincMg: 0,
  phosphorusMg: 0,
  seleniumIug: 0,
  copperMg: 0,
  manganeseMg: 0,
};

export function createMockNutritionEntry(overrides?: Partial<NutritionEntry>): NutritionEntry {
  return {
    id: 'nutrition-1',
    userId: 'user-1',
    rawInput: '2 eggs and toast',
    mealType: 'breakfast',
    entryDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    aiGenerated: true,
    items: [
      { id: 'item-1', foodName: 'Egg Omelette', quantity: 2, unit: 'piece', calories: 180, proteinG: 16, carbsG: 2, fatG: 12, fiberG: 0, sugarG: 1, sodiumMg: 300, ...defaultNutritionItemFields },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockAIConfig() {
  return {
    providers: [
      { id: 'mock', name: 'Mock AI', models: ['mock'] },
      { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
      { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet'] },
    ],
    configs: [
      { module: 'nutrition', aiEnabled: true, provider: 'mock', model: 'mock' },
      { module: 'notes', aiEnabled: false, provider: null, model: null },
    ],
    apiKeys: [
      { provider: 'openai', keyPreview: 'sk-...abcd', createdAt: new Date().toISOString() },
    ],
  };
}
