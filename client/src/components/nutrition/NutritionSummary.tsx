import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RDA_FULL, RDA_BY_KEY } from '../../constants/rda';

interface NutritionSummaryProps {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totals: Record<string, number>;
}

const macroKeys = ['calories', 'proteinG', 'carbsG', 'fatG'] as const;

const SECTION_ORDER = [
  'Macronutrients', 'Fats Breakdown', 'Minerals', 'Vitamins', 'Other',
] as const;

const SECTION_FIELDS: Record<string, string[]> = {
  'Macronutrients': ['fiberG', 'sugarG'],
  'Fats Breakdown': ['saturatedFatG', 'transFatG', 'monounsaturatedFatG', 'polyunsaturatedFatG'],
  'Minerals': ['sodiumMg', 'potassiumMg', 'calciumMg', 'ironMg', 'magnesiumMg', 'zincMg', 'phosphorusMg', 'seleniumIug', 'copperMg', 'manganeseMg'],
  'Vitamins': ['vitaminAIug', 'vitaminCMg', 'vitaminDIug', 'vitaminEMg', 'vitaminKIug', 'vitaminB6Mg', 'vitaminB12Iug', 'folateIug'],
  'Other': ['cholesterolMg'],
};

export function NutritionSummary({
  date,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  totals,
}: NutritionSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const macros: Record<string, number> = {
    calories: totalCalories,
    proteinG: totalProtein,
    carbsG: totalCarbs,
    fatG: totalFat,
  };

  const dateLabel = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="rounded-xl border p-4 mb-4"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold">{dateLabel}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--primary)' }}>
            {totalCalories.toFixed(0)} <span className="text-sm font-normal" style={{ color: 'var(--muted-foreground)' }}>/ 2000 kcal</span>
            <span className="text-sm font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>
              ({Math.round((totalCalories / 2000) * 100)}%)
            </span>
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1 rounded-md transition-colors hover:bg-muted shrink-0 mt-1"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      <div className="space-y-2">
        {RDA_FULL.filter((n) => macroKeys.includes(n.key as any) && n.key !== 'calories').map((nutrient) => {
          const value = macros[nutrient.key] ?? 0;
          const pct = nutrient.target > 0 ? Math.round((value / nutrient.target) * 100) : 0;
          const cappedPct = Math.min(pct, 100);
          const exceeded = nutrient.max && pct > 100;

          return (
            <div key={nutrient.key} className="flex items-center gap-2">
              <span className="text-xs w-12 shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {nutrient.label}
              </span>
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: `${nutrient.color}20` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cappedPct}%`,
                    backgroundColor: exceeded ? '#ef4444' : nutrient.color,
                  }}
                />
              </div>
              <span className="text-xs font-medium w-28 text-right" style={{ color: 'var(--muted-foreground)' }}>
                {value.toFixed(1)}/{nutrient.target}{nutrient.unit}
              </span>
            </div>
          );
        })}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {SECTION_ORDER.map((section) => {
            const fields = SECTION_FIELDS[section].filter((f) => RDA_BY_KEY[f]);
            if (fields.length === 0) return null;

            return (
              <div key={section} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>{section}</p>
                <div className="space-y-1.5">
                  {fields.map((field) => {
                    const rda = RDA_BY_KEY[field];
                    if (!rda) return null;
                    const value = totals[field] ?? 0;
                    const pct = rda.target > 0 ? Math.round((value / rda.target) * 100) : 0;
                    const cappedPct = Math.min(pct, 100);
                    const exceeded = rda.max && pct > 100;

                    return (
                      <div key={field} className="flex items-center gap-2">
                        <span className="text-xs w-24 shrink-0 truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {rda.label}
                        </span>
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: `${rda.color}20` }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cappedPct}%`,
                              backgroundColor: exceeded ? '#ef4444' : rda.color,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium w-20 text-right"
                          style={{ color: exceeded ? '#ef4444' : 'var(--muted-foreground)' }}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
