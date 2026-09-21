import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SingleStudentResponse, Student } from '../types';

export type UpdateStudentRequest = Partial<Omit<Student, 'id' | 'created_at' | 'updated_at' | 'classroom' | 'dormitory' | 'wallet'>> & {
  id: number;
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStudentRequest) => {
      const { id, ...rest } = data;
      const response = await apiClient.put<SingleStudentResponse>(`/students/${id}`, rest);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
    },
  });
};
