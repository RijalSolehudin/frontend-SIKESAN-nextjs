import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SppBillsResponse } from '../types';

export const useGetStudentBills = (studentId?: number) => {
  return useQuery({
    queryKey: ['finance', 'spp-bills', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await apiClient.get<SppBillsResponse>(`/students/${studentId}/bills`);
      return response.data.data;
    },
    enabled: !!studentId,
  });
};
