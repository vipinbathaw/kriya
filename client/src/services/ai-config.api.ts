import { apiRequest } from './api-client';
import type { AIProvider, UserAIConfig, UpdateAIConfigInput, APIKeyResponse, APIKeyInput } from '@kriya/shared';

export const aiConfigApi = {
  getConfigs: () => apiRequest<UserAIConfig[]>('/ai/configs'),

  updateConfig: (module: string, data: UpdateAIConfigInput) =>
    apiRequest<{ success: boolean }>(`/ai/configs/${module}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getProviders: () => apiRequest<AIProvider[]>('/ai/providers'),

  storeApiKey: (data: APIKeyInput) =>
    apiRequest<APIKeyResponse>('/ai/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listApiKeys: () => apiRequest<APIKeyResponse[]>('/ai/keys'),

  deleteApiKey: (provider: string) =>
    apiRequest<{ success: boolean }>(`/ai/keys/${provider}`, {
      method: 'DELETE',
    }),
};
