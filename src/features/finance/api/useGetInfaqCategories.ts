import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { InfaqCategory } from '../types';

export const useGetInfaqCategories = () => {
  return useQuery({
    queryKey: ['finance', 'infaq-categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: InfaqCategory[] }>('/infaq-categories');
      return response.data.data;
    },
  });
};
