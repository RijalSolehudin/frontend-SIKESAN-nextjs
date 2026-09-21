import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { TopUpRequest } from '../types';

export interface CreateTopUpPayload {
  student_id: number;
  requested_amount: number;
  payment_method: string;
  proof?: File | null;
}

export const useCreateTopUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopUpPayload) => {
      const formData = new FormData();
      formData.append('student_id', data.student_id.toString());
      formData.append('requested_amount', data.requested_amount.toString());
      formData.append('payment_method', data.payment_method);
      if (data.proof) {
        formData.append('proof', data.proof);
      }

      const response = await apiClient.post<{ data: TopUpRequest }>('/top-ups', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'top-ups'] });
    },
  });
};
