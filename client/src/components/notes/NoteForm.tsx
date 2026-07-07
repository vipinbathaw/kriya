import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteSchema } from '@kriya/shared';
import { TagBadge } from '../shared/TagBadge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { z } from 'zod';

type FormData = z.infer<typeof createNoteSchema>;

interface NoteFormProps {
  defaultValues?: FormData;
  tags?: string[];
  loading: boolean;
  onSave: (data: FormData) => Promise<void>;
}

export function NoteForm({ defaultValues, tags, loading, onSave }: NoteFormProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: defaultValues ?? { title: '', description: '' },
  });

  return (
    <section>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-4 transition-opacity hover:opacity-70 active:scale-[0.97]"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <form
        onSubmit={handleSubmit(onSave)}
        className="rounded-xl border p-6 space-y-4"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            autoFocus
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: errors.title ? 'var(--destructive)' : 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="Note title..."
          />
          {errors.title && (
            <p className="text-xs mt-1 text-red-500" role="alert">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            {...register('description')}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow resize-y"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="Optional description..."
          />
        </div>

        {tags && tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Generated Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-all active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70 active:scale-[0.97]"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
