import { http, HttpResponse } from 'msw';
import { createMockUser } from '../test-utils/mocks';

const BASE = '/api';

export const handlers = [
  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json({
      user: createMockUser(),
      accessToken: 'mock-access-token',
    });
  }),

  http.post(`${BASE}/auth/register`, () => {
    return HttpResponse.json({
      user: createMockUser(),
      accessToken: 'mock-access-token',
    });
  }),

  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json({ accessToken: 'mock-access-token' });
  }),

  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json(createMockUser());
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/notes`, () => {
    return HttpResponse.json({ data: [], nextCursor: null });
  }),

  http.get(`${BASE}/finance`, () => {
    return HttpResponse.json({ data: [], nextCursor: null });
  }),

  http.get(`${BASE}/finance/summary`, () => {
    return HttpResponse.json({ totalCredits: 0, totalDebits: 0, balance: 0, currency: 'INR' });
  }),

  http.get(`${BASE}/nutrition`, () => {
    return HttpResponse.json({ data: [], nextCursor: null });
  }),
];
