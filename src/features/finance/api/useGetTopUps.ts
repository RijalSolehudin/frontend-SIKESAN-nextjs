import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { TopUpRequestsResponse } from '../types';

interface UseGetTopUpsParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export const useGetTopUps = (params?: UseGetTopUpsParams) => {
  return useQuery({
    queryKey: ['finance', 'top-ups', params],
    queryFn: async () => {
      const response = await apiClient.get<TopUpRequestsResponse>('/top-ups', { params });
      return response.data.data;
    },
  });
};
