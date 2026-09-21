import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AcademicYear } from '../types';

export interface UpdateAcademicYearRequest {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAcademicYearRequest) => {
      const { id, ...rest } = data;
      const response = await apiClient.put<{ data: AcademicYear }>(`/academic-years/${id}`, rest);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'academic-years'] });
    },
  });
};
