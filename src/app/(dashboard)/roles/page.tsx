import { Metadata } from 'next';
import { RoleView } from '@/features/roles/components/RoleView';

export const metadata: Metadata = {
  title: 'Manajemen Role & Hak Akses | SIKESAN',
  description: 'Kelola peran pengguna dan izin akses sistem SIKESAN',
};

export default function RolesPage() {
  return <RoleView />;
}
