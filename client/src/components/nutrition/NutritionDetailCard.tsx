import { useState } from 'react';
import type { NutritionEntry } from '@kriya/shared';
import { Apple, Flame, Loader2, AlertCircle } from 'lucide-react';
import { RDA_BY_KEY } from '../../constants/rda';

interface NutritionDetailCardProps {
  entry: NutritionEntry;
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

type NutritionItemFields = Omit<import('@kriya/shared').NutritionItem, 'id' | 'foodName' | 'quantity' | 'unit'>;

interface NutrientRow {
  label: string;
  field: keyof NutritionItemFields | null;
  unit: string;
  items: number[];
  color: string;
}

function sum(items: number[]): number {
  return items.reduce((a, b) => a + b, 0);
}

function MacroBar({ label, value, color, rdaTarget, maxValue }: { label: string; value: number; color: string; rdaTarget?: { target: number; unit: string; max?: boolean }; maxValue?: number }) {
  const relativeMax = maxValue && maxValue > 0 ? maxValue : 1;
  const pct = rdaTarget && rdaTarget.target > 0
    ? Math.min((value / rdaTarget.target) * 100, 100)
    : Math.min((value / relativeMax) * 100, 100);
  const exceeded = rdaTarget?.max && value > rdaTarget.target;
  const barColor = exceeded ? '#ef4444' : color;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-12 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <div
        className="flex-1 h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: `${barColor}20` }}
      >
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
      <span className="text-xs font-medium w-28 text-right" style={{ color: exceeded ? '#ef4444' : 'var(--muted-foreground)' }}>
        {value.toFixed(1)}g{rdaTarget ? ` / ${rdaTarget.target}${rdaTarget.unit} (${Math.round(value / rdaTarget.target * 100)}%)` : ''}
      </span>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className="inline-flex items-center gap-2 text-xs font-medium"
      style={{ color: 'var(--muted-foreground)' }}
      role="switch"
      aria-checked={checked}
    >
      <span>{label}</span>
      <span
        className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors items-center"
        style={{
          backgroundColor: checked ? 'var(--primary)' : 'var(--muted)',
        }}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform"
          style={{
            translate: checked ? '18px' : '2px',
          }}
        />
      </span>
    </button>
  );
}

