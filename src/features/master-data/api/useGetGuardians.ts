import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { GuardiansResponse } from '../types';

export const useGetGuardians = () => {
  return useQuery({
    queryKey: ['master-data', 'guardians'],
    queryFn: async () => {
      // Fetches users with role Wali Santri
      const response = await apiClient.get<GuardiansResponse>('/users', {
        params: { role: 'Wali Santri' }
      });
      return response.data.data;
    },
  });
};
