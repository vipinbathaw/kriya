import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIAdapter } from './adapter.js';

describe('AIAdapter', () => {
  let adapter: AIAdapter;

  beforeEach(() => {
    adapter = new AIAdapter();
  });

  it('registers and retrieves a provider', () => {
    const mockProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      defaultModel: 'test-model',
      generateTags: vi.fn(),
      parseNutrition: vi.fn(),
    };

    adapter.register(mockProvider);
    const retrieved = adapter.getProvider('test-provider');
    expect(retrieved).toBe(mockProvider);
  });

  it('throws for unsupported provider', () => {
    expect(() => adapter.getProvider('nonexistent')).toThrow('AI provider "nonexistent" is not supported');
  });

  it('lists registered providers', () => {
    const p1 = { id: 'p1', name: 'Provider 1', defaultModel: 'test-model', generateTags: vi.fn(), parseNutrition: vi.fn() };
    const p2 = { id: 'p2', name: 'Provider 2', defaultModel: 'test-model', generateTags: vi.fn(), parseNutrition: vi.fn() };

    adapter.register(p1);
    adapter.register(p2);

    const list = adapter.listProviders();
    expect(list).toHaveLength(2);
    expect(list).toContainEqual({ id: 'p1', name: 'Provider 1' });
    expect(list).toContainEqual({ id: 'p2', name: 'Provider 2' });
  });

  it('allows overriding an existing provider', () => {
    const original = { id: 'p1', name: 'Original', defaultModel: 'test-model', generateTags: vi.fn(), parseNutrition: vi.fn() };
    const override = { id: 'p1', name: 'Override', defaultModel: 'test-model', generateTags: vi.fn(), parseNutrition: vi.fn() };

    adapter.register(original);
    adapter.register(override);

    expect(adapter.getProvider('p1')).toBe(override);
  });
});
