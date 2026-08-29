import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTagsForModule } from './ai-tag-generator.service.js';
import { aiConfigRepository } from '../repositories/ai-config.repository.js';
import { apiKeyRepository } from '../repositories/api-key.repository.js';
import { aiAdapter } from '../ai/adapter.js';

vi.mock('../repositories/ai-config.repository.js');
vi.mock('../repositories/api-key.repository.js');
vi.mock('../ai/adapter.js', () => ({
  aiAdapter: {
    getProvider: vi.fn(),
  },
}));

const mockProvider = {
  defaultModel: 'gpt-4o-mini',
  generateTags: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(aiAdapter.getProvider).mockReturnValue(mockProvider as never);
});

describe('generateTagsForModule', () => {
  it('uses rule-based tags when AI is disabled', async () => {
    vi.mocked(aiConfigRepository.findByUserAndModule).mockResolvedValue(undefined);
    const tags = await generateTagsForModule('user-1', 'notes', 'Weekly Grocery Shopping');
    expect(tags).toContain('weekly');
    expect(tags).toContain('grocery');
    expect(mockProvider.generateTags).not.toHaveBeenCalled();
  });

  it('uses rule-based tags when AI is enabled but no API key exists', async () => {
    vi.mocked(aiConfigRepository.findByUserAndModule).mockResolvedValue({
      id: 'cfg',
      user_id: 'user-1',
      module: 'notes',
      ai_enabled: 1,
      provider: 'openai',
      model: null,
      created_at: '',
      updated_at: '',
    });
    vi.mocked(apiKeyRepository.getDecryptedKey).mockResolvedValue(null);

    const tags = await generateTagsForModule('user-1', 'notes', 'Weekly Grocery Shopping');
    expect(tags).toContain('grocery');
    expect(mockProvider.generateTags).not.toHaveBeenCalled();
  });

  it('calls the AI provider with the decrypted key and model when configured', async () => {
    vi.mocked(aiConfigRepository.findByUserAndModule).mockResolvedValue({
      id: 'cfg',
      user_id: 'user-1',
      module: 'notes',
      ai_enabled: 1,
      provider: 'openai',
      model: 'gpt-4o',
      created_at: '',
      updated_at: '',
    });
    vi.mocked(apiKeyRepository.getDecryptedKey).mockResolvedValue('sk-secret-key');
    vi.mocked(mockProvider.generateTags).mockResolvedValue(['Grocery', 'Weekly', 'Shopping']);

    const tags = await generateTagsForModule('user-1', 'notes', 'Weekly Grocery Shopping', 'Buy vegetables');

    expect(mockProvider.generateTags).toHaveBeenCalledWith({
      title: 'Weekly Grocery Shopping',
      description: 'Buy vegetables',
      module: 'notes',
      apiKey: 'sk-secret-key',
      model: 'gpt-4o',
    });
    expect(tags).toEqual(['grocery', 'weekly', 'shopping']);
  });

  it('falls back to rule-based tags when the AI call fails', async () => {
    vi.mocked(aiConfigRepository.findByUserAndModule).mockResolvedValue({
      id: 'cfg',
      user_id: 'user-1',
      module: 'finance',
      ai_enabled: 1,
      provider: 'openai',
      model: null,
      created_at: '',
      updated_at: '',
    });
    vi.mocked(apiKeyRepository.getDecryptedKey).mockResolvedValue('sk-secret-key');
    vi.mocked(mockProvider.generateTags).mockRejectedValue(new Error('API down'));

    const tags = await generateTagsForModule('user-1', 'finance', 'Monthly Rent');
    expect(tags).toContain('rent');
  });
});
