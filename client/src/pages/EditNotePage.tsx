import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/notes.api';
import { NoteForm } from '../components/notes/NoteForm';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useToastStore } from '../stores/toast.store';

export function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      notesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      addToast('Note updated', 'success');
      navigate('/notes');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!note) return (
    <div className="p-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
      Note not found
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Note</h1>
      <NoteForm
        defaultValues={{ title: note.title, description: note.description ?? '' }}
        tags={note.tags}
        loading={mutation.isPending}
        onSave={async (data) => {
          await mutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
