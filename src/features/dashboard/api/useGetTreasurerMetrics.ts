import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { TreasurerMetricsResponse } from '../types';

export const useGetTreasurerMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'treasurer-metrics'],
    queryFn: async () => {
      const response = await apiClient.get<TreasurerMetricsResponse>('/dashboard/treasurer');
      return response.data.data;
    },
  });
};
