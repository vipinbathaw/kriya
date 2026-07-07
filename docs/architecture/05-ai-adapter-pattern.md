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

class AIAdapter {
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

  // Provider implementations register themselves
  static initialize(): AIAdapter {
    const adapter = new AIAdapter();
    adapter.register(new OpenAIProvider());
    adapter.register(new AnthropicProvider());
    return adapter;
  }
}

export const aiAdapter = AIAdapter.initialize();
```

## Usage in Services

```typescript
// src/services/notes.service.ts

async createNote(userId: string, data: CreateNoteInput): Promise<Note> {
  let tags: string[] = [];

  // Check if AI is enabled for notes module
  const aiConfig = await this.aiConfigRepo.findByUserAndModule(userId, 'notes');

  if (aiConfig?.aiEnabled) {
    // Get encrypted API key
    const apiKey = await this.apiKeyRepo.getDecryptedKey(userId, aiConfig.provider);
    // Call adapter
    const provider = aiAdapter.getProvider(aiConfig.provider);
    tags = await provider.generateTags({
      title: data.title,
      description: data.description,
      module: 'notes',
      apiKey,
      model: aiConfig.model,
    });
  } else {
    tags = this.generateSimpleTags(data.title);
  }

  return this.notesRepo.create({ ...data, userId, tags });
}
```

## Adding a New Provider

1. Create `src/ai/providers/newprovider.provider.ts`
2. Implement the `AIProvider` interface
3. Add to `AIAdapter.initialize()` in `adapter.ts`
4. Add entry to `ai_providers` table (seed)
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
