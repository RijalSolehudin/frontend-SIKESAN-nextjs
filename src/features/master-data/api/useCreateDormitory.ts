import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { CreateDormitoryRequest, SingleDormitoryResponse } from '../types';

export const useCreateDormitory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDormitoryRequest) => {
      const response = await apiClient.post<SingleDormitoryResponse>('/dormitories', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['master-data', 'dormitories'] });
    },
  });
};
