import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { UpdateRoleRequest, Role } from '../types';

interface UpdateRoleParams {
  id: number;
  data: UpdateRoleRequest;
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateRoleParams) => {
      const response = await apiClient.put<{ message: string; data: Role }>(`/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
