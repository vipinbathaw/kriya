import type { AIProvider, NutritionResult, TagGenerationParams, NutritionParseParams } from '../types.js';
import { tagsResponseSchema, nutritionResponseSchema } from '../types.js';
import { callChatCompletions, safeParseJson } from '../openai-compatible.js';
import { AppError } from '../../middleware/errorHandler.js';

const TAG_GENERATION_PROMPT = `You are a tag generator. Given a title and optional description, generate 3-5 relevant tags. Tags should be lowercase, single words or short phrases. Return only a JSON array of strings. Do not include any explanation or markdown formatting.`;

const NUTRITION_PARSE_PROMPT = `You are a nutrition expert. Parse the food description into structured data. Return a JSON array of objects. Every object must have these exact fields (use 0 if unknown, include trace amounts): foodName, quantity, unit, calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg, saturatedFatG, transFatG, monounsaturatedFatG, polyunsaturatedFatG, cholesterolMg, potassiumMg, calciumMg, ironMg, vitaminAIug, vitaminCMg, vitaminDIug, vitaminEMg, vitaminKIug, vitaminB6Mg, vitaminB12Iug, folateIug, magnesiumMg, zincMg, phosphorusMg, seleniumIug, copperMg, manganeseMg. Include every ingredient as a separate object. Return only valid JSON.`;

const BASE_URL = 'https://api.openai.com/v1';

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly defaultModel = 'gpt-4o-mini';

  async generateTags(params: TagGenerationParams): Promise<string[]> {
    const content = await callChatCompletions({
      baseUrl: BASE_URL,
      apiKey: params.apiKey,
      model: params.model || this.defaultModel,
      label: 'OpenAI',
      messages: [
        { role: 'system', content: TAG_GENERATION_PROMPT },
        {
          role: 'user',
          content: `Title: ${params.title}${params.description ? `\nDescription: ${params.description}` : ''}`,
        },
      ],
    });

    const parsed = safeParseJson(content);
    const result = tagsResponseSchema.safeParse(parsed);
    if (!result.success) {
      throw new AppError(502, 'AI_INVALID_RESPONSE', 'OpenAI returned malformed tags response');
    }

    return result.data;
  }

  async parseNutrition(params: NutritionParseParams): Promise<NutritionResult[]> {
    const content = await callChatCompletions({
      baseUrl: BASE_URL,
      apiKey: params.apiKey,
      model: params.model || this.defaultModel,
      label: 'OpenAI',
      maxTokens: 4000,
      messages: [
        { role: 'system', content: NUTRITION_PARSE_PROMPT },
        { role: 'user', content: `Food eaten: ${params.rawInput}` },
      ],
    });

    const parsed = safeParseJson(content);
    const result = nutritionResponseSchema.safeParse(parsed);
    if (!result.success) {
      throw new AppError(502, 'AI_INVALID_RESPONSE', 'OpenAI returned malformed nutrition response');
    }

    return result.data;
  }
}
