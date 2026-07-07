import { AIProviderSelect } from './AIProviderSelect';

interface ModuleAIToggleProps {
  module: string;
  moduleLabel: string;
  aiEnabled: boolean;
  provider: string | null;
  model: string | null;
  providers: Array<{ id: string; name: string; models: string[] }>;
  alwaysOn?: boolean;
  onToggle: (enabled: boolean) => void;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

export function ModuleAIToggle({
  module: _module,
  moduleLabel,
  aiEnabled,
  provider,
  model,
  providers,
  alwaysOn,
  onToggle,
  onProviderChange,
  onModelChange,
}: ModuleAIToggleProps) {
  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {moduleLabel}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={aiEnabled}
            disabled={alwaysOn}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
            style={{
              backgroundColor: aiEnabled ? 'var(--primary)' : 'var(--border)',
            }}
          />
        </label>
      </div>

      {aiEnabled && (
        <AIProviderSelect
          providers={providers}
          selectedProvider={provider}
          selectedModel={model}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
        />
      )}

      {alwaysOn && (
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          AI is required for nutrition parsing and cannot be disabled.
        </p>
      )}
    </div>
  );
}
