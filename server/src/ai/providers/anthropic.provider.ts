import type { AIProvider, NutritionResult, TagGenerationParams, NutritionParseParams } from '../types.js';
import { tagsResponseSchema, nutritionResponseSchema } from '../types.js';
import { AppError } from '../../middleware/errorHandler.js';

const TAG_GENERATION_SYSTEM_PROMPT = `You are a tag generator. Given a title and optional description, generate 3-5 relevant tags. Tags should be lowercase, single words or short phrases. Return only a JSON array of strings. Do not include any explanation or markdown formatting.`;

const NUTRITION_PARSE_SYSTEM_PROMPT = `You are a nutrition expert. Parse the food description into structured data. Return a JSON array of objects. Every object must have these exact fields (use 0 if unknown, include trace amounts): foodName, quantity, unit, calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg, saturatedFatG, transFatG, monounsaturatedFatG, polyunsaturatedFatG, cholesterolMg, potassiumMg, calciumMg, ironMg, vitaminAIug, vitaminCMg, vitaminDIug, vitaminEMg, vitaminKIug, vitaminB6Mg, vitaminB12Iug, folateIug, magnesiumMg, zincMg, phosphorusMg, seleniumIug, copperMg, manganeseMg. Include every ingredient as a separate object. Return only valid JSON.`;

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  error?: { message: string; type: string };
}

async function callAnthropic(apiKey: string, model: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  const data: AnthropicResponse = await res.json();

  if (!res.ok) {
    const msg = data.error?.message ?? 'Unknown Anthropic API error';
    if (res.status === 429) {
      throw new AppError(429, 'AI_RATE_LIMITED', `Anthropic rate limit exceeded: ${msg}`);
    }
    throw new AppError(502, 'AI_API_ERROR', `Anthropic API error: ${msg}`);
  }

  const text = data.content?.[0]?.text;
  if (!text) {
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'Anthropic returned empty response');
  }

  return text.trim();
}

function extractJson(text: string): string {
  const jsonMatch = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = jsonMatch.indexOf('[');
  const end = jsonMatch.lastIndexOf(']');
  if (start !== -1 && end > start) {
    return jsonMatch.slice(start, end + 1);
  }
  return jsonMatch;
}

export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic';

  async generateTags(params: TagGenerationParams): Promise<string[]> {
    const content = await callAnthropic(
      params.apiKey,
      params.model,
      TAG_GENERATION_SYSTEM_PROMPT,
      `Title: ${params.title}${params.description ? `\nDescription: ${params.description}` : ''}`,
    );

    const parsed = extractJson(content);
    const result = tagsResponseSchema.safeParse(JSON.parse(parsed));
    if (!result.success) {
      throw new AppError(502, 'AI_INVALID_RESPONSE', 'Anthropic returned malformed tags response');
    }

    return result.data;
  }

  async parseNutrition(params: NutritionParseParams): Promise<NutritionResult[]> {
    const content = await callAnthropic(
      params.apiKey,
      params.model,
      NUTRITION_PARSE_SYSTEM_PROMPT,
      `Food eaten: ${params.rawInput}`,
    );

    const parsed = extractJson(content);
    const result = nutritionResponseSchema.safeParse(JSON.parse(parsed));
    if (!result.success) {
      throw new AppError(502, 'AI_INVALID_RESPONSE', 'Anthropic returned malformed nutrition response');
    }

    return result.data;
  }
}
