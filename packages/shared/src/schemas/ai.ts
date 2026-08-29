import { z } from 'zod';

export const updateAIConfigSchema = z.object({
  aiEnabled: z.boolean().optional(),
  provider: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
});

export const apiKeySchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
});

export type UpdateAIConfigSchema = z.infer<typeof updateAIConfigSchema>;
export type APIKeySchema = z.infer<typeof apiKeySchema>;
