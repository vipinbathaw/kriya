interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
        {title}
      </h1>
      {action && <div>{action}</div>}
    </header>
  );
}
