import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SppReceiptResponse } from '../types';

export const useGetSppReceipt = (paymentId: string | null) => {
  return useQuery({
    queryKey: ['finance', 'spp-receipt', paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      const response = await apiClient.get<SppReceiptResponse>(`/spp/payments/${paymentId}/receipt`);
      return response.data.data;
    },
    enabled: Boolean(paymentId),
  });
};
