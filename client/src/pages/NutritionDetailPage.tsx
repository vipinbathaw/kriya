import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../services/nutrition.api';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { NutritionDetailCard } from '../components/nutrition/NutritionDetailCard';
import { useToastStore } from '../stores/toast.store';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function NutritionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showDelete, setShowDelete] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['nutrition-entry', id],
    queryFn: () => nutritionApi.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const entry = query.state.data;
      return entry && entry.status !== 'completed' ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => nutritionApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      addToast('Entry deleted', 'success');
      navigate('/nutrition');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!entry) return (
    <div className="p-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
      Entry not found
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/nutrition')}
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70 active:scale-[0.97]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={16} /> Back to Nutrition
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-red-50 dark:hover:bg-red-950 active:scale-[0.97]"
          aria-label="Delete entry"
        >
          <Trash2 size={14} className="text-red-500" />
          <span className="text-red-500">Delete</span>
        </button>
      </div>

      <NutritionDetailCard entry={entry} />

      <ConfirmDialog
        open={showDelete}
        title="Delete entry"
        message="Are you sure you want to delete this nutrition entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMutation.mutateAsync()}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
