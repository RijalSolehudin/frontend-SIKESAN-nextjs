import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { ExpenseCategory } from '../types';

export const useGetExpenseCategories = () => {
  return useQuery({
    queryKey: ['finance', 'expense-categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ExpenseCategory[] }>('/expense-categories');
      return response.data.data;
    },
  });
};
