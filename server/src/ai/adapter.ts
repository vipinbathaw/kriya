import type { AIProvider } from './types.js';
import { AppError } from '../middleware/errorHandler.js';
import { MockAIProvider } from './providers/mock.provider.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';

export class AIAdapter {
  private providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new AppError(400, 'UNSUPPORTED_AI_PROVIDER', `AI provider "${providerId}" is not supported`);
    }
    return provider;
  }

  listProviders(): Array<{ id: string; name: string }> {
    return Array.from(this.providers.values()).map((p) => ({ id: p.id, name: p.name }));
  }
}

const adapter = new AIAdapter();
adapter.register(new MockAIProvider());
adapter.register(new OpenAIProvider());
adapter.register(new AnthropicProvider());

export const aiAdapter = adapter;
