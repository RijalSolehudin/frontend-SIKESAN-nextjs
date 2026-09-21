import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { UsersResponse, UserQueryParams } from '../types';

export const useGetUsers = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await apiClient.get<UsersResponse>('/users', {
        params: {
          role: params?.role && params.role !== 'all' ? params.role : undefined,
          search: params?.search ? params.search : undefined,
          page: params?.page,
          per_page: params?.per_page || 25,
        },
      });
      return response.data;
    },
  });
};
