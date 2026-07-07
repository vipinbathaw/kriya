import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/notes.api';
import { NoteList } from '../components/notes/NoteList';
import { PageHeader } from '../components/shared/PageHeader';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useToastStore } from '../stores/toast.store';
import { Plus } from 'lucide-react';
import type { Note } from '@kriya/shared';

export function NotesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [cursor, setCursor] = useState<string | undefined>();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notes', cursor],
    queryFn: () => notesApi.list({ cursor, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const notes = data?.data ?? [];
  const nextCursor = data?.nextCursor ?? null;

  if (cursor && notes.length > 0 && allNotes.length === 0) {
    setAllNotes(notes);
  } else if (!cursor && notes.length > 0) {
    if (allNotes.length !== notes.length || allNotes.some((n, i) => n.id !== notes[i]?.id)) {
      setAllNotes(notes);
    }
  } else if (cursor && notes.length > 0) {
    const existingIds = new Set(allNotes.map((n) => n.id));
    const newNotes = notes.filter((n) => !existingIds.has(n.id));
    if (newNotes.length > 0) {
      setAllNotes((prev) => [...prev, ...newNotes]);
    }
  }

  const displayNotes = cursor ? allNotes : notes;

  const handleLoadMore = useCallback(() => {
    if (nextCursor) setCursor(nextCursor);
  }, [nextCursor]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    setAllNotes((prev) => prev.filter((n) => n.id !== deleteId));
    addToast('Note deleted', 'success');
  }, [deleteId, deleteMutation, addToast]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <PageHeader
        title="Notes"
        action={
          <button
            onClick={() => navigate('/notes/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={16} /> New Note
          </button>
        }
      />

      <NoteList
        notes={displayNotes}
        isLoading={isLoading}
        isEmpty={!isLoading && displayNotes.length === 0}
        hasMore={!!nextCursor}
        onLoadMore={handleLoadMore}
        onDelete={(id) => setDeleteId(id)}
        onCreateNew={() => navigate('/notes/new')}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
