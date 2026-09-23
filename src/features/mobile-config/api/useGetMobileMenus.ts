import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { MobileConfigResponse, MobileMenuItem, MENU_METADATA } from '../types';

export const useGetMobileMenus = () => {
  return useQuery({
    queryKey: ['mobile-menu-config'],
    queryFn: async (): Promise<MobileMenuItem[]> => {
      const response = await apiClient.get<MobileConfigResponse>('/mobile/menu-config');
      const items = response.data.data;

      // Enhance with metadata
      return items.map((item) => {
        const meta = MENU_METADATA[item.id] || {
          description: 'Modul fitur aplikasi mobile SIKESAN.',
          allowedRoles: ['Semua Pengguna'],
          category: 'Operasional',
          iconName: 'LayoutGrid',
        };

        return {
          ...item,
          description: meta.description,
          allowedRoles: meta.allowedRoles,
          category: meta.category,
        };
      });
    },
  });
};
