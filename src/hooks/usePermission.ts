import { useAuth } from '@/features/auth/context/AuthContext';

export function usePermission() {
  const { user } = useAuth();

  const roles = user?.roles?.map((r) => r.name) || [];

  const isSuperAdmin = roles.includes('Super Admin');
  const isTreasurer = roles.includes('Bendahara');
  const isGuardian = roles.includes('Wali Santri');

  const hasRole = (roleName: string) => roles.includes(roleName);

  return {
    hasRole,
    isSuperAdmin,
    isTreasurer,
    isGuardian,
  };
}
