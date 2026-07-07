import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export function createMockUser(overrides?: Partial<{
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  avatar_url: string | null;
  email_verified: number;
  email_verify_token: string | null;
  created_at: string;
  updated_at: string;
}>) {
  return {
    id: randomUUID(),
    email: 'test@example.com',
    display_name: 'Test User',
    password_hash: bcrypt.hashSync('password123', 1),
    avatar_url: null,
    email_verified: 1,
    email_verify_token: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockNote(overrides?: Partial<{
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}>) {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    title: 'Test Note',
    description: 'A test note description',
    tags: ['test', 'mock'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockFinanceEntry(overrides?: Partial<{
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  tags: string[];
  entry_date: string;
  created_at: string;
  updated_at: string;
}>) {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    type: 'debit' as const,
    title: 'Groceries',
    description: 'Weekly groceries',
    amount: 2500,
    currency: 'INR',
    tags: ['groceries', 'food'],
    entry_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockNutritionEntry(overrides?: Partial<{
  id: string;
  user_id: string;
  raw_input: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  entry_date: string;
  ai_generated: boolean;
  items: Array<{
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
  }>;
  created_at: string;
  updated_at: string;
}>) {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    raw_input: '2 eggs and toast',
    meal_type: 'breakfast' as const,
    entry_date: new Date().toISOString().split('T')[0],
    ai_generated: true,
    items: [
      { foodName: 'Egg Omelette', quantity: 2, unit: 'piece', calories: 180, proteinG: 16, carbsG: 2, fatG: 12, fiberG: 0, sugarG: 1, sodiumMg: 300 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockRefreshToken(overrides?: Partial<{
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}>) {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    token_hash: 'a'.repeat(64),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockSummary(overrides?: Partial<{
  totalCredits: number;
  totalDebits: number;
  currency: string;
}>) {
  return {
    totalCredits: 10000,
    totalDebits: 4000,
    currency: 'INR',
    ...overrides,
  };
}
