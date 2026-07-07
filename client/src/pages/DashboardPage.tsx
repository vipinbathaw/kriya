import { useQueries } from '@tanstack/react-query';
import { financeApi } from '../services/finance.api';
import { nutritionApi } from '../services/nutrition.api';

import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { RDA_STANDARDS } from '../constants/rda';
import { Wallet, Apple } from 'lucide-react';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function monthStart(date: string): string {
  return date.slice(0, 7) + '-01';
}

function monthEnd(date: string): string {
  const [y, m] = date.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${date.slice(0, 7)}-${String(lastDay).padStart(2, '0')}`;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'INR' ? '\u20B9' : currency === 'USD' ? '$' : currency + ' ';
  const value = (amount / 100).toFixed(2);
  return `${symbol}${value}`;
}

function aggregateTotals(items: { calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number; sugarG: number; sodiumMg: number }[]) {
  return {
    calories: items.reduce((s, i) => s + i.calories, 0),
    proteinG: items.reduce((s, i) => s + i.proteinG, 0),
    carbsG: items.reduce((s, i) => s + i.carbsG, 0),
    fatG: items.reduce((s, i) => s + i.fatG, 0),
    fiberG: items.reduce((s, i) => s + i.fiberG, 0),
    sugarG: items.reduce((s, i) => s + i.sugarG, 0),
    sodiumMg: items.reduce((s, i) => s + i.sodiumMg, 0),
  };
}

export function DashboardPage() {
  const today = todayStr();
  const monthStartDate = monthStart(today);
  const monthEndDate = monthEnd(today);

  const results = useQueries({
    queries: [
      {
        queryKey: ['finance-summary', 'today'],
        queryFn: () => financeApi.summary({ from: today, to: today }),
      },
      {
        queryKey: ['finance-summary', 'month'],
        queryFn: () => financeApi.summary({ from: monthStartDate, to: monthEndDate }),
      },
      {
        queryKey: ['nutrition', 'today'],
        queryFn: () => nutritionApi.list({ from: today, to: today, limit: 50 }),
      },
    ],
  });

  const [todayFinance, monthFinance, nutritionResult] = results;

  const isLoading = todayFinance.isLoading || monthFinance.isLoading || nutritionResult.isLoading;

  const nutritionEntries = nutritionResult.data?.data ?? [];
  const allItems = nutritionEntries.flatMap((e) => e.items);
  const totals = aggregateTotals(allItems);

  const monthLabel = new Date(today).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const dateLabel = new Date(today).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <Wallet size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              Finance
            </h2>

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
              }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Today &middot; {dateLabel}
              </p>
              {todayFinance.data ? (() => {
                const balance = todayFinance.data.totalCredits - todayFinance.data.totalDebits;
                return (
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {balance >= 0 ? '+' : ''}{formatAmount(balance, todayFinance.data.currency)}
                  </p>
                );
              })() : (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No entries today</p>
              )}
            </div>

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
              }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>
                This Month &middot; {monthLabel}
              </p>
              {monthFinance.data ? (() => {
                const balance = monthFinance.data.totalCredits - monthFinance.data.totalDebits;
                return (
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {balance >= 0 ? '+' : ''}{formatAmount(balance, monthFinance.data.currency)}
                  </p>
                );
              })() : (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No entries this month</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1.5">
                <Apple size={14} /> Nutrition Today
              </span>
            </h2>

            <div
              className="rounded-xl border p-5"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
              }}
            >
              {allItems.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  No meals logged today
                </p>
              ) : (
                <div className="space-y-4">
                  {RDA_STANDARDS.map((nutrient) => {
                    const value = totals[nutrient.key as keyof typeof totals];
                    const pct = nutrient.target > 0 ? Math.round((value / nutrient.target) * 100) : 0;
                    const cappedPct = Math.min(pct, 100);
                    const exceeded = nutrient.max && pct > 100;

                    return (
                      <div key={nutrient.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{nutrient.label}</span>
                          <span className="text-xs font-medium" style={{ color: exceeded ? '#ef4444' : 'var(--muted-foreground)' }}>
                            {nutrient.key === 'calories'
                              ? value.toFixed(0)
                              : value.toFixed(1)}{' '}
                            / {nutrient.target}
                            <span className="text-[10px] ml-0.5">{nutrient.unit}</span>
                            <span className="ml-1">({pct}%)</span>
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
