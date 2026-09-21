import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { AcademicYearsResponse } from '../types';

export const useGetAcademicYears = () => {
  return useQuery({
    queryKey: ['master-data', 'academic-years'],
    queryFn: async () => {
      const response = await apiClient.get<AcademicYearsResponse>('/academic-years');
      return response.data.data;
    },
  });
};
