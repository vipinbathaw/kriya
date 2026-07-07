import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nutritionService } from './nutrition.service.js';
import { nutritionRepository } from '../repositories/nutrition.repository.js';
import { NotFoundError } from '../middleware/errorHandler.js';

vi.mock('../repositories/nutrition.repository.js');
vi.mock('../repositories/ai-config.repository.js');
vi.mock('../repositories/api-key.repository.js');
vi.mock('../ai/adapter.js');

type ItemsShape = {
  id: string; foodName: string; quantity: number; unit: string; calories: number;
  proteinG: number; carbsG: number; fatG: number; fiberG: number; sugarG: number; sodiumMg: number;
  saturatedFatG: number; transFatG: number; monounsaturatedFatG: number; polyunsaturatedFatG: number;
  cholesterolMg: number; potassiumMg: number; calciumMg: number; ironMg: number;
  vitaminAIug: number; vitaminCMg: number; vitaminDIug: number; vitaminEMg: number; vitaminKIug: number;
  vitaminB6Mg: number; vitaminB12Iug: number; folateIug: number;
  magnesiumMg: number; zincMg: number; phosphorusMg: number; seleniumIug: number; copperMg: number; manganeseMg: number;
};

function createMockData(rawInput: string, items: ItemsShape[]) {
  return {
    entry: {
      id: 'entry-1',
      user_id: 'user-1',
      raw_input: rawInput,
      meal_type: 'breakfast',
      entry_date: '2025-06-01',
      status: 'pending',
      error_message: null,
      ai_generated: 1 as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    items,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('nutritionService', () => {
  const userId = 'user-1';

  describe('create', () => {
    it('creates a pending nutrition entry without calling AI', async () => {
      const mockData = createMockData('2 eggs and toast', []);
      vi.mocked(nutritionRepository.create).mockResolvedValue(mockData);

      const result = await nutritionService.create(userId, {
        rawInput: '2 eggs and toast',
        mealType: 'breakfast',
      });

      expect(result.rawInput).toBe('2 eggs and toast');
      expect(result.status).toBe('pending');
      expect(result.items).toHaveLength(0);
    });

    it('inserts entry with provided date', async () => {
      const mockData = createMockData('rice and dal', []);
      vi.mocked(nutritionRepository.create).mockResolvedValue(mockData);

      await nutritionService.create(userId, {
        rawInput: 'rice and dal',
        mealType: 'lunch',
        entryDate: '2025-07-01',
      });

      expect(nutritionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: userId, raw_input: 'rice and dal', entry_date: '2025-07-01' }),
      );
    });
  });

  describe('getById', () => {
    it('returns a nutrition entry by id', async () => {
      const mockData = createMockData('rice', []);
      vi.mocked(nutritionRepository.findById).mockResolvedValue(mockData);

      const result = await nutritionService.getById('entry-1', userId);
      expect(result.id).toBe('entry-1');
    });

    it('throws NotFoundError when entry does not exist', async () => {
      vi.mocked(nutritionRepository.findById).mockResolvedValue(undefined);
      await expect(nutritionService.getById('nonexistent', userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('returns paginated entries', async () => {
      const mockData = createMockData('rice', []);
      vi.mocked(nutritionRepository.findByUser).mockResolvedValue({
        data: [mockData, mockData],
        nextCursor: null,
      });

      const result = await nutritionService.list(userId, { limit: 10 });
      expect(result.data).toHaveLength(2);
    });

    it('filters by mealType', async () => {
      vi.mocked(nutritionRepository.findByUser).mockResolvedValue({
        data: [],
        nextCursor: null,
      });

      await nutritionService.list(userId, { mealType: 'breakfast' });
      expect(nutritionRepository.findByUser).toHaveBeenCalledWith(userId, { mealType: 'breakfast' });
    });
  });

  describe('delete', () => {
    it('deletes an existing entry', async () => {
      const mockData = createMockData('rice', []);
      vi.mocked(nutritionRepository.findById).mockResolvedValue(mockData);
      vi.mocked(nutritionRepository.delete).mockResolvedValue(undefined);

      await nutritionService.delete('entry-1', userId);
      expect(nutritionRepository.delete).toHaveBeenCalledWith('entry-1', userId);
    });

    it('throws NotFoundError when entry does not exist', async () => {
      vi.mocked(nutritionRepository.findById).mockResolvedValue(undefined);
      await expect(nutritionService.delete('nonexistent', userId)).rejects.toThrow(NotFoundError);
    });
  });
});
