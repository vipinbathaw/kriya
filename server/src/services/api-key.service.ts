import { apiKeyRepository } from '../repositories/api-key.repository.js';
import { aiProviderRepository } from '../repositories/ai-provider.repository.js';
import { AppError } from '../middleware/errorHandler.js';

export const apiKeyService = {
  async storeKey(userId: string, provider: string, apiKey: string): Promise<void> {
    const providerExists = await aiProviderRepository.findById(provider);
    if (!providerExists) {
      throw new AppError(400, 'INVALID_PROVIDER', `AI provider "${provider}" is not available`);
    }

    if (!apiKey || apiKey.length < 8) {
      throw new AppError(400, 'INVALID_API_KEY', 'API key must be at least 8 characters');
    }

    await apiKeyRepository.store(userId, provider, apiKey);
  },

  async getDecryptedKey(userId: string, provider: string): Promise<string | null> {
    return apiKeyRepository.getDecryptedKey(userId, provider);
  },

  async listKeys(userId: string): Promise<Array<{ provider: string; keyPreview: string; isActive: boolean }>> {
    return apiKeyRepository.findByUser(userId);
  },

  async deleteKey(userId: string, provider: string): Promise<void> {
    await apiKeyRepository.softDelete(userId, provider);
  },
};
