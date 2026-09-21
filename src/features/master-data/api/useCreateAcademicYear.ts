import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AcademicYear } from '../types';

export interface CreateAcademicYearRequest {
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAcademicYearRequest) => {
      const response = await apiClient.post<{ data: AcademicYear }>('/academic-years', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'academic-years'] });
    },
  });
};
