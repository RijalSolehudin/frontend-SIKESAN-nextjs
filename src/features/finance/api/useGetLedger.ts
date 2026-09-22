import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { LedgerResponse } from '../types';

export interface UseGetLedgerParams {
  page?: number;
  per_page?: number;
  month?: number | 'all' | null;
  year?: number | 'all' | null;
  start_date?: string;
  end_date?: string;
}

export const useGetLedger = (params?: UseGetLedgerParams) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const resolvedMonth = params && 'month' in params ? params.month : currentMonth;
  const resolvedYear = params && 'year' in params ? params.year : currentYear;

  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;
  if (params?.start_date) queryParams.start_date = params.start_date;
  if (params?.end_date) queryParams.end_date = params.end_date;

  if (resolvedMonth && resolvedMonth !== 'all') {
    queryParams.month = Number(resolvedMonth);
  } else if (resolvedMonth === 'all') {
    queryParams.month = 'all';
  }

  if (resolvedYear && resolvedYear !== 'all') {
    queryParams.year = Number(resolvedYear);
  } else if (resolvedYear === 'all') {
    queryParams.year = 'all';
  }

  return useQuery({
    queryKey: ['finance', 'ledger', queryParams],
    queryFn: async () => {
      const response = await apiClient.get<LedgerResponse>('/reports/ledger', { params: queryParams });
      return response.data.data;
    },
  });
};
