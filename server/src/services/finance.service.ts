import { randomUUID } from 'crypto';
import { financeRepository } from '../repositories/finance.repository.js';
import { generateSimpleTags } from './tag-generator.service.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { CreateFinanceEntryInput, FinanceEntry, FinanceSummary } from '@kriya/shared';

function toEntryResponse(row: Awaited<ReturnType<typeof financeRepository.findById>>): FinanceEntry {
  if (!row) throw new Error('Cannot transform null row');
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    amount: Number(row.amount),
    currency: row.currency,
    tags: row.tags,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const financeService = {
  async create(userId: string, data: CreateFinanceEntryInput): Promise<FinanceEntry> {
    const tags = generateSimpleTags(data.title);
    const row = await financeRepository.create({
      id: randomUUID(),
      user_id: userId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
      amount: data.amount,
      currency: data.currency ?? 'INR',
      tags,
      entry_date: data.entryDate ?? new Date().toISOString().split('T')[0],
    });
    return toEntryResponse(row);
  },

  async getById(id: string, userId: string): Promise<FinanceEntry> {
    const row = await financeRepository.findById(id, userId);
    if (!row) throw new NotFoundError('Finance entry');
    return toEntryResponse(row);
  },

  async list(userId: string, params: {
    cursor?: string; limit?: number; type?: string; tag?: string; from?: string; to?: string;
  }) {
    const result = await financeRepository.findByUser(userId, params);
    return {
      data: result.data.map(toEntryResponse),
      nextCursor: result.nextCursor,
    };
  },

  async getSummary(userId: string, params: { from?: string; to?: string }): Promise<FinanceSummary> {
    const summary = await financeRepository.getSummary(userId, params);
    return {
      totalCredits: summary.totalCredits,
      totalDebits: summary.totalDebits,
      balance: summary.totalCredits - summary.totalDebits,
      currency: summary.currency,
    };
  },

  async update(id: string, userId: string, data: Partial<CreateFinanceEntryInput>): Promise<FinanceEntry> {
    const existing = await financeRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Finance entry');

    const title = data.title ?? existing.title;
    const tags = generateSimpleTags(title);

    const updated = await financeRepository.update(id, userId, {
      type: data.type,
      title: data.title,
      description: data.description !== undefined ? data.description : undefined,
      amount: data.amount,
      currency: data.currency,
      tags,
      entry_date: data.entryDate,
    });

    return toEntryResponse(updated!);
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await financeRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Finance entry');
    await financeRepository.delete(id, userId);
  },
};
