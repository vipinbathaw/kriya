import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-xl border shadow-lg p-6 animate-scale-in"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-md hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3 mb-4">
          {variant === 'danger' && (
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
          )}
          <div>
            <h3 id="confirm-title" className="text-lg font-semibold">{title}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70 active:scale-[0.97]"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              backgroundColor: variant === 'danger' ? '#dc2626' : 'var(--primary)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
