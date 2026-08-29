import { AppError } from '../middleware/errorHandler.js';

const REQUEST_TIMEOUT_MS = 30_000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionsResponse {
  choices?: Array<{
    message: { content: string | null; reasoning_content?: string | null };
  }>;
  error?: { message: string; type: string };
}

/**
 * Call any OpenAI-compatible `/chat/completions` endpoint (OpenAI, DeepSeek,
 * OpenRouter, etc.) with a hard timeout and normalized error handling.
 */
export async function callChatCompletions(params: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  label?: string;
  maxTokens?: number;
  temperature?: number;
  extraBody?: Record<string, unknown>;
}): Promise<string> {
  const {
    baseUrl,
    apiKey,
    model,
    messages,
    label = 'AI provider',
    maxTokens = 1000,
    temperature = 0.3,
    extraBody,
  } = params;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, ...extraBody }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AppError(504, 'AI_TIMEOUT', `${label} request timed out`);
    }
    throw new AppError(502, 'AI_NETWORK_ERROR', `Failed to reach ${label} API`);
  } finally {
    clearTimeout(timer);
  }

  const data: ChatCompletionsResponse = await res.json();

  if (!res.ok) {
    const msg = data.error?.message ?? 'Unknown API error';
    if (res.status === 429) {
      throw new AppError(429, 'AI_RATE_LIMITED', `${label} rate limit exceeded: ${msg}`);
    }
    throw new AppError(502, 'AI_API_ERROR', `${label} API error: ${msg}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    const reasoning = data.choices?.[0]?.message?.reasoning_content;
    const hint = reasoning
      ? ' (model returned reasoning only; thinking mode should be disabled for structured tasks)'
      : '';
    throw new AppError(502, 'AI_INVALID_RESPONSE', `${label} returned empty response${hint}`);
  }

  return content.trim();
}

export function extractJson(text: string): string {
  const jsonMatch = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = jsonMatch.indexOf('[');
  const end = jsonMatch.lastIndexOf(']');
  if (start !== -1 && end > start) {
    return jsonMatch.slice(start, end + 1);
  }
  return jsonMatch;
}

export function safeParseJson(text: string): unknown {
  const cleaned = extractJson(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    return undefined;
  }
}
