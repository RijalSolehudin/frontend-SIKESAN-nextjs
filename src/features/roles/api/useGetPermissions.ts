import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { PermissionsResponse } from '../types';

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await apiClient.get<PermissionsResponse>('/permissions');
      return response.data.data;
    },
  });
};
