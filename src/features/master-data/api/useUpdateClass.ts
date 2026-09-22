import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Classroom } from '../types';

export interface UpdateClassRequest {
  id: number;
  name: string;
  education_level?: 'SD' | 'SMP' | 'SMA' | null;
}

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateClassRequest) => {
      const { id, ...rest } = data;
      const response = await apiClient.put<{ data: Classroom }>(`/classes/${id}`, rest);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'classes'] });
    },
  });
};
