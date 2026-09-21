import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SppVerificationsResponse } from '../types';

interface UseGetSppVerificationsParams {
  page?: number;
  per_page?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'all';
  search?: string;
}

export const useGetSppVerifications = (params?: UseGetSppVerificationsParams) => {
  return useQuery({
    queryKey: ['finance', 'spp-verifications', params],
    queryFn: async () => {
      const response = await apiClient.get<SppVerificationsResponse>('/spp/verifications', {
        params,
      });
      return response.data;
    },
  });
};
