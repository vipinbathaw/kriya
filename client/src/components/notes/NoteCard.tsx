import { useNavigate } from 'react-router-dom';
import { TagBadge } from '../shared/TagBadge';
import { Trash2, FileText } from 'lucide-react';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    description?: string | null;
    tags: string[];
    createdAt: string;
  };
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="group rounded-xl border p-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="hidden sm:flex mt-0.5 w-8 h-8 rounded-lg items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <FileText size={16} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{note.title}</h3>
            {note.description && (
              <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                {note.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
          aria-label="Delete note"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {note.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
