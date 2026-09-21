import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { ClassroomsResponse } from '../types';

export const useGetClasses = () => {
  return useQuery({
    queryKey: ['master-data', 'classes'],
    queryFn: async () => {
      const response = await apiClient.get<ClassroomsResponse>('/classes');
      return response.data.data;
    },
  });
};
