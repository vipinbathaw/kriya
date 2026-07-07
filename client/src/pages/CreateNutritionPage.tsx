import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../services/nutrition.api';
import { FoodEntryForm } from '../components/nutrition/FoodEntryForm';
import { useToastStore } from '../stores/toast.store';

export function CreateNutritionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const createMutation = useMutation({
    mutationFn: (data: { rawInput: string; mealType: string; entryDate: string }) =>
      nutritionApi.create({
        rawInput: data.rawInput,
        mealType: data.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        entryDate: data.entryDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      addToast('Meal queued for analysis', 'success');
      navigate('/nutrition');
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Log Meal</h1>
      <FoodEntryForm
        loading={createMutation.isPending}
        onSave={async (data) => {
          await createMutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
