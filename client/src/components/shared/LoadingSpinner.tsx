interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div
        className="animate-spin rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--border)',
          borderTopColor: 'var(--primary)',
        }}
      />
    </div>
  );
}
