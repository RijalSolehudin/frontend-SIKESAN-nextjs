import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export interface CreateExpensePayload {
  expense_category_id: number;
  amount: number;
  date: string;
  description: string;
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpensePayload) => {
      const response = await apiClient.post('/expenses', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate ledger to update global history
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
    },
  });
};
