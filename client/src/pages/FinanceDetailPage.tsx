import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../services/finance.api';
import { TagBadge } from '../components/shared/TagBadge';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useToastStore } from '../stores/toast.store';
import { ArrowLeft, Edit3, Trash2, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'INR' ? '\u20B9' : currency === 'USD' ? '$' : currency + ' ';
  const value = (amount / 100).toFixed(2);
  return `${symbol}${value}`;
}

export function FinanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showDelete, setShowDelete] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['finance-entry', id],
    queryFn: () => financeApi.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => financeApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      addToast('Entry deleted', 'success');
      navigate('/finance');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!entry) return (
    <div className="p-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
      Entry not found
    </div>
  );

  const isCredit = entry.type === 'credit';
  const dateLabel = new Date(entry.entryDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => navigate('/finance')}
        className="flex items-center gap-1 text-sm mb-4 transition-opacity hover:opacity-70 active:scale-[0.97]"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ArrowLeft size={16} /> Back to Finance
      </button>

      <article
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-full shrink-0 ${
                isCredit ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}
            >
              {isCredit
                ? <ArrowUpRight size={22} className="text-green-600 dark:text-green-400" />
                : <ArrowDownRight size={22} className="text-red-600 dark:text-red-400" />
              }
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold break-words">{entry.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={14} style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dateLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/finance/${id}/edit`}
              className="p-2 rounded-lg transition-all hover:opacity-80 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
              aria-label="Edit entry"
            >
              <Edit3 size={16} />
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-950 active:scale-[0.97]"
              aria-label="Delete entry"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>

        <div
          className={`text-3xl font-bold mb-4 ${
            isCredit
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isCredit ? '+' : '-'}{formatAmount(entry.amount, entry.currency)}
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted-foreground)' }}>
            {entry.currency}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isCredit
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {isCredit ? 'Credit' : 'Debit'}
          </span>
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {entry.description ? (
          <div
            className="pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {entry.description}
            </p>
          </div>
        ) : null}
      </article>

      <ConfirmDialog
        open={showDelete}
        title="Delete entry"
        message="Are you sure you want to delete this finance entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMutation.mutateAsync()}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
