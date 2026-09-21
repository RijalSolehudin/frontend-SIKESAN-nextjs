import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export interface CreateInfaqPayload {
  student_id?: number | null;
  category_id: number;
  amount: number;
  payment_method: string;
  note?: string;
  proof?: File | null;
}

export const useCreateInfaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInfaqPayload) => {
      if (data.proof) {
        const formData = new FormData();
        if (data.student_id) formData.append('student_id', String(data.student_id));
        formData.append('category_id', String(data.category_id));
        formData.append('amount', String(data.amount));
        formData.append('payment_method', data.payment_method);
        if (data.note) formData.append('note', data.note);
        formData.append('proof', data.proof);

        const response = await apiClient.post('/infaqs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      const response = await apiClient.post('/infaqs', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate ledger to update global history
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'treasurer-metrics'] });
    },
  });
};
