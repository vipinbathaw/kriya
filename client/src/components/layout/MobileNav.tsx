import { NavLink } from 'react-router-dom';
import { StickyNote, Wallet, Apple, Settings, LayoutDashboard } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-40"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full rounded-lg transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
              borderTop: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              marginTop: isActive ? '-2px' : undefined,
            })}
          >
            <Icon size={22} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
