import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../services/nutrition.api';
import { FoodEntryCard } from '../components/nutrition/FoodEntryCard';
import { NutritionSummary } from '../components/nutrition/NutritionSummary';
import { PageHeader } from '../components/shared/PageHeader';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useToastStore } from '../stores/toast.store';
import { Apple, Plus, ChevronDown } from 'lucide-react';
import type { NutritionEntry } from '@kriya/shared';

const NUTRIENT_KEYS = ['calories', 'proteinG', 'carbsG', 'fatG', 'fiberG', 'sugarG', 'sodiumMg', 'saturatedFatG', 'transFatG', 'monounsaturatedFatG', 'polyunsaturatedFatG', 'cholesterolMg', 'potassiumMg', 'calciumMg', 'ironMg', 'vitaminAIug', 'vitaminCMg', 'vitaminDIug', 'vitaminEMg', 'vitaminKIug', 'vitaminB6Mg', 'vitaminB12Iug', 'folateIug', 'magnesiumMg', 'zincMg', 'phosphorusMg', 'seleniumIug', 'copperMg', 'manganeseMg'] as const;

function groupByDate(entries: NutritionEntry[]): Map<string, NutritionEntry[]> {
  const map = new Map<string, NutritionEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.entryDate) ?? [];
    list.push(entry);
    map.set(entry.entryDate, list);
  }
  return map;
}

export function NutritionListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['nutrition'],
    queryFn: ({ pageParam }) => nutritionApi.list({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: (query) => {
      const pages = query.state.data?.pages ?? [];
      const hasPending = pages.some((p) => p.data.some((e) => e.status !== 'completed'));
      return hasPending ? 3000 : false;
    },
  });

  const allEntries = data?.pages.flatMap((p) => p.data) ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => nutritionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });

  const grouped = groupByDate(allEntries);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    addToast('Entry deleted', 'success');
  }, [deleteId, deleteMutation, addToast]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <PageHeader title="Nutrition" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <PageHeader
        title="Nutrition"
        action={
          <button
            onClick={() => navigate('/nutrition/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={16} /> Log Meal
          </button>
        }
      />

      {allEntries.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="No meals logged"
          description="Track what you eat to see your nutrition breakdown."
          action={
            <button
              onClick={() => navigate('/nutrition/new')}
              className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Log your first meal
            </button>
          }
        />
      ) : (
        <>
          {Array.from(grouped.entries()).map(([date, dateEntries]) => {
            const totals: Record<string, number> = {};
            for (const key of NUTRIENT_KEYS) {
              totals[key] = dateEntries.reduce((s, e) => s + e.items.reduce((s2, i) => s2 + (i as any)[key], 0), 0);
            }

            return (
              <div key={date}>
                <NutritionSummary
                  date={date}
                  totalCalories={totals.calories}
                  totalProtein={totals.proteinG}
                  totalCarbs={totals.carbsG}
                  totalFat={totals.fatG}
                  totals={totals}
                />
                <div className="space-y-3 mb-6">
                  {dateEntries.map((entry, i) => (
                    <div key={entry.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                      <FoodEntryCard entry={entry} onDelete={(id) => setDeleteId(id)} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {hasNextPage && (
            <div className="text-center mt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete entry"
        message="Are you sure you want to delete this nutrition entry?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
