import { useState } from 'react';
import { Key, Trash2, Eye, EyeOff } from 'lucide-react';

interface APIKeyInputProps {
  providers: Array<{ id: string; name: string }>;
  apiKeys: Array<{ provider: string; keyPreview: string; isActive: boolean }>;
  onSave: (provider: string, apiKey: string) => Promise<void>;
  onDelete: (provider: string) => Promise<void>;
}

export function APIKeyInput({ providers, apiKeys, onSave, onDelete }: APIKeyInputProps) {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProviders = providers.filter((p) => p.id !== 'mock');
  const existingKey = apiKeys.find((k) => k.provider === selectedProvider);

  const handleSave = async () => {
    if (!selectedProvider || !apiKey) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(selectedProvider, apiKey);
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (provider: string) => {
    setSaving(true);
    setError(null);
    try {
      await onDelete(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select
            value={selectedProvider}
            onChange={(e) => {
              setSelectedProvider(e.target.value);
              setApiKey('');
              setError(null);
            }}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Select provider</option>
            {filteredProviders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProvider && existingKey && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2 text-sm">
            <Key size={16} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--foreground)' }}>{existingKey.keyPreview}</span>
          </div>
          <button
            onClick={() => handleDelete(selectedProvider)}
            disabled={saving}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      )}

      {selectedProvider && (
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">
            API Key {existingKey ? '(replace)' : ''}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={existingKey ? 'Enter new key to replace...' : 'sk-...'}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 pr-10"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !apiKey}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
