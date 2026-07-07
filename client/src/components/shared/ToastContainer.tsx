import { useToastStore } from '../../stores/toast.store';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const variantStyles: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.3)',
    icon: <CheckCircle size={18} className="text-green-500" />,
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: <AlertCircle size={18} className="text-red-500" />,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: <Info size={18} className="text-blue-500" />,
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant] ?? variantStyles.info;
        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="assertive"
            className="animate-slide-in-right pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg"
            style={{
              backgroundColor: style.bg,
              borderColor: style.border,
              color: 'var(--foreground)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="mt-0.5 shrink-0">{style.icon}</span>
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded hover:opacity-70 shrink-0"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
