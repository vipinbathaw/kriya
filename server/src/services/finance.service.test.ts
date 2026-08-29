import { describe, it, expect, vi, beforeEach } from 'vitest';
import { financeService } from './finance.service.js';
import { financeRepository } from '../repositories/finance.repository.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createMockFinanceEntry, createMockSummary } from '../test-utils/factory.js';

vi.mock('../repositories/finance.repository.js');
vi.mock('./ai-tag-generator.service.js', async () => {
  const { generateSimpleTags } = await vi.importActual<typeof import('./tag-generator.service.js')>('./tag-generator.service.js');
  return {
    generateTagsForModule: vi.fn(async (_userId: string, _module: string, title: string) => generateSimpleTags(title)),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('financeService', () => {
  const userId = 'user-1';

  describe('create', () => {
    it('generates tags from title and passes to repository', async () => {
      const mockEntry = createMockFinanceEntry({ user_id: userId });
      vi.mocked(financeRepository.create).mockResolvedValue(mockEntry);

      await financeService.create(userId, {
        type: 'debit',
        title: 'Monthly Rent',
        amount: 15000,
      });

      expect(financeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          title: 'Monthly Rent',
          tags: expect.arrayContaining(['monthly', 'rent']),
        }),
      );
    });

    it('defaults currency to INR', async () => {
      const mockEntry = createMockFinanceEntry({ user_id: userId, currency: 'INR' });
      vi.mocked(financeRepository.create).mockResolvedValue(mockEntry);

      await financeService.create(userId, {
        type: 'credit',
        title: 'Salary',
        amount: 50000,
      });

      expect(financeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'INR' }),
      );
    });
  });

  describe('getById', () => {
    it('returns an entry by id', async () => {
      const mockEntry = createMockFinanceEntry({ user_id: userId });
      vi.mocked(financeRepository.findById).mockResolvedValue(mockEntry);

      const result = await financeService.getById(mockEntry.id, userId);
      expect(result.id).toBe(mockEntry.id);
      expect(result.amount).toBe(mockEntry.amount);
    });

    it('throws NotFoundError when entry does not exist', async () => {
      vi.mocked(financeRepository.findById).mockResolvedValue(undefined);
      await expect(financeService.getById('nonexistent', userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('returns paginated entries', async () => {
      const mockEntries = [
        createMockFinanceEntry({ user_id: userId }),
        createMockFinanceEntry({ user_id: userId }),
      ];
      vi.mocked(financeRepository.findByUser).mockResolvedValue({
        data: mockEntries,
        nextCursor: null,
      });

      const result = await financeService.list(userId, { limit: 10 });
      expect(result.data).toHaveLength(2);
    });

    it('passes filter params to repository', async () => {
      vi.mocked(financeRepository.findByUser).mockResolvedValue({
        data: [],
        nextCursor: null,
      });

      await financeService.list(userId, {
        type: 'debit',
        from: '2025-01-01',
        to: '2025-06-30',
        tag: 'food',
      });

      expect(financeRepository.findByUser).toHaveBeenCalledWith(userId, {
        type: 'debit',
        from: '2025-01-01',
        to: '2025-06-30',
        tag: 'food',
      });
    });
  });

  describe('getSummary', () => {
    it('returns calculated summary', async () => {
      const mockSummary = createMockSummary({ totalCredits: 50000, totalDebits: 15000 });
      vi.mocked(financeRepository.getSummary).mockResolvedValue(mockSummary);

      const result = await financeService.getSummary(userId, {});
      expect(result.totalCredits).toBe(50000);
      expect(result.totalDebits).toBe(15000);
      expect(result.balance).toBe(35000);
      expect(result.currency).toBe('INR');
    });
  });

  describe('update', () => {
    it('updates an existing entry', async () => {
      const existing = createMockFinanceEntry({ user_id: userId, title: 'Old Title' });
      const updated = createMockFinanceEntry({
        user_id: userId,
        id: existing.id,
        title: 'New Car Expense',
        amount: 5000,
      });

      vi.mocked(financeRepository.findById).mockResolvedValue(existing);
      vi.mocked(financeRepository.update).mockResolvedValue(updated);

      const result = await financeService.update(existing.id, userId, { title: 'New Car Expense', amount: 5000 });
      expect(result.title).toBe('New Car Expense');
      expect(result.amount).toBe(5000);
    });

    it('throws NotFoundError when entry does not exist', async () => {
      vi.mocked(financeRepository.findById).mockResolvedValue(undefined);
      await expect(
        financeService.update('nonexistent', userId, { title: 'New' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('deletes an existing entry', async () => {
      const mockEntry = createMockFinanceEntry({ user_id: userId });
      vi.mocked(financeRepository.findById).mockResolvedValue(mockEntry);
      vi.mocked(financeRepository.delete).mockResolvedValue(undefined);

      await financeService.delete(mockEntry.id, userId);
      expect(financeRepository.delete).toHaveBeenCalledWith(mockEntry.id, userId);
    });

    it('throws NotFoundError when entry does not exist', async () => {
      vi.mocked(financeRepository.findById).mockResolvedValue(undefined);
      await expect(financeService.delete('nonexistent', userId)).rejects.toThrow(NotFoundError);
    });
  });
});
