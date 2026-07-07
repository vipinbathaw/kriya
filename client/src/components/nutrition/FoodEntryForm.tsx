import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { DatePicker } from '../shared/DatePicker';

interface FoodEntryFormProps {
  loading: boolean;
  onSave: (data: { rawInput: string; mealType: string; entryDate: string }) => Promise<void>;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

function today() {
  return new Date().toISOString().split('T')[0];
}

export function FoodEntryForm({ loading, onSave }: FoodEntryFormProps) {
  const navigate = useNavigate();
  const [rawInput, setRawInput] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [entryDate, setEntryDate] = useState(today());
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rawInput.trim()) {
      setError('Please describe what you ate');
      return;
    }
    setError('');
    try {
      await onSave({ rawInput: rawInput.trim(), mealType, entryDate });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    }
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

      {error && (
        <div className="text-sm p-3 rounded-lg mb-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
          {error}
        </div>
      )}

      <div
        className="rounded-xl border p-6 space-y-5"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div>
          <label htmlFor="rawInput" className="block text-sm font-medium mb-2">
            What did you eat?
          </label>
          <textarea
            id="rawInput"
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full px-3 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow resize-none"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="e.g., 1 serving kadhai paneer and 4 roti"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Meal</label>
            <div className="flex flex-wrap gap-1.5">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMealType(m.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor: mealType === m.value ? 'var(--primary)' : 'var(--background)',
                    borderColor: mealType === m.value ? 'var(--primary)' : 'var(--border)',
                    color: mealType === m.value ? 'var(--primary-foreground)' : 'var(--foreground)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:w-40">
            <DatePicker value={entryDate} onChange={setEntryDate} label="Date" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !rawInput.trim()}
          className="w-full py-3 rounded-lg text-white text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99]"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'Analyzing with AI...' : 'Analyze & Save'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
          Your food description will be analyzed by AI to extract nutritional information.
        </p>
      </div>
    </section>
  );
}
