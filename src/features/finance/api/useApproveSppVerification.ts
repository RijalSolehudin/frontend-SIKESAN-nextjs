import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export const useApproveSppVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/spp/verifications/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-bills'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'treasurer-metrics'] });
    },
  });
};
