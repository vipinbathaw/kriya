import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--primary)]">Kriya</h1>
          <p className="text-[var(--muted-foreground)] mt-1">life management</p>
        </div>
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}
        >
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          {subtitle && (
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
