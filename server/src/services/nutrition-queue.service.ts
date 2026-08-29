import { nutritionRepository } from '../repositories/nutrition.repository.js';
import { aiConfigRepository } from '../repositories/ai-config.repository.js';
import { apiKeyRepository } from '../repositories/api-key.repository.js';
import { aiAdapter } from '../ai/adapter.js';
import { nutritionItemSchema } from '@kriya/shared';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const POLL_INTERVAL = 3000;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

async function processNext() {
  if (processing) return;
  processing = true;

  try {
    const pending = await nutritionRepository.findPending();
    for (const entry of pending) {
      try {
        const aiConfig = await aiConfigRepository.findByUserAndModule(entry.user_id, 'nutrition');
        const providerId = aiConfig?.provider ?? 'mock';
        const provider = aiAdapter.getProvider(providerId);
        const model = aiConfig?.model ?? provider.defaultModel;

        let apiKey = 'dev-mock-key';
        if (providerId !== 'mock') {
          const storedKey = await apiKeyRepository.getDecryptedKey(entry.user_id, providerId);
          if (!storedKey) {
            throw new AppError(400, 'AI_KEY_MISSING', `No API key stored for provider "${providerId}"`);
          }
          apiKey = storedKey;
        }

        logger.debug(
          { entryId: entry.id, provider: providerId },
          'Queue processing nutrition entry',
        );

        const nutritionResults = await provider.parseNutrition({
          rawInput: entry.raw_input,
          apiKey,
          model,
        });

        const validated = nutritionResults.map((item) => nutritionItemSchema.parse(item));
        await nutritionRepository.updateWithResults(entry.id, entry.user_id, validated);
        logger.info({ entryId: entry.id }, 'Nutrition entry completed');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        await nutritionRepository.markFailed(entry.id, entry.user_id, message);
        logger.error({ entryId: entry.id, error: message }, 'Nutrition entry failed');
      }
    }
  } finally {
    processing = false;
  }
}

export const nutritionQueue = {
  start() {
    if (intervalHandle) return;
    logger.info('Nutrition queue worker started');
    // A failed poll (e.g. tables not migrated yet, or a transient DB error)
    // must not crash the whole server; log it and retry on the next tick.
    const safeProcess = () =>
      processNext().catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ error: message }, 'Nutrition queue poll failed');
      });
    intervalHandle = setInterval(safeProcess, POLL_INTERVAL);
    safeProcess();
  },

  stop() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
      logger.info('Nutrition queue worker stopped');
    }
  },
};
