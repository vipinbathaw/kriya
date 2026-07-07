import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../services/finance.api';
import { EntryForm } from '../components/finance/EntryForm';
import { useToastStore } from '../stores/toast.store';
import type { FinanceEntry } from '@kriya/shared';

export function CreateFinancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [tags, setTags] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof financeApi.create>[0]) =>
      financeApi.create(data),
    onSuccess: (entry: FinanceEntry) => {
      setTags(entry.tags);
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      addToast('Entry created', 'success');
      setTimeout(() => navigate('/finance'), 300);
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Entry</h1>
      <EntryForm
        tags={tags}
        loading={mutation.isPending}
        onSave={async (data) => {
          await mutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
