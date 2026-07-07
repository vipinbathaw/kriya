import { apiRequest } from './api-client';
import type { FinanceEntry, CreateFinanceEntryInput, FinanceSummary, PaginatedResponse } from '@kriya/shared';

export const financeApi = {
  list: (params?: {
    cursor?: string; limit?: number; type?: string; tag?: string; from?: string; to?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set('cursor', params.cursor);
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.type) search.set('type', params.type);
    if (params?.tag) search.set('tag', params.tag);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    const qs = search.toString();
    return apiRequest<PaginatedResponse<FinanceEntry>>(`/finance${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiRequest<FinanceEntry>(`/finance/${id}`),

  create: (data: CreateFinanceEntryInput) =>
    apiRequest<FinanceEntry>('/finance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: CreateFinanceEntryInput) =>
    apiRequest<FinanceEntry>(`/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/finance/${id}`, { method: 'DELETE' }),

  summary: (params?: { from?: string; to?: string }) => {
    const search = new URLSearchParams();
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    const qs = search.toString();
    return apiRequest<FinanceSummary>(`/finance/summary${qs ? `?${qs}` : ''}`);
  },
};
