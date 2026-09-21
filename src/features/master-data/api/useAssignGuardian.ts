import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AssignGuardianRequest } from '../types';

interface AssignGuardianParams {
  studentId: number;
  data: AssignGuardianRequest;
}

export const useAssignGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, data }: AssignGuardianParams) => {
      const response = await apiClient.post(`/students/${studentId}/guardians`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'students'] });
    },
  });
};
