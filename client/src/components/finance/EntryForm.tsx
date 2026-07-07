import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TagBadge } from '../shared/TagBadge';
import { DatePicker } from '../shared/DatePicker';

interface EntryFormProps {
  defaultValues?: {
    type?: 'credit' | 'debit';
    title?: string;
    description?: string;
    amount?: number;
    currency?: string;
    entryDate?: string;
  };
  tags?: string[];
  loading: boolean;
  onSave: (data: {
    type: 'credit' | 'debit';
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    entryDate?: string;
  }) => Promise<void>;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export function EntryForm({ defaultValues, tags, loading, onSave }: EntryFormProps) {
  const navigate = useNavigate();
  const [type, setType] = useState<'credit' | 'debit'>(defaultValues?.type ?? 'debit');
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [amount, setAmount] = useState(
    defaultValues?.amount ? String(defaultValues.amount / 100) : '',
  );
  const [entryDate, setEntryDate] = useState(defaultValues?.entryDate ?? today());
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    const inSmallestUnit = Math.round(numAmount * 100);

    await onSave({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      amount: inSmallestUnit,
      currency: 'INR',
      entryDate,
    });
  };

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
        onSubmit={handleSubmit}
        className="rounded-xl border p-6 space-y-5"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        {error && (
          <div className="text-sm p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="flex gap-2">
            {(['debit', 'credit'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all active:scale-[0.97] ${
                  type === t
                    ? 'text-white border-transparent'
                    : 'hover:opacity-70'
                }`}
                style={{
                  backgroundColor: type === t
                    ? (t === 'credit' ? '#16a34a' : '#dc2626')
                    : 'var(--background)',
                  borderColor: type === t ? 'transparent' : 'var(--border)',
                  color: type === t ? 'white' : 'var(--foreground)',
                }}
              >
                {t === 'credit' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: error ? 'var(--destructive)' : 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="e.g., Grocery shopping, Salary"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (&#8377;)</label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              &#8377;
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              inputMode="decimal"
              className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow resize-none"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="Optional description..."
          />
        </div>

        <DatePicker value={entryDate} onChange={setEntryDate} label="Date" />

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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-all active:scale-[0.97]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-70 active:scale-[0.97]"
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
