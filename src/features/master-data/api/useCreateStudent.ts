import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SingleStudentResponse } from '../types';

export interface CreateStudentRequest {
  nis: string;
  name: string;
  class_id: number;
  dormitory_id?: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentRequest) => {
      const response = await apiClient.post<SingleStudentResponse>('/students', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
    },
  });
};
