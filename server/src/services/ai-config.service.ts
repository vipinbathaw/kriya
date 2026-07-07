import { aiConfigRepository } from '../repositories/ai-config.repository.js';
import { aiProviderRepository } from '../repositories/ai-provider.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ModuleType } from '@kriya/shared';

export const aiConfigService = {
  async getConfigs(userId: string): Promise<Array<{
    module: string;
    aiEnabled: boolean;
    provider: string | null;
    model: string | null;
  }>> {
    const configs = await aiConfigRepository.findByUser(userId);
    const modules: ModuleType[] = ['notes', 'finance', 'nutrition'];

    return modules.map((mod) => {
      const cfg = configs.find((c) => c.module === mod);
      return {
        module: mod,
        aiEnabled: mod === 'nutrition' ? true : (cfg ? !!cfg.ai_enabled : false),
        provider: cfg?.provider ?? null,
        model: cfg?.model ?? null,
      };
    });
  },

  async updateConfig(userId: string, module: string, data: {
    aiEnabled?: boolean;
    provider?: string;
    model?: string;
  }): Promise<void> {
    const validModules = ['notes', 'finance', 'nutrition'];
    if (!validModules.includes(module)) {
      throw new AppError(400, 'INVALID_MODULE', `Module must be one of: ${validModules.join(', ')}`);
    }

    if (module === 'nutrition' && data.aiEnabled === false) {
      throw new AppError(400, 'NUTRITION_REQUIRES_AI', 'Nutrition module requires AI to be enabled');
    }

    if (data.provider) {
      const provider = await aiProviderRepository.findById(data.provider);
      if (!provider) {
        throw new AppError(400, 'INVALID_PROVIDER', `AI provider "${data.provider}" is not available`);
      }
    }

    await aiConfigRepository.upsert(userId, module, data);
  },

  async getAvailableProviders(): Promise<Array<{ id: string; name: string; models: string[] }>> {
    const providers = await aiProviderRepository.findAll();
    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      models: p.models as unknown as string[],
    }));
  },
};
