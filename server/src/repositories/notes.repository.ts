import db from '../config/database.js';
import knexLib from 'knex';
import { buildCursorWhere, buildPaginatedResponse } from '../utils/pagination.js';
import type { PaginatedResult } from '../utils/pagination.js';

const k = knexLib(db);

export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

function parseTags(row: NoteRow): Omit<NoteRow, 'tags'> & { tags: string[] } {
  const tags = Array.isArray(row.tags) ? row.tags : [];
  return { ...row, tags } as Omit<NoteRow, 'tags'> & { tags: string[] };
}

function toTagsJson(tags: string[]): string {
  return JSON.stringify(tags);
}

export const notesRepository = {
  async create(data: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    tags: string[];
  }): Promise<Omit<NoteRow, 'tags'> & { tags: string[] }> {
    await k('notes').insert({
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      tags: toTagsJson(data.tags),
    });

    if (data.tags.length > 0) {
      const tagRows = data.tags.map((tag) => ({
        id: crypto.randomUUID(),
        note_id: data.id,
        tag,
      }));
      await k('note_tags').insert(tagRows);
    }

    const row = await k('notes').where({ id: data.id }).first() as NoteRow;
    return parseTags(row);
  },

  async findById(id: string, userId: string): Promise<(Omit<NoteRow, 'tags'> & { tags: string[] }) | undefined> {
    const row = await k('notes').where({ id, user_id: userId }).first() as NoteRow | undefined;
    if (!row) return undefined;
    return parseTags(row);
  },

  async findByUser(
    userId: string,
    params: { cursor?: string; limit?: number; tag?: string },
  ): Promise<PaginatedResult<Omit<NoteRow, 'tags'> & { tags: string[] }>> {
    const limit = Math.min(params.limit ?? 20, 100);
    let query = k('notes').where({ user_id: userId });

    const cursor = params.cursor ? buildCursorWhere(params.cursor) : null;
    if (cursor) {
      query = query.whereRaw('(created_at < ? OR (created_at = ? AND id < ?))', [
        cursor.createdAt as string,
        cursor.createdAt as string,
        cursor.id as string,
      ]);
    }

    if (params.tag) {
      const noteIds = await k('note_tags').where({ tag: params.tag }).select('note_id');
      const ids = noteIds.map((r: { note_id: string }) => r.note_id);
      query = query.whereIn('id', ids);
    }

    const rows = (await query
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(limit + 1)) as NoteRow[];

    const result = buildPaginatedResponse(rows, limit);
    return {
      data: result.data.map(parseTags),
      nextCursor: result.nextCursor,
    };
  },

  async update(
    id: string,
    userId: string,
    data: { title?: string; description?: string | null; tags?: string[] },
  ): Promise<(Omit<NoteRow, 'tags'> & { tags: string[] }) | undefined> {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = toTagsJson(data.tags);

    if (Object.keys(updateData).length > 0) {
      await k('notes').where({ id, user_id: userId }).update(updateData);
    }

    if (data.tags !== undefined) {
      await k('note_tags').where({ note_id: id }).del();
      if (data.tags.length > 0) {
        const tagRows = data.tags.map((tag) => ({
          id: crypto.randomUUID(),
          note_id: id,
          tag,
        }));
        await k('note_tags').insert(tagRows);
      }
    }

    return this.findById(id, userId);
  },

  async delete(id: string, userId: string): Promise<void> {
    await k('notes').where({ id, user_id: userId }).del();
  },
};
