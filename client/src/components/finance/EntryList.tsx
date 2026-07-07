import { EntryRow } from './EntryRow';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { Wallet, ChevronDown } from 'lucide-react';
import type { FinanceEntry } from '@kriya/shared';

interface EntryListProps {
  entries: FinanceEntry[];
  isLoading: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export function EntryList({
  entries, isLoading, isEmpty, hasMore, onLoadMore, onDelete, onCreateNew,
}: EntryListProps) {
  if (isLoading && entries.length === 0) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 animate-pulse-soft"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/2 rounded bg-current opacity-10" />
                <div className="h-3 w-1/3 rounded bg-current opacity-10" />
              </div>
              <div className="h-4 w-20 rounded bg-current opacity-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={Wallet}
        title="No entries yet"
        description="Add your first income or expense to start tracking."
        action={
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Add entry
          </button>
        }
      />
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={entry.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <EntryRow key={entry.id} entry={entry} onDelete={onDelete} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
          >
            {isLoading ? 'Loading...' : 'Load more'}
            <ChevronDown size={16} />
          </button>
        </div>
      )}
      {isLoading && entries.length > 0 && <LoadingSpinner />}
    </div>
  );
}
