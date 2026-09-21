import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export interface PaySppPayload {
  student_id: number;
  bill_ids: string[];
  total_amount: number;
}

export const usePaySpp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaySppPayload) => {
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
