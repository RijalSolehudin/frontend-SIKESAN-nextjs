import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import {
  AllRolesConfigResponse,
  MobileMenuItem,
  RoleMenuConfigMap,
  MENU_METADATA,
  SUPPORTED_ROLES,
} from '../types';

export const useGetMobileMenus = () => {
  return useQuery({
    queryKey: ['mobile-menu-config-by-role'],
    queryFn: async (): Promise<RoleMenuConfigMap> => {
      const response = await apiClient.get<AllRolesConfigResponse>('/mobile/menu-config', {
        params: { all: 'true' },
      });

      const rawData = response.data.data;
      const result: RoleMenuConfigMap = {};

      SUPPORTED_ROLES.forEach((role) => {
        const items = rawData[role] || [];
        result[role] = items.map((item: MobileMenuItem) => {
          const meta = MENU_METADATA[item.id] || {
            description: 'Modul fitur aplikasi mobile SIKESAN.',
            category: 'Operasional' as const,
            defaultRoles: [],
          };

          return {
            ...item,
            description: meta.description,
            category: meta.category,
            allowedRoles: meta.defaultRoles,
          };
        });
      });

      return result;
    },
  });
};
