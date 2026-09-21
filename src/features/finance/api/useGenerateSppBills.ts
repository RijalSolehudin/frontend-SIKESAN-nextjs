import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export interface GenerateSppPayload {
  period_month: number;
  period_year: number;
}

export const useGenerateSppBills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateSppPayload) => {
      const response = await apiClient.post('/spp/generate-bills', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-bills'] });
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'treasurer-metrics'] });
    },
  });
};
