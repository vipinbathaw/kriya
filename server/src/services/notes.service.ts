import { randomUUID } from 'crypto';
import { notesRepository } from '../repositories/notes.repository.js';
import { generateTagsForModule } from './ai-tag-generator.service.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { CreateNoteInput, UpdateNoteInput, Note } from '@kriya/shared';

function toNoteResponse(row: Awaited<ReturnType<typeof notesRepository.findById>>): Note {
  if (!row) throw new Error('Cannot transform null row');
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const notesService = {
  async create(userId: string, data: CreateNoteInput): Promise<Note> {
    const tags = await generateTagsForModule(userId, 'notes', data.title, data.description);
    const row = await notesRepository.create({
      id: randomUUID(),
      user_id: userId,
      title: data.title,
      description: data.description ?? null,
      tags,
    });
    return toNoteResponse(row);
  },

  async getById(id: string, userId: string): Promise<Note> {
    const row = await notesRepository.findById(id, userId);
    if (!row) throw new NotFoundError('Note');
    return toNoteResponse(row);
  },

  async list(userId: string, params: { cursor?: string; limit?: number; tag?: string }) {
    const result = await notesRepository.findByUser(userId, params);
    return {
      data: result.data.map(toNoteResponse),
      nextCursor: result.nextCursor,
    };
  },

  async update(id: string, userId: string, data: UpdateNoteInput): Promise<Note> {
    const existing = await notesRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Note');

    const title = data.title ?? existing.title;
    const tags = await generateTagsForModule(userId, 'notes', title, data.description ?? existing.description ?? undefined);

    const updated = await notesRepository.update(id, userId, {
      title: data.title,
      description: data.description !== undefined ? data.description : undefined,
      tags,
    });

    return toNoteResponse(updated!);
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await notesRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Note');
    await notesRepository.delete(id, userId);
  },
};
