import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const saved = (typeof localStorage !== 'undefined' ? localStorage.getItem('kriya-theme') : null) as Theme | null;
const initial: Theme = saved ?? 'system';
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initial,
  setTheme: (theme: Theme) => {
    localStorage.setItem('kriya-theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));
