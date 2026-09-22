import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import {
  SppConfiguration,
  SppConfigurationsResponse,
  CreateSppConfigurationPayload,
} from '../types';

interface GetSppConfigurationsParams {
  education_level?: string;
  entry_year?: number;
  academic_year_id?: number;
  type?: 'student' | 'standard';
}

export const useGetSppConfigurations = (params?: GetSppConfigurationsParams) => {
  return useQuery({
    queryKey: ['finance', 'spp-configurations', params],
    queryFn: async () => {
      const response = await apiClient.get<SppConfigurationsResponse>(
        '/spp-configurations',
        { params }
      );
      return response.data.data;
    },
  });
};

export const useCreateSppConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSppConfigurationPayload) => {
      const response = await apiClient.post<{ message: string; data: SppConfiguration }>(
        '/spp-configurations',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-configurations'] });
    },
  });
};

export const useUpdateSppConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
      notes,
      education_level,
      entry_year,
    }: {
      id: number;
      amount: number;
      notes?: string | null;
      education_level?: string | null;
      entry_year?: number | null;
    }) => {
      const response = await apiClient.put<{ message: string; data: SppConfiguration }>(
        `/spp-configurations/${id}`,
        { amount, notes, education_level, entry_year }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-configurations'] });
    },
  });
};

export const useDeleteSppConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<{ message: string }>(
        `/spp-configurations/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'spp-configurations'] });
    },
  });
};
