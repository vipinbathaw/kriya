import { NavLink } from 'react-router-dom';
import { StickyNote, Wallet, Apple, Settings } from 'lucide-react';

const navItems = [
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-56 h-full border-r pt-4"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
              })}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
