import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export interface CreateInfaqPayload {
  student_id?: number | null;
  category_id: number;
  amount: number;
  payment_method: string;
  note?: string;
}

export const useCreateInfaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInfaqPayload) => {
      const response = await apiClient.post('/infaqs', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate ledger to update global history
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
    },
  });
};
