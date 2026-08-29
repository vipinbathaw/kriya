import db from '../config/database.js';
import knexLib from 'knex';
import { buildCursorWhere, buildPaginatedResponse } from '../utils/pagination.js';
import type { PaginatedResult } from '../utils/pagination.js';

const k = knexLib(db);

export interface FinanceRow {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  tags: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

function parseTags(row: FinanceRow): Omit<FinanceRow, 'tags'> & { tags: string[] } {
  const tags = Array.isArray(row.tags) ? row.tags : [];
  return { ...row, tags } as Omit<FinanceRow, 'tags'> & { tags: string[] };
}

const SELECT_COLS = [
  'id', 'user_id', 'type', 'title', 'description',
  'amount', 'currency', 'tags', 'entry_date', 'created_at', 'updated_at',
];

export const financeRepository = {
  async create(data: {
    id: string;
    user_id: string;
    type: 'credit' | 'debit';
    title: string;
    description: string | null;
    amount: number;
    currency: string;
    tags: string[];
    entry_date: string;
  }) {
    await k('finance_entries').insert({
      id: data.id,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      tags: JSON.stringify(data.tags),
      entry_date: data.entry_date,
    });

    if (data.tags.length > 0) {
      await k('finance_tags').insert(
        data.tags.map((tag) => ({
          id: crypto.randomUUID(),
          finance_entry_id: data.id,
          tag,
        })),
      );
    }

    const row = await k('finance_entries').where({ id: data.id }).first() as FinanceRow;
    return parseTags(row);
  },

  async findById(id: string, userId: string) {
    const row = await k('finance_entries')
      .select(SELECT_COLS)
      .where({ id, user_id: userId })
      .first() as FinanceRow | undefined;
    if (!row) return undefined;
    return parseTags(row);
  },

  async findByUser(
    userId: string,
    params: {
      cursor?: string; limit?: number; type?: string; tag?: string; from?: string; to?: string;
    },
  ): Promise<PaginatedResult<Omit<FinanceRow, 'tags'> & { tags: string[] }>> {
    const limit = Math.min(params.limit ?? 20, 100);
    let query = k('finance_entries').select(SELECT_COLS).where({ user_id: userId });

    const cursor = params.cursor ? buildCursorWhere(params.cursor) : null;
    if (cursor) {
      query = query.whereRaw(
        '(entry_date < ? OR (entry_date = ? AND created_at < ?) OR (entry_date = ? AND created_at = ? AND id < ?))',
        [
          cursor.entryDate ?? cursor.createdAt,
          cursor.entryDate ?? cursor.createdAt,
          cursor.createdAt,
          cursor.entryDate ?? cursor.createdAt,
          cursor.createdAt,
          cursor.id,
        ],
      );
    }

    if (params.type) {
      query = query.where({ type: params.type });
    }
    if (params.from) {
      query = query.where('entry_date', '>=', params.from);
    }
    if (params.to) {
      query = query.where('entry_date', '<=', params.to);
    }
    if (params.tag) {
      const entryIds = await k('finance_tags').where({ tag: params.tag }).select('finance_entry_id');
      const ids = entryIds.map((r: { finance_entry_id: string }) => r.finance_entry_id);
      query = query.whereIn('id', ids);
    }

    const rows = (await query
      .orderBy('entry_date', 'desc')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(limit + 1)) as FinanceRow[];

    const result = buildPaginatedResponse(rows, limit);
    return {
      data: result.data.map(parseTags),
      nextCursor: result.nextCursor,
    };
  },

  async getSummary(
    userId: string,
    params: { from?: string; to?: string },
  ): Promise<{ totalCredits: number; totalDebits: number; currency: string }> {
    let query = k('finance_entries').where({ user_id: userId });

    if (params.from) query = query.where('entry_date', '>=', params.from);
    if (params.to) query = query.where('entry_date', '<=', params.to);

    const rows = await query.select('type', 'amount', 'currency') as Pick<FinanceRow, 'type' | 'amount' | 'currency'>[];
    const currency = rows[0]?.currency ?? 'INR';

    const totalCredits = rows
      .filter((r) => r.type === 'credit')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const totalDebits = rows
      .filter((r) => r.type === 'debit')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return { totalCredits, totalDebits, currency };
  },

  async update(
    id: string,
    userId: string,
    data: {
      type?: string; title?: string; description?: string | null;
      amount?: number; currency?: string; tags?: string[]; entry_date?: string;
    },
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.entry_date !== undefined) updateData.entry_date = data.entry_date;

    if (Object.keys(updateData).length > 0) {
      await k('finance_entries').where({ id, user_id: userId }).update(updateData);
    }

    if (data.tags !== undefined) {
      await k('finance_tags').where({ finance_entry_id: id }).del();
      if (data.tags.length > 0) {
        await k('finance_tags').insert(
          data.tags.map((tag) => ({
            id: crypto.randomUUID(),
            finance_entry_id: id,
            tag,
          })),
        );
      }
    }

    return this.findById(id, userId);
  },

  async delete(id: string, userId: string) {
    await k('finance_entries').where({ id, user_id: userId }).del();
  },
};