export function NutritionDetailCard({ entry }: NutritionDetailCardProps) {
  const [showRda, setShowRda] = useState(false);

  const totalCalories = sum(entry.items.map((i) => i.calories));
  const totalProtein = sum(entry.items.map((i) => i.proteinG));
  const totalCarbs = sum(entry.items.map((i) => i.carbsG));
  const totalFat = sum(entry.items.map((i) => i.fatG));
  const maxMacro = Math.max(totalProtein, totalCarbs, totalFat, 1);

  const dateLabel = new Date(entry.entryDate).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const macroSections: Array<{ title: string; rows: NutrientRow[] }> = [
    {
      title: 'Macronutrients',
      rows: [
        { label: 'Protein', field: 'proteinG', unit: 'g', items: entry.items.map((i) => i.proteinG), color: '#ef4444' },
        { label: 'Carbs', field: 'carbsG', unit: 'g', items: entry.items.map((i) => i.carbsG), color: '#f59e0b' },
        { label: 'Fat', field: 'fatG', unit: 'g', items: entry.items.map((i) => i.fatG), color: '#3b82f6' },
        { label: 'Fiber', field: 'fiberG', unit: 'g', items: entry.items.map((i) => i.fiberG), color: '#10b981' },
        { label: 'Sugar', field: 'sugarG', unit: 'g', items: entry.items.map((i) => i.sugarG), color: '#ec4899' },
      ],
    },
    {
      title: 'Fats Breakdown',
      rows: [
        { label: 'Saturated', field: 'saturatedFatG', unit: 'g', items: entry.items.map((i) => i.saturatedFatG), color: '#f97316' },
        { label: 'Trans', field: 'transFatG', unit: 'g', items: entry.items.map((i) => i.transFatG), color: '#dc2626' },
        { label: 'Monounsaturated', field: 'monounsaturatedFatG', unit: 'g', items: entry.items.map((i) => i.monounsaturatedFatG), color: '#a855f7' },
        { label: 'Polyunsaturated', field: 'polyunsaturatedFatG', unit: 'g', items: entry.items.map((i) => i.polyunsaturatedFatG), color: '#06b6d4' },
      ],
    },
    {
      title: 'Minerals',
      rows: [
        { label: 'Sodium', field: 'sodiumMg', unit: 'mg', items: entry.items.map((i) => i.sodiumMg), color: '#6366f1' },
        { label: 'Potassium', field: 'potassiumMg', unit: 'mg', items: entry.items.map((i) => i.potassiumMg), color: '#8b5cf6' },
        { label: 'Calcium', field: 'calciumMg', unit: 'mg', items: entry.items.map((i) => i.calciumMg), color: '#d97706' },
        { label: 'Iron', field: 'ironMg', unit: 'mg', items: entry.items.map((i) => i.ironMg), color: '#dc2626' },
        { label: 'Magnesium', field: 'magnesiumMg', unit: 'mg', items: entry.items.map((i) => i.magnesiumMg), color: '#059669' },
        { label: 'Zinc', field: 'zincMg', unit: 'mg', items: entry.items.map((i) => i.zincMg), color: '#7c3aed' },
        { label: 'Phosphorus', field: 'phosphorusMg', unit: 'mg', items: entry.items.map((i) => i.phosphorusMg), color: '#0284c7' },
        { label: 'Selenium', field: 'seleniumIug', unit: '\u00b5g', items: entry.items.map((i) => i.seleniumIug), color: '#0d9488' },
        { label: 'Copper', field: 'copperMg', unit: 'mg', items: entry.items.map((i) => i.copperMg), color: '#b45309' },
        { label: 'Manganese', field: 'manganeseMg', unit: 'mg', items: entry.items.map((i) => i.manganeseMg), color: '#4d7c0f' },
      ],
    },
    {
      title: 'Vitamins',
      rows: [
        { label: 'Vitamin A', field: 'vitaminAIug', unit: '\u00b5g', items: entry.items.map((i) => i.vitaminAIug), color: '#f59e0b' },
        { label: 'Vitamin C', field: 'vitaminCMg', unit: 'mg', items: entry.items.map((i) => i.vitaminCMg), color: '#10b981' },
        { label: 'Vitamin D', field: 'vitaminDIug', unit: '\u00b5g', items: entry.items.map((i) => i.vitaminDIug), color: '#eab308' },
        { label: 'Vitamin E', field: 'vitaminEMg', unit: 'mg', items: entry.items.map((i) => i.vitaminEMg), color: '#84cc16' },
        { label: 'Vitamin K', field: 'vitaminKIug', unit: '\u00b5g', items: entry.items.map((i) => i.vitaminKIug), color: '#22c55e' },
        { label: 'Vitamin B6', field: 'vitaminB6Mg', unit: 'mg', items: entry.items.map((i) => i.vitaminB6Mg), color: '#a855f7' },
        { label: 'Vitamin B12', field: 'vitaminB12Iug', unit: '\u00b5g', items: entry.items.map((i) => i.vitaminB12Iug), color: '#ec4899' },
        { label: 'Folate', field: 'folateIug', unit: '\u00b5g', items: entry.items.map((i) => i.folateIug), color: '#06b6d4' },
      ],
    },
    {
      title: 'Other',
      rows: [
        { label: 'Cholesterol', field: 'cholesterolMg', unit: 'mg', items: entry.items.map((i) => i.cholesterolMg), color: '#ef4444' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div className="mb-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${MEAL_COLORS[entry.mealType] || ''}`}>
            {MEAL_LABELS[entry.mealType] || entry.mealType}
          </span>
          <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>{dateLabel}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <ToggleSwitch checked={showRda} onChange={() => setShowRda((v) => !v)} label="RDA" />
          <div className="flex items-center gap-1.5">
            <Flame size={18} className="text-orange-500" />
            <span className="text-xl font-bold">
              {totalCalories.toFixed(0)}
              {showRda ? ` / 2000` : ''}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>cal</span>
            {showRda && (
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                ({Math.round((totalCalories / 2000) * 100)}%)
              </span>
            )}
          </div>
        </div>

        <p className="text-sm italic mb-4" style={{ color: 'var(--muted-foreground)' }}>
          &ldquo;{entry.rawInput}&rdquo;
        </p>

        {entry.status === 'pending' && (
          <div className="flex items-center justify-center py-8 gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <Loader2 size={20} className="animate-spin" />
            Analyzing your meal with AI...
          </div>
        )}

        {entry.status === 'failed' && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-sm text-red-500">
            <AlertCircle size={20} />
            <p>{entry.errorMessage ?? 'Analysis failed. Please try again.'}</p>
          </div>
        )}

        {entry.status === 'completed' && (
          <><div className="space-y-2 mb-5">
            <MacroBar label="Protein" value={totalProtein} color="#ef4444" rdaTarget={showRda ? RDA_BY_KEY.proteinG : undefined} maxValue={maxMacro} />
            <MacroBar label="Carbs" value={totalCarbs} color="#f59e0b" rdaTarget={showRda ? RDA_BY_KEY.carbsG : undefined} maxValue={maxMacro} />
            <MacroBar label="Fat" value={totalFat} color="#3b82f6" rdaTarget={showRda ? RDA_BY_KEY.fatG : undefined} maxValue={maxMacro} />
        </div>

        <div className="space-y-3">
              {entry.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Apple size={14} style={{ color: 'var(--muted-foreground)' }} />
                    <span className="font-medium text-sm">{item.foodName}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      ({item.quantity} {item.unit})
                    </span>
                    <span className="text-xs font-semibold ml-auto">{item.calories.toFixed(0)} cal</span>
                  </div>
                  <div className="flex text-xs gap-4" style={{ color: 'var(--muted-foreground)' }}>
                    <span>P: {item.proteinG.toFixed(1)}g</span>
                    <span className="mr-auto">F: {item.fatG.toFixed(1)}g</span>
                    <span>C: {item.carbsG.toFixed(1)}g</span>
                    <span>Fiber: {item.fiberG.toFixed(1)}g</span>
                  </div>
                </div>
              ))}
            </div></>
        )}
      </div>

      {entry.status === 'completed' && macroSections.map((section) => (
        <div
          key={section.title}
          className="rounded-xl border p-5"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--card-foreground)',
          }}
        >
          <h3 className="text-sm font-semibold mb-3">{section.title}</h3>
          <div className="space-y-2">
            {section.rows.map((row) => {
              const total = sum(row.items);
              const rda = row.field ? RDA_BY_KEY[row.field] : undefined;
              const pct = showRda && rda && rda.target > 0 ? Math.round((total / rda.target) * 100) : undefined;
              const exceeded = showRda && rda?.max && total > rda.target;

              return (
                <div key={row.label} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="text-sm">{row.label}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: exceeded ? '#ef4444' : undefined }}>
                    {showRda && rda ? (
                      <>{total.toFixed(1)} / {rda.target}<span className="text-xs" style={{ color: 'var(--muted-foreground)' }}> {row.unit}</span>
                        <span className="text-xs ml-1" style={{ color: exceeded ? '#ef4444' : 'var(--muted-foreground)' }}>({pct}%)</span>
                      </>
                    ) : (
                      <>{total.toFixed(1)} <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.unit}</span></>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
