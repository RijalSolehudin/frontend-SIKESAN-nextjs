import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SingleDormitoryResponse } from '../types';

export interface UpdateDormitoryRequest {
  id: number;
  name: string;
}

export const useUpdateDormitory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDormitoryRequest) => {
      const response = await apiClient.put<SingleDormitoryResponse>(`/dormitories/${data.id}`, { name: data.name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'dormitories'] });
    },
  });
};
