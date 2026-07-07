import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/notes.api';
import { TagBadge } from '../components/shared/TagBadge';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useToastStore } from '../stores/toast.store';
import { FileText, ArrowLeft, Edit3, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showDelete, setShowDelete] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      addToast('Note deleted', 'success');
      navigate('/notes');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!note) return (
    <div className="p-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
      Note not found
    </div>
  );

  const dateLabel = new Date(note.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => navigate('/notes')}
        className="flex items-center gap-1 text-sm mb-4 transition-opacity hover:opacity-70 active:scale-[0.97]"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ArrowLeft size={16} /> Back to Notes
      </button>

      <article
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="hidden sm:flex mt-0.5 w-10 h-10 rounded-xl items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <FileText size={20} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold break-words">{note.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={14} style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dateLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/notes/${id}/edit`}
              className="p-2 rounded-lg transition-all hover:opacity-80 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
              aria-label="Edit note"
            >
              <Edit3 size={16} />
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-950 active:scale-[0.97]"
              aria-label="Delete note"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {note.description ? (
          <div
            className="prose prose-sm max-w-none mt-4 pt-4"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{note.description}</p>
          </div>
        ) : (
          <p
            className="mt-4 pt-4 text-sm italic"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
            }}
          >
            No description
          </p>
        )}
      </article>

      <ConfirmDialog
        open={showDelete}
        title="Delete note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMutation.mutateAsync()}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
