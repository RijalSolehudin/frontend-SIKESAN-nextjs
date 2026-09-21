import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { TopUpRequest } from '../types';

export interface CreateTopUpPayload {
  student_id: number;
  requested_amount: number;
  payment_method: string;
}

export const useCreateTopUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopUpPayload) => {
      const response = await apiClient.post<{ data: TopUpRequest }>('/top-ups', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'top-ups'] });
    },
  });
};
