interface AIProviderSelectProps {
  providers: Array<{ id: string; name: string; models: string[] }>;
  selectedProvider: string | null;
  selectedModel: string | null;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

export function AIProviderSelect({
  providers,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: AIProviderSelectProps) {
  const filteredProviders = providers.filter((p) => p.id !== 'mock');
  const currentProvider = filteredProviders.find((p) => p.id === selectedProvider);
  const models = currentProvider?.models ?? [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Provider</label>
        <select
          value={selectedProvider ?? ''}
          onChange={(e) => {
            onProviderChange(e.target.value);
            onModelChange('');
          }}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">Select a provider</option>
          {filteredProviders.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProvider && models.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={selectedModel ?? ''}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Select a model</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
