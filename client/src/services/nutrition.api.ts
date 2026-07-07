import { apiRequest } from './api-client';
import type { NutritionEntry, CreateNutritionEntryInput, PaginatedResponse } from '@kriya/shared';

export const nutritionApi = {
  list: (params?: {
    cursor?: string; limit?: number; from?: string; to?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set('cursor', params.cursor);
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    const qs = search.toString();
    return apiRequest<PaginatedResponse<NutritionEntry>>(`/nutrition${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiRequest<NutritionEntry>(`/nutrition/${id}`),

  create: (data: CreateNutritionEntryInput) =>
    apiRequest<NutritionEntry>('/nutrition', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/nutrition/${id}`, { method: 'DELETE' }),
};
