export type ModuleType = 'notes' | 'finance' | 'nutrition';

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
}

export interface UserAIConfig {
  module: ModuleType;
  aiEnabled: boolean;
  provider: string | null;
  model: string | null;
}

export interface UpdateAIConfigInput {
  aiEnabled?: boolean;
  provider?: string;
  model?: string;
}

export interface APIKeyResponse {
  provider: string;
  keyPreview: string;
  isActive: boolean;
}

export interface APIKeyInput {
  provider: string;
  apiKey: string;
}
