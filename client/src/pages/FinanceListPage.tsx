import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../services/finance.api';
import { EntryList } from '../components/finance/EntryList';
import { PageHeader } from '../components/shared/PageHeader';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useToastStore } from '../stores/toast.store';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { FinanceEntry } from '@kriya/shared';

function SummaryRow({ summary, label }: { summary: { totalCredits: number; totalDebits: number; currency: string } | undefined; label: string }) {
  if (!summary) return null;
  const balance = summary.totalCredits - summary.totalDebits;
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}>
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Income</p>
          <p className="text-base font-bold text-green-600 dark:text-green-400">+{formatAmount(summary.totalCredits, summary.currency)}</p>
        </div>
        <div className="text-center border-x" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Expenses</p>
          <p className="text-base font-bold text-red-600 dark:text-red-400">-{formatAmount(summary.totalDebits, summary.currency)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Balance</p>
          <p className={`text-base font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{formatAmount(balance, summary.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'INR' ? '\u20B9' : currency === 'USD' ? '$' : currency + ' ';
  const value = (amount / 100).toFixed(2);
  return `${symbol}${value}`;
}

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

export function FinanceListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [cursor, setCursor] = useState<string | undefined>();
  const [allEntries, setAllEntries] = useState<FinanceEntry[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showToday, setShowToday] = useState(false);

  const today = todayStr();
  const monthStartDate = monthStart(today);
  const monthEndDate = monthEnd(today);

  const [{ data: listData, isLoading }, { data: monthSummary }, { data: todaySummary }] = useQueries({
    queries: [
      {
        queryKey: ['finance', cursor],
        queryFn: () => financeApi.list({ cursor, limit: 20 }),
      },
      {
        queryKey: ['finance-summary', 'month'],
        queryFn: () => financeApi.summary({ from: monthStartDate, to: monthEndDate }),
      },
      {
        queryKey: ['finance-summary', 'today'],
        queryFn: () => financeApi.summary({ from: today, to: today }),
        enabled: showToday,
      },
    ],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary', 'month'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary', 'today'] });
    },
  });

  const entries = listData?.data ?? [];
  const nextCursor = listData?.nextCursor ?? null;

  if (cursor && entries.length > 0 && allEntries.length === 0) {
    setAllEntries(entries);
  } else if (!cursor && entries.length > 0) {
    if (allEntries.length !== entries.length || allEntries.some((n, i) => n.id !== entries[i]?.id)) {
      setAllEntries(entries);
    }
  } else if (cursor && entries.length > 0) {
    const existingIds = new Set(allEntries.map((n) => n.id));
    const newEntries = entries.filter((n) => !existingIds.has(n.id));
    if (newEntries.length > 0) {
      setAllEntries((prev) => [...prev, ...newEntries]);
    }
  }

  const displayEntries = cursor ? allEntries : entries;

  const handleLoadMore = useCallback(() => {
    if (nextCursor) setCursor(nextCursor);
  }, [nextCursor]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    setAllEntries((prev) => prev.filter((e) => e.id !== deleteId));
    addToast('Entry deleted', 'success');
  }, [deleteId, deleteMutation, addToast]);

  const monthLabel = new Date(today).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const dateLabel = new Date(today).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });



  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <PageHeader
        title="Finance"
        action={
          <button
            onClick={() => navigate('/finance/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={16} /> Add
          </button>
        }
      />

      <SummaryRow summary={monthSummary} label={`This Month · ${monthLabel}`} />

      <button
        onClick={() => setShowToday((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium mx-auto"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {showToday ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showToday ? 'Hide today' : 'Show today'}
      </button>

      {showToday && <SummaryRow summary={todaySummary} label={`Today · ${dateLabel}`} />}

      <EntryList
        entries={displayEntries}
        isLoading={isLoading}
        isEmpty={!isLoading && displayEntries.length === 0}
        hasMore={!!nextCursor}
        onLoadMore={handleLoadMore}
        onDelete={(id) => setDeleteId(id)}
        onCreateNew={() => navigate('/finance/new')}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
