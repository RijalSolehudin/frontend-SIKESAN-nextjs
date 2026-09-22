import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AnnualFeeConfiguration, BreakdownItem } from '../types/annual-fees';

interface GetAnnualFeeConfigurationsParams {
  education_level?: 'SD' | 'SMP' | 'SMA';
  student_type?: 'NEW' | 'RETURNING';
  entry_year?: number;
  academic_year_id?: number;
  type?: 'student' | 'standard';
}

export interface CreateAnnualFeeConfigPayload {
  education_level?: 'SD' | 'SMP' | 'SMA' | null;
  student_type?: 'NEW' | 'RETURNING' | null;
  entry_year?: number | null;
  academic_year_id?: number | null;
  student_id?: number | null;
  total_amount: number;
  breakdown_items?: BreakdownItem[] | null;
  notes?: string | null;
}

export const useGetAnnualFeeConfigurations = (params?: GetAnnualFeeConfigurationsParams) => {
  return useQuery({
    queryKey: ['finance', 'annual-fee-configurations', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: AnnualFeeConfiguration[] }>(
        '/annual-fee-configurations',
        { params }
      );
      return response.data.data;
    },
  });
};

export const useCreateAnnualFeeConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAnnualFeeConfigPayload) => {
      const response = await apiClient.post<{ message: string; data: AnnualFeeConfiguration }>(
        '/annual-fee-configurations',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-configurations'] });
    },
  });
};

export const useUpdateAnnualFeeConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateAnnualFeeConfigPayload>;
    }) => {
      const response = await apiClient.put<{ message: string; data: AnnualFeeConfiguration }>(
        `/annual-fee-configurations/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-configurations'] });
    },
  });
};

export const useDeleteAnnualFeeConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<{ message: string }>(
        `/annual-fee-configurations/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'annual-fee-configurations'] });
    },
  });
};
