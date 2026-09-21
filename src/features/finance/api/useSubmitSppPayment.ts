import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { SubmitSppPaymentRequest } from '../types';

export const useSubmitSppPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitSppPaymentRequest) => {
      const formData = new FormData();
      formData.append('student_id', payload.student_id.toString());
      payload.bill_ids.forEach((id) => {
        formData.append('bill_ids[]', id);
      });
      formData.append('total_amount', payload.total_amount.toString());
      formData.append('proof', payload.proof);

      if (payload.sender_bank_name) {
        formData.append('sender_bank_name', payload.sender_bank_name);
      }
      if (payload.sender_account_holder) {
        formData.append('sender_account_holder', payload.sender_account_holder);
      }
      if (payload.notes) {
        formData.append('notes', payload.notes);
      }

      const response = await apiClient.post('/spp/submit-payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-bills'] });
    },
  });
};
