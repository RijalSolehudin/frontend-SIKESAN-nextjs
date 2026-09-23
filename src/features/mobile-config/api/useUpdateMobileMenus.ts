import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { MobileMenuItem } from '../types';

interface UpdateRoleMenuPayload {
  role: string;
  menus: MobileMenuItem[];
}

export const useUpdateMobileMenus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, menus }: UpdateRoleMenuPayload) => {
      const payload = {
        role,
        menus: menus.map((m) => ({
          id: m.id,
          title: m.title,
          is_enabled: m.is_enabled,
        })),
      };

      const response = await apiClient.put('/mobile/menu-config', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-menu-config-by-role'] });
      toast.success(
        `Konfigurasi menu mobile untuk '${variables.role}' berhasil disimpan ke server!`
      );
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menyimpan konfigurasi menu mobile.';
      toast.error(msg);
    },
  });
};
