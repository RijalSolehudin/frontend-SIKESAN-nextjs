import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { RolesResponse } from '../types';

export const useGetRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiClient.get<RolesResponse>('/roles');
      return response.data.data;
    },
  });
};
