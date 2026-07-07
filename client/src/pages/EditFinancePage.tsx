import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../services/finance.api';
import { EntryForm } from '../components/finance/EntryForm';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useToastStore } from '../stores/toast.store';

export function EditFinancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['finance-entry', id],
    queryFn: () => financeApi.getById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof financeApi.update>[1]) =>
      financeApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-entry', id] });
      addToast('Entry updated', 'success');
      navigate('/finance');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!entry) return (
    <div className="p-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
      Entry not found
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Entry</h1>
      <EntryForm
        defaultValues={{
          type: entry.type,
          title: entry.title,
          description: entry.description,
          amount: entry.amount,
          currency: entry.currency,
          entryDate: entry.entryDate,
        }}
        tags={entry.tags}
        loading={mutation.isPending}
        onSave={async (data) => {
          await mutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
