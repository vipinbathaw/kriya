import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/notes.api';
import { NoteList } from '../components/notes/NoteList';
import { PageHeader } from '../components/shared/PageHeader';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useToastStore } from '../stores/toast.store';
import { Plus } from 'lucide-react';

export function NotesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['notes'],
    queryFn: ({ pageParam }) => notesApi.list({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const notes = data?.pages.flatMap((p) => p.data) ?? [];
  const nextCursor = data?.pages[data.pages.length - 1]?.nextCursor ?? null;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
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
        notes={notes}
        isLoading={isLoading}
        isEmpty={!isLoading && notes.length === 0}
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
