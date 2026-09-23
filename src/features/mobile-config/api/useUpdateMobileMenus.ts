import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { MobileMenuItem } from '../types';

interface UpdateMobileMenusPayload {
  menus: Array<{
    id: string;
    title: string;
    is_enabled: boolean;
  }>;
}

export const useUpdateMobileMenus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menus: MobileMenuItem[]) => {
      const payload: UpdateMobileMenusPayload = {
        menus: menus.map((m) => ({
          id: m.id,
          title: m.title,
          is_enabled: m.is_enabled,
        })),
      };

      const response = await apiClient.put('/mobile/menu-config', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-menu-config'] });
      toast.success('Konfigurasi menu mobile berhasil disimpan ke server!');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menyimpan konfigurasi menu mobile.';
      toast.error(msg);
    },
  });
};
