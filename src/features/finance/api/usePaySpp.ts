import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export interface PaySppPayload {
  student_id: number;
  bill_ids: string[];
  total_amount: number;
  proof?: File | null;
}

export const usePaySpp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaySppPayload) => {
      if (data.proof) {
        const formData = new FormData();
        formData.append('student_id', String(data.student_id));
        data.bill_ids.forEach((id) => formData.append('bill_ids[]', id));
        formData.append('total_amount', String(data.total_amount));
        formData.append('proof', data.proof);

        const response = await apiClient.post('/spp/payments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      const response = await apiClient.post('/spp/payments', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-bills', variables.student_id] });
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'treasurer-metrics'] });
    },
  });
};
