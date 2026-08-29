import { useState, useEffect, useCallback } from 'react';
import { aiConfigApi } from '../services/ai-config.api';
import type { AIProvider, UserAIConfig, APIKeyResponse, UpdateAIConfigInput } from '@kriya/shared';

interface AIConfigState {
  configs: UserAIConfig[];
  providers: AIProvider[];
  apiKeys: APIKeyResponse[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export function useAIConfig() {
  const [state, setState] = useState<AIConfigState>({
    configs: [],
    providers: [],
    apiKeys: [],
    loading: true,
    saving: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [configs, providers, apiKeys] = await Promise.all([
        aiConfigApi.getConfigs(),
        aiConfigApi.getProviders(),
        aiConfigApi.listApiKeys(),
      ]);
      setState({ configs, providers, apiKeys, loading: false, saving: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load AI configuration',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateConfig = useCallback(async (module: string, data: UpdateAIConfigInput) => {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      await aiConfigApi.updateConfig(module, data);
      await load();
    } catch (err) {
      setState((s) => ({
        ...s,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to update config',
      }));
      throw err;
    }
  }, [load]);

  const storeApiKey = useCallback(async (provider: string, apiKey: string) => {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      await aiConfigApi.storeApiKey({ provider, apiKey });
      await load();
    } catch (err) {
      setState((s) => ({
        ...s,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save API key',
      }));
      throw err;
    }
  }, [load]);

  const deleteApiKey = useCallback(async (provider: string) => {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      await aiConfigApi.deleteApiKey(provider);
      await load();
    } catch (err) {
      setState((s) => ({
        ...s,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to delete API key',
      }));
      throw err;
    }
  }, [load]);

  const getProviderModels = useCallback((providerId: string): string[] => {
    const provider = state.providers.find((p) => p.id === providerId);
    return provider?.models ?? [];
  }, [state.providers]);

  return {
    ...state,
    updateConfig,
    storeApiKey,
    deleteApiKey,
    getProviderModels,
    reload: load,
  };
}
