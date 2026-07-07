import { apiRequest } from './api-client';
import type { Note, CreateNoteInput, UpdateNoteInput, PaginatedResponse } from '@kriya/shared';

export const notesApi = {
  list: (params?: { cursor?: string; limit?: number; tag?: string }) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set('cursor', params.cursor);
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.tag) search.set('tag', params.tag);
    const qs = search.toString();
    return apiRequest<PaginatedResponse<Note>>(`/notes${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiRequest<Note>(`/notes/${id}`),

  create: (data: CreateNoteInput) =>
    apiRequest<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateNoteInput) =>
    apiRequest<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/notes/${id}`, { method: 'DELETE' }),
};
