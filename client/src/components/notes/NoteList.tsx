import { NoteCard } from './NoteCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { StickyNote, ChevronDown } from 'lucide-react';
import type { Note } from '@kriya/shared';

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export function NoteList({
  notes,
  isLoading,
  isEmpty,
  hasMore,
  onLoadMore,
  onDelete,
  onCreateNew,
}: NoteListProps) {
  if (isLoading && notes.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 animate-pulse-soft"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="h-5 w-3/4 rounded bg-current opacity-10 mb-3" />
            <div className="h-4 w-full rounded bg-current opacity-10 mb-2" />
            <div className="h-4 w-2/3 rounded bg-current opacity-10" />
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No notes yet"
        description="Create your first note to get started."
        action={
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Create note
          </button>
        }
      />
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {notes.map((note, i) => (
          <div key={note.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <NoteCard note={note} onDelete={onDelete} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
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
      {isLoading && notes.length > 0 && <LoadingSpinner />}
    </div>
  );
}
