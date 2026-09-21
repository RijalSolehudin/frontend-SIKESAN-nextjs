import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

interface RejectPayload {
  id: string;
  rejection_reason: string;
}

export const useRejectSppVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rejection_reason }: RejectPayload) => {
      const response = await apiClient.post(`/spp/verifications/${id}/reject`, {
        rejection_reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-bills'] });
    },
  });
};
