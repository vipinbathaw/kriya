import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notesService } from './notes.service.js';
import { notesRepository } from '../repositories/notes.repository.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createMockNote } from '../test-utils/factory.js';

vi.mock('../repositories/notes.repository.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notesService', () => {
  const userId = 'user-1';

  describe('create', () => {
    it('generates tags from title and passes to repository', async () => {
      const mockNote = createMockNote({ user_id: userId });
      vi.mocked(notesRepository.create).mockResolvedValue(mockNote);

      await notesService.create(userId, {
        title: 'Weekly Grocery Shopping',
        description: 'Buy vegetables',
      });

      expect(notesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          title: 'Weekly Grocery Shopping',
          tags: expect.arrayContaining(['weekly', 'grocery', 'shopping']),
        }),
      );
    });
  });

  describe('getById', () => {
    it('returns a note by id', async () => {
      const mockNote = createMockNote({ user_id: userId });
      vi.mocked(notesRepository.findById).mockResolvedValue(mockNote);

      const result = await notesService.getById(mockNote.id, userId);
      expect(result.id).toBe(mockNote.id);
      expect(result.title).toBe(mockNote.title);
    });

    it('throws NotFoundError when note does not exist', async () => {
      vi.mocked(notesRepository.findById).mockResolvedValue(undefined);
      await expect(notesService.getById('nonexistent', userId)).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError when note belongs to another user', async () => {
      vi.mocked(notesRepository.findById).mockResolvedValue(undefined);
      await expect(notesService.getById('note-1', 'other-user')).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('returns paginated notes', async () => {
      const mockNotes = [
        createMockNote({ user_id: userId, title: 'Note 1' }),
        createMockNote({ user_id: userId, title: 'Note 2' }),
      ];
      vi.mocked(notesRepository.findByUser).mockResolvedValue({
        data: mockNotes,
        nextCursor: null,
      });

      const result = await notesService.list(userId, { limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it('returns nextCursor when more results', async () => {
      const mockNotes = Array.from({ length: 3 }, (_, i) => createMockNote({
        user_id: userId,
        id: `note-${i}`,
        title: `Note ${i}`,
      }));
      vi.mocked(notesRepository.findByUser).mockResolvedValue({
        data: mockNotes,
        nextCursor: 'next-cursor-value',
      });

      const result = await notesService.list(userId, { limit: 2 });
      expect(result.data).toHaveLength(3);
      expect(result.nextCursor).toBe('next-cursor-value');
    });
  });

  describe('update', () => {
    it('updates a note title and regenerates tags', async () => {
      const existingNote = createMockNote({ user_id: userId, title: 'Old Title', tags: ['old'] });
      const updatedNote = createMockNote({
        user_id: userId,
        id: existingNote.id,
        title: 'New Meeting Notes',
        tags: ['new', 'meeting', 'notes'],
      });

      vi.mocked(notesRepository.findById).mockResolvedValue(existingNote);
      vi.mocked(notesRepository.update).mockResolvedValue(updatedNote);

      const result = await notesService.update(existingNote.id, userId, { title: 'New Meeting Notes' });
      expect(result.title).toBe('New Meeting Notes');
      expect(result.tags).toContain('meeting');
    });

    it('throws NotFoundError when note does not exist', async () => {
      vi.mocked(notesRepository.findById).mockResolvedValue(undefined);
      await expect(
        notesService.update('nonexistent', userId, { title: 'New Title' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('deletes an existing note', async () => {
      const mockNote = createMockNote({ user_id: userId });
      vi.mocked(notesRepository.findById).mockResolvedValue(mockNote);
      vi.mocked(notesRepository.delete).mockResolvedValue(undefined);

      await notesService.delete(mockNote.id, userId);
      expect(notesRepository.delete).toHaveBeenCalledWith(mockNote.id, userId);
    });

    it('throws NotFoundError when note does not exist', async () => {
      vi.mocked(notesRepository.findById).mockResolvedValue(undefined);
      await expect(notesService.delete('nonexistent', userId)).rejects.toThrow(NotFoundError);
    });
  });
});
