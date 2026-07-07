import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/notes.api';
import { NoteForm } from '../components/notes/NoteForm';
import { useToastStore } from '../stores/toast.store';
import type { Note } from '@kriya/shared';

export function CreateNotePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [tags, setTags] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      notesApi.create(data),
    onSuccess: (note: Note) => {
      setTags(note.tags);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      addToast('Note created', 'success');
      setTimeout(() => navigate('/notes'), 300);
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Note</h1>
      <NoteForm
        loading={mutation.isPending}
        tags={tags}
        onSave={async (data) => {
          await mutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
