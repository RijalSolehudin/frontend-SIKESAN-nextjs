import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AnnualFeePayment, AnnualFeeReceiptData } from '../types/annual-fees';

export interface PayAnnualFeePayload {
  annual_fee_bill_id: string;
  amount: number;
  payment_method: 'CASH' | 'TRANSFER';
  notes?: string;
  proof_url?: string;
  proof?: File | null;
}

export const usePayAnnualFeeBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PayAnnualFeePayload) => {
      if (payload.proof) {
        const formData = new FormData();
        formData.append('annual_fee_bill_id', payload.annual_fee_bill_id);
        formData.append('amount', String(payload.amount));
        formData.append('payment_method', payload.payment_method);
        if (payload.notes) {
          formData.append('notes', payload.notes);
        }
        if (payload.proof_url) {
          formData.append('proof_url', payload.proof_url);
        }
        formData.append('proof', payload.proof);

        const response = await apiClient.post<{ message: string; data: AnnualFeePayment }>(
          '/annual-fees/payments',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      }

      const response = await apiClient.post<{ message: string; data: AnnualFeePayment }>(
        '/annual-fees/payments',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-bills'] });
    },
  });
};

export const useGetAnnualFeeVerifications = (params?: { status?: string }) => {
  return useQuery({
    queryKey: ['finance', 'annual-fee-verifications', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: AnnualFeePayment[]; meta: { pending_count: number } }>(
        '/annual-fees/verifications',
        { params }
      );
      return response.data;
    },
  });
};

export const useApproveAnnualFeeVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<{ message: string; data: AnnualFeePayment }>(
        `/annual-fees/verifications/${id}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-bills'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-verifications'] });
    },
  });
};

export const useRejectAnnualFeeVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rejection_reason }: { id: string; rejection_reason: string }) => {
      const response = await apiClient.post<{ message: string; data: AnnualFeePayment }>(
        `/annual-fees/verifications/${id}/reject`,
        { rejection_reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-bills'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-verifications'] });
    },
  });
};

export const useGetAnnualFeeReceipt = (paymentId: string | null) => {
  return useQuery({
    queryKey: ['finance', 'annual-fee-receipt', paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      const response = await apiClient.get<{ data: AnnualFeeReceiptData }>(
        `/annual-fees/payments/${paymentId}/receipt`
      );
      return response.data.data;
    },
    enabled: !!paymentId,
  });
};
