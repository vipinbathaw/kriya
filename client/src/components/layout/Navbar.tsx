import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';

export function Navbar() {
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;

  return (
    <header
      className="h-14 border-b flex items-center justify-between px-4 sticky top-0 z-40"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-lg font-bold cursor-pointer"
          style={{ color: 'var(--primary)' }}
          onClick={() => navigate('/')}
        >
          Kriya
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:opacity-70 transition-opacity"
          title={`Theme: ${theme}`}
          aria-label={`Switch theme (currently ${theme})`}
        >
          <ThemeIcon size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:opacity-70 transition-opacity"
            aria-label="User menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {user?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg py-1 z-50 animate-scale-in"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
              }}
              role="menu"
            >
              <div className="px-3 py-2 text-sm font-medium truncate">
                {user?.displayName}
              </div>
              <div className="px-3 pb-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {user?.email}
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:opacity-70 transition-opacity"
                role="menuitem"
              >
                <User size={16} /> Settings
              </button>
              <button
                onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:opacity-70 transition-opacity"
                role="menuitem"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
