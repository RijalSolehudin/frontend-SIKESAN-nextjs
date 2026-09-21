import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { LedgerResponse } from '../types';

interface UseGetLedgerParams {
  page?: number;
  per_page?: number;
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
}

export const useGetLedger = (params?: UseGetLedgerParams) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const queryParams = {
    month: currentMonth,
    year: currentYear,
    ...params,
  };

  return useQuery({
    queryKey: ['finance', 'ledger', queryParams],
    queryFn: async () => {
      const response = await apiClient.get<LedgerResponse>('/reports/ledger', { params: queryParams });
      return response.data.data;
    },
  });
};
