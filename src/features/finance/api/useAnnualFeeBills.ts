import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AnnualFeeBillsResponse } from '../types/annual-fees';

interface GetAnnualFeeBillsParams {
  page?: number;
  per_page?: number;
  search?: string;
  class_id?: string;
  education_level?: string;
  status?: string;
  academic_year_id?: number;
  student_id?: number;
}

export const useGetAnnualFeeBills = (params?: GetAnnualFeeBillsParams) => {
  return useQuery({
    queryKey: ['finance', 'annual-fee-bills', params],
    queryFn: async () => {
      const response = await apiClient.get<AnnualFeeBillsResponse>(
        '/annual-fees/bills',
        { params }
      );
      return response.data;
    },
  });
};

export const useGenerateAnnualFeeBills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { academic_year_id?: number }) => {
      const response = await apiClient.post<{ message: string; data: any }>(
        '/annual-fees/generate-bills',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-bills'] });
    },
  });
};
