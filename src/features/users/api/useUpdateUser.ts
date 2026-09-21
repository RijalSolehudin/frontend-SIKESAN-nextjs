import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { UpdateUserPayload, User } from '../types';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const { id, ...data } = payload;
      const response = await apiClient.put<{ data: User; message: string }>(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['master-data', 'guardians'] });
    },
  });
};
