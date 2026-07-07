import type { AIProvider, NutritionResult, TagGenerationParams, NutritionParseParams } from '../types.js';
import { tagsResponseSchema, nutritionResponseSchema } from '../types.js';
import { AppError } from '../../middleware/errorHandler.js';

const TAG_GENERATION_PROMPT = `You are a tag generator. Given a title and optional description, generate 3-5 relevant tags. Tags should be lowercase, single words or short phrases. Return only a JSON array of strings. Do not include any explanation or markdown formatting.`;

const NUTRITION_PARSE_PROMPT = `You are a nutrition expert. Parse the food description into structured data. Return a JSON array of objects. Every object must have these exact fields (use 0 if unknown, include trace amounts): foodName, quantity, unit, calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg, saturatedFatG, transFatG, monounsaturatedFatG, polyunsaturatedFatG, cholesterolMg, potassiumMg, calciumMg, ironMg, vitaminAIug, vitaminCMg, vitaminDIug, vitaminEMg, vitaminKIug, vitaminB6Mg, vitaminB12Iug, folateIug, magnesiumMg, zincMg, phosphorusMg, seleniumIug, copperMg, manganeseMg. Include every ingredient as a separate object. Return only valid JSON.`;

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message: { content: string | null };
  finish_reason: string;
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
  error?: { message: string; type: string };
}

async function callOpenAI(apiKey: string, model: string, messages: OpenAIMessage[]): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  const data: OpenAIResponse = await res.json();

  if (!res.ok) {
    const msg = data.error?.message ?? 'Unknown OpenAI API error';
    if (res.status === 429) {
      throw new AppError(429, 'AI_RATE_LIMITED', `OpenAI rate limit exceeded: ${msg}`);
    }
    throw new AppError(502, 'AI_API_ERROR', `OpenAI API error: ${msg}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'OpenAI returned empty response');
  }

  return content.trim();
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

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';

  async generateTags(params: TagGenerationParams): Promise<string[]> {
    const content = await callOpenAI(params.apiKey, params.model, [
      { role: 'system', content: TAG_GENERATION_PROMPT },
      {
        role: 'user',
        content: `Title: ${params.title}${params.description ? `\nDescription: ${params.description}` : ''}`,
      },
    ]);

    const parsed = extractJson(content);
    const result = tagsResponseSchema.safeParse(JSON.parse(parsed));
    if (!result.success) {
      throw new AppError(502, 'AI_INVALID_RESPONSE', 'OpenAI returned malformed tags response');
    }

    return result.data;
  }

  async parseNutrition(params: NutritionParseParams): Promise<NutritionResult[]> {
    const content = await callOpenAI(params.apiKey, params.model, [
      { role: 'system', content: NUTRITION_PARSE_PROMPT },
      { role: 'user', content: `Food eaten: ${params.rawInput}` },
    ]);

    const parsed = extractJson(content);
    const result = nutritionResponseSchema.safeParse(JSON.parse(parsed));
    if (!result.success) {
      throw new AppError(502, 'AI_INVALID_RESPONSE', 'OpenAI returned malformed nutrition response');
    }

    return result.data;
  }
}
