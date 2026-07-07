import { randomUUID } from 'crypto';
import { nutritionRepository } from '../repositories/nutrition.repository.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { CreateNutritionEntryInput, NutritionEntry } from '@kriya/shared';

function toEntryResponse(data: Awaited<ReturnType<typeof nutritionRepository.findById>>): NutritionEntry {
  if (!data) throw new Error('Cannot transform null');
  return {
    id: data.entry.id,
    userId: data.entry.user_id,
    rawInput: data.entry.raw_input,
    mealType: data.entry.meal_type as NutritionEntry['mealType'],
    entryDate: data.entry.entry_date,
    status: data.entry.status as NutritionEntry['status'],
    items: data.items,
    aiGenerated: !!data.entry.ai_generated,
    errorMessage: data.entry.error_message ?? undefined,
    createdAt: data.entry.created_at,
    updatedAt: data.entry.updated_at,
  };
}

export const nutritionService = {
  async create(userId: string, data: CreateNutritionEntryInput): Promise<NutritionEntry> {
    const result = await nutritionRepository.create({
      id: randomUUID(),
      user_id: userId,
      raw_input: data.rawInput,
      meal_type: data.mealType,
      entry_date: data.entryDate ?? new Date().toISOString().split('T')[0],
    });

    return toEntryResponse(result);
  },

  async getById(id: string, userId: string): Promise<NutritionEntry> {
    const result = await nutritionRepository.findById(id, userId);
    if (!result) throw new NotFoundError('Nutrition entry');
    return toEntryResponse(result);
  },

  async list(userId: string, params: {
    cursor?: string; limit?: number; from?: string; to?: string; mealType?: string;
  }) {
    const result = await nutritionRepository.findByUser(userId, params);
    return {
      data: result.data.map(toEntryResponse),
      nextCursor: result.nextCursor,
    };
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await nutritionRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Nutrition entry');
    await nutritionRepository.delete(id, userId);
  },
};
