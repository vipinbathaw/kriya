import { aiAdapter } from '../ai/adapter.js';
import { aiConfigRepository } from '../repositories/ai-config.repository.js';
import { apiKeyRepository } from '../repositories/api-key.repository.js';
import { generateSimpleTags } from './tag-generator.service.js';
import { logger } from '../utils/logger.js';

function sanitizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const tag of tags) {
    const normalized = String(tag ?? '').trim().toLowerCase();
    if (normalized && !seen.has(normalized) && normalized.length <= 50) {
      seen.add(normalized);
      cleaned.push(normalized);
    }
  }
  return cleaned.slice(0, 5);
}

/**
 * Generate tags for a notes or finance item. Uses the user's configured AI
 * provider when AI is enabled for the module and an API key is available;
 * otherwise (and on any AI failure) falls back to rule-based extraction so a
 * create/update request is never blocked by a transient AI outage.
 */
export async function generateTagsForModule(
  userId: string,
  module: 'notes' | 'finance',
  title: string,
  description?: string,
): Promise<string[]> {
  let aiConfig;
  try {
    aiConfig = await aiConfigRepository.findByUserAndModule(userId, module);
  } catch (err) {
    logger.warn({ err, module }, 'Failed to read AI config; using rule-based tags');
    return generateSimpleTags(title);
  }

  if (!aiConfig?.ai_enabled) {
    return generateSimpleTags(title);
  }

  const providerId = aiConfig.provider ?? 'mock';

  if (providerId === 'mock') {
    return generateSimpleTags(title);
  }

  try {
    const provider = aiAdapter.getProvider(providerId);
    const apiKey = await apiKeyRepository.getDecryptedKey(userId, providerId);
    if (!apiKey) {
      logger.warn({ module, provider: providerId }, 'AI enabled but no API key stored; using rule-based tags');
      return generateSimpleTags(title);
    }

    const model = aiConfig.model ?? provider.defaultModel;
    const tags = await provider.generateTags({ title, description, module, apiKey, model });
    return sanitizeTags(tags);
  } catch (err) {
    logger.warn({ err, module, provider: providerId }, 'AI tag generation failed; using rule-based tags');
    return generateSimpleTags(title);
  }
}
