import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { settingsApi, type Profile } from '../services/settings.api';
import { useAIConfig } from '../hooks/useAIConfig';
import { APIKeyInput } from '../components/settings/APIKeyInput';
import { ModuleAIToggle } from '../components/settings/ModuleAIToggle';
import { useToastStore } from '../stores/toast.store';
import { LogOut, Sun, Moon, Monitor, Sparkles } from 'lucide-react';

const AI_MODULES = [
  { key: 'notes', label: 'Notes' },
  { key: 'finance', label: 'Finance' },
  { key: 'nutrition', label: 'Nutrition', alwaysOn: true },
];

export function SettingsPage() {
  const { logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const addToast = useToastStore((s) => s.addToast);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiTab, setAiTab] = useState(false);

  const {
    configs,
    providers,
    apiKeys,
    loading: aiLoading,
    error: aiError,
    updateConfig,
    storeApiKey,
    deleteApiKey,
  } = useAIConfig();

  useEffect(() => {
    settingsApi.getProfile().then((p) => {
      setProfile(p);
      setDisplayName(p.displayName);
      if (p.theme) setTheme(p.theme);
    }).catch(() => {
      addToast('Failed to load profile', 'error');
    });
  }, [addToast, setTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateProfile({ displayName });
      setProfile(updated);
      addToast('Profile updated', 'success');
    } catch {
      addToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
    try {
      await settingsApi.updateProfile({ theme });
    } catch {
      addToast('Theme preference not synced', 'error');
    }
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const handleToggle = async (module: string, enabled: boolean) => {
    const cfg = configs.find((c) => c.module === module);
    await updateConfig(module, {
      aiEnabled: enabled,
      provider: cfg?.provider ?? undefined,
      model: cfg?.model ?? undefined,
    });
  };

  const handleProviderChange = async (module: string, provider: string) => {
    await updateConfig(module, {
      aiEnabled: true,
      provider,
      model: null,
    });
  };

  const handleModelChange = async (module: string, model: string) => {
    const cfg = configs.find((c) => c.module === module);
    await updateConfig(module, {
      aiEnabled: cfg?.aiEnabled ?? false,
      provider: cfg?.provider ?? undefined,
      model: model || null,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Tab buttons */}
      <div className="flex gap-2 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setAiTab(false)}
          className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors"
          style={{
            color: aiTab ? 'var(--muted-foreground)' : 'var(--foreground)',
            borderBottom: aiTab ? 'none' : '2px solid var(--primary)',
          }}
        >
          General
        </button>
        <button
          onClick={() => setAiTab(true)}
          className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1.5"
          style={{
            color: aiTab ? 'var(--foreground)' : 'var(--muted-foreground)',
            borderBottom: aiTab ? '2px solid var(--primary)' : 'none',
          }}
        >
          <Sparkles size={16} />
          AI Settings
        </button>
      </div>

      {!aiTab ? (
        <>
          <section className="rounded-xl border p-6 space-y-4" style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}>
            <h2 className="text-lg font-semibold">Profile</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="w-full px-3 py-2 rounded-lg border text-sm opacity-60 cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
            {saving ? 'Saving...' : 'Save'}
          </button>
            </div>
          </section>

          <section className="rounded-xl border p-6 space-y-4" style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}>
            <h2 className="text-lg font-semibold">Theme</h2>
            <div className="flex gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className="flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-lg border text-sm transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--background)',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      color: isActive ? 'white' : 'var(--foreground)',
                    }}
                  >
                    <Icon size={20} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border p-6" style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </section>
        </>
      ) : (
        <>
          {aiError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
              {aiError}
            </div>
          )}

          <section className="rounded-xl border p-6 space-y-4" style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}>
            <h2 className="text-lg font-semibold">API Keys</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Store your AI provider API keys. Keys are encrypted at rest and only key previews are shown.
            </p>
            <APIKeyInput
              providers={providers}
              apiKeys={apiKeys}
              onSave={storeApiKey}
              onDelete={deleteApiKey}
            />
          </section>

          <section className="rounded-xl border p-6 space-y-4" style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}>
            <h2 className="text-lg font-semibold">Module AI Configuration</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Enable AI for each module and select a provider and model.
            </p>
            {aiLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--primary)' }} />
              </div>
            ) : (
              <div className="space-y-3">
                {AI_MODULES.map((mod) => {
                  const cfg = configs.find((c) => c.module === mod.key);
                  return (
                    <ModuleAIToggle
                      key={mod.key}
                      module={mod.key}
                      moduleLabel={mod.label}
                      aiEnabled={mod.alwaysOn ? true : (cfg?.aiEnabled ?? false)}
                      provider={cfg?.provider ?? null}
                      model={cfg?.model ?? null}
                      providers={providers}
                      alwaysOn={mod.alwaysOn}
                      onToggle={(enabled) => handleToggle(mod.key, enabled)}
                      onProviderChange={(provider) => handleProviderChange(mod.key, provider)}
                      onModelChange={(model) => handleModelChange(mod.key, model)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
