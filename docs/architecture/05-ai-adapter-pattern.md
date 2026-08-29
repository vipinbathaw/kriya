# AI Adapter Pattern

## Overview
The AI layer is designed as a **pluggable adapter** using the Strategy pattern. Business logic never directly calls an AI provider — it always goes through an abstract interface. This makes switching providers a configuration change, not a code change.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Service     │────►│  AIAdapter       │────►│  AIProvider     │
│  (business   │     │  (registry +     │     │  (interface)    │
│   logic)     │     │   factory)       │     │                 │
└──────────────┘     └──────────────────┘     └──┬──────────────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │ OpenAI   │ │Anthropic │ │ Future   │
                              │ Provider │ │ Provider │ │ Provider │
                              └──────────┘ └──────────┘ └──────────┘
```

## Interface Definition

```typescript
// src/ai/types.ts

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly defaultModel: string;

  /** Generate tags from title and optional description */
  generateTags(params: {
    title: string;
    description?: string;
    module: 'notes' | 'finance';
    apiKey: string;
    model: string;
  }): Promise<string[]>;

  /** Parse food input and return nutritional breakdown */
  parseNutrition(params: {
    rawInput: string;
    apiKey: string;
    model: string;
  }): Promise<NutritionResult[]>;
}

export interface NutritionResult {
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  // ...31 numeric nutrient fields total (see src/ai/types.ts)
}
```

## Provider Implementations

### OpenAI Provider (`src/ai/providers/openai.provider.ts`)
```typescript
export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';

  async generateTags(params: {...}): Promise<string[]> {
    // System prompt for tag generation
    // Call OpenAI chat completions API
    // Parse response, return tags array
  }

  async parseNutrition(params: {...}): Promise<NutritionResult[]> {
    // System prompt for nutrition parsing
    // Call OpenAI chat completions with structured output
    // Parse JSON response, validate with Zod
  }
}
```

### Anthropic Provider (`src/ai/providers/anthropic.provider.ts`)
```typescript
export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic';

  // Same interface, different API calls
  // Uses Anthropic Messages API
}
```

## Adapter (Registry + Factory)

```typescript
// src/ai/adapter.ts

export class AIAdapter {
  private providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new AppError(400, 'UNSUPPORTED_AI_PROVIDER',
        `AI provider "${providerId}" not supported`);
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
```

All providers are registered at module load. Provider responses are validated with Zod, and every provider request runs with a 30s timeout (aborts via `AbortController`).

## Usage in Services

### Tag generation (Notes & Finance)

Business logic goes through a single helper that reads the user's AI config, resolves the provider, decrypts the stored API key, and falls back to rule-based tags on any failure:

```typescript
// src/services/ai-tag-generator.service.ts

export async function generateTagsForModule(
  userId: string,
  module: 'notes' | 'finance',
  title: string,
  description?: string,
): Promise<string[]> {
  const aiConfig = await aiConfigRepository.findByUserAndModule(userId, module);

  if (!aiConfig?.ai_enabled) {
    return generateSimpleTags(title);           // rule-based fallback
  }

  const providerId = aiConfig.provider ?? 'mock';
  if (providerId === 'mock') {
    return generateSimpleTags(title);
  }

  const provider = aiAdapter.getProvider(providerId);
  const apiKey = await apiKeyRepository.getDecryptedKey(userId, providerId);
  if (!apiKey) {
    return generateSimpleTags(title);           // enabled but no key stored
  }

  return provider.generateTags({
    title,
    description,
    module,
    apiKey,
    model: aiConfig.model ?? provider.defaultModel,
  });
}
```

`notes.service.ts` and `finance.service.ts` call this in `create`/`update`. Because the helper never throws for AI failures, a create/update request is never blocked by a transient AI outage — it silently falls back to rule-based tags and logs a warning.

### Nutrition parsing (async queue)

Nutrition parsing cannot be returned synchronously, so entries are stored with `status = 'pending'` and processed by a background worker:

```typescript
// src/services/nutrition-queue.service.ts

const aiConfig = await aiConfigRepository.findByUserAndModule(entry.user_id, 'nutrition');
const providerId = aiConfig?.provider ?? 'mock';
const provider = aiAdapter.getProvider(providerId);
const model = aiConfig?.model ?? provider.defaultModel;

// providerId !== 'mock' requires a decrypted key; otherwise the entry
// is marked failed with AI_KEY_MISSING.

const results = await provider.parseNutrition({ rawInput: entry.raw_input, apiKey, model });
await nutritionRepository.updateWithResults(entry.id, entry.user_id, validated);
```

The worker polls every 3 seconds for pending entries and updates status to `completed` or `failed`.

## Adding a New Provider

1. Create `src/ai/providers/newprovider.provider.ts`
2. Implement the `AIProvider` interface (including `defaultModel`)
3. Register it in `adapter.ts`
4. Add entry to the `ai_providers` table (seed in `20240101000010_create_ai_providers.ts`)
5. No changes needed in any service

## Prompt Engineering

All prompts are co-located with their provider implementation as constants:

```typescript
const TAG_GENERATION_PROMPT = `You are a tag generator. Given a title and optional description, generate 3-5 relevant tags. Tags should be lowercase, single words or short phrases. Return only a JSON array of strings.`;

const NUTRITION_PARSE_PROMPT = `You are a nutrition expert. Given a description of food eaten, parse it into structured nutritional data. Return a JSON array of objects with fields: foodName, quantity, unit, calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg. Be as accurate as possible with Indian food items.`;
```

## Security
- API keys are fetched from the encrypted `api_keys` table and decrypted in-memory
- Keys are never logged, stored in temp files, or exposed to the client
- The adapter receives the plaintext key within the current request scope only
- Provider responses are validated with Zod before being returned to services
