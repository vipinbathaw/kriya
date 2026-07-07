import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TagBadge } from '../shared/TagBadge';

interface EntryRowProps {
  entry: {
    id: string;
    type: 'credit' | 'debit';
    title: string;
    amount: number;
    currency: string;
    tags: string[];
    entryDate: string;
    description?: string | null;
  };
  onDelete: (id: string) => void;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'INR' ? '\u20B9' : currency === 'USD' ? '$' : currency + ' ';
  const value = (amount / 100).toFixed(2);
  return `${symbol}${value}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function EntryRow({ entry, onDelete }: EntryRowProps) {
  const navigate = useNavigate();
  const isCredit = entry.type === 'credit';

  return (
    <article
      className="group rounded-xl border p-4 cursor-pointer transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99]"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
      onClick={() => navigate(`/finance/${entry.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
              isCredit ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}
          >
            {isCredit
              ? <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" />
              : <ArrowDownRight size={16} className="text-red-600 dark:text-red-400" />
            }
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{entry.title}</p>
            {entry.description && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                {entry.description}
              </p>
            )}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {entry.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 shrink-0">
          <div className="text-right">
            <p
              className={`font-semibold text-sm ${
                isCredit
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isCredit ? '+' : '-'}{formatAmount(entry.amount, entry.currency)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {formatDate(entry.entryDate)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950"
            aria-label="Delete entry"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>
    </article>
  );
}
