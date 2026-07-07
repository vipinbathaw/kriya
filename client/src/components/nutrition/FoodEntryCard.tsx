import { useNavigate } from 'react-router-dom';
import { Trash2, Apple, Loader2, AlertCircle } from 'lucide-react';
import type { NutritionEntry } from '@kriya/shared';

interface FoodEntryCardProps {
  entry: NutritionEntry;
  onDelete: (id: string) => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  lunch: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  dinner: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  snack: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

export function FoodEntryCard({ entry, onDelete }: FoodEntryCardProps) {
  const navigate = useNavigate();
  const totalCalories = entry.items.reduce((sum, i) => sum + i.calories, 0);

  const statusBadge = entry.status === 'pending' ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
      <Loader2 size={10} className="animate-spin" /> Processing
    </span>
  ) : entry.status === 'failed' ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
      <AlertCircle size={10} /> Failed
    </span>
  ) : null;

  return (
    <div
      className="group rounded-xl border p-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
      onClick={() => navigate(`/nutrition/${entry.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <Apple size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MEAL_COLORS[entry.mealType] || ''}`}>
            {MEAL_LABELS[entry.mealType] || entry.mealType}
          </span>
          {statusBadge}
          {entry.status === 'completed' && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {totalCalories.toFixed(0)} cal
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950"
          aria-label="Delete entry"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>

      <p className="text-sm italic mb-3" style={{ color: 'var(--muted-foreground)' }}>
        &ldquo;{entry.rawInput}&rdquo;
      </p>

      {entry.status === 'pending' && (
        <div className="flex items-center justify-center py-4 gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <Loader2 size={16} className="animate-spin" />
          Analyzing with AI...
        </div>
      )}

      {entry.status === 'failed' && (
        <div className="flex items-center justify-center py-4 gap-2 text-sm text-red-500">
          <AlertCircle size={16} />
          {entry.errorMessage ?? 'Analysis failed'}
        </div>
      )}

      {entry.status === 'completed' && (
        <div className="space-y-2">
          {entry.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.foodName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold">{item.calories.toFixed(0)} cal</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                  P {item.proteinG.toFixed(0)} &middot; C {item.carbsG.toFixed(0)} &middot; F {item.fatG.toFixed(0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
