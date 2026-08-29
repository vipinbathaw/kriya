import { describe, it, expect, vi, afterEach } from 'vitest';
import { DeepSeekProvider } from './deepseek.provider.js';
import { aiAdapter } from '../adapter.js';

describe('DeepSeekProvider', () => {
  const provider = new DeepSeekProvider();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is registered in the adapter', () => {
    expect(aiAdapter.listProviders().map((p) => p.id)).toContain('deepseek');
  });

  it('calls the DeepSeek chat completions endpoint with the selected model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '["rent","monthly","expense"]' } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const tags = await provider.generateTags({
      title: 'Monthly Rent',
      module: 'finance',
      apiKey: 'sk-deepseek-test',
      model: 'deepseek-v4-flash',
    });

    expect(tags).toEqual(['rent', 'monthly', 'expense']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.deepseek.com/chat/completions');
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe('deepseek-v4-flash');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-deepseek-test');
  });

  it('falls back to the default model when none is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '["food","grocery"]' } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await provider.generateTags({ title: 'Grocery run', module: 'notes', apiKey: 'sk-deepseek-test', model: '' });

    const body = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body.model).toBe('deepseek-v4-flash');
  });

  it('surfaces API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
    }));

    await expect(
      provider.parseNutrition({ rawInput: '2 eggs', apiKey: 'bad-key', model: 'deepseek-v4-flash' }),
    ).rejects.toThrow(/Invalid API key/);
  });
});
