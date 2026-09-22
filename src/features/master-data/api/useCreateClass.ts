import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Classroom } from '../types';

export interface CreateClassRequest {
  name: string;
  education_level?: 'SD' | 'SMP' | 'SMA' | null;
}

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClassRequest) => {
      const response = await apiClient.post<{ data: Classroom }>('/classes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'classes'] });
    },
  });
};
