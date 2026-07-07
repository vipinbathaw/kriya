import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <Icon size={32} style={{ color: 'var(--muted-foreground)' }} />
      </div>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6 text-center max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
