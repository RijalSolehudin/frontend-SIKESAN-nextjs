import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { StudentsResponse } from '../types';

interface UseGetStudentsParams {
  page?: number;
  per_page?: number;
  search?: string;
  class_id?: number;
  dormitory_id?: number;
  status?: string;
}

export const useGetStudents = (params?: UseGetStudentsParams) => {
  return useQuery({
    queryKey: ['master-data', 'students', params],
    queryFn: async () => {
      const response = await apiClient.get<StudentsResponse>('/students', { params });
      return response.data.data; // Note: returns { data: Student[], current_page: ... }
    },
  });
};
