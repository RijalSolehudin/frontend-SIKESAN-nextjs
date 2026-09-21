import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { DormitoriesResponse } from '../types';

export const useGetDormitories = () => {
  return useQuery({
    queryKey: ['master-data', 'dormitories'],
    queryFn: async () => {
      const response = await apiClient.get<DormitoriesResponse>('/dormitories');
      return response.data.data;
    },
  });
};
