import { Metadata } from 'next';
import { UserView } from '@/features/users/components/UserView';

export const metadata: Metadata = {
  title: 'Manajemen Pengguna & Akun | SIKESAN',
  description: 'Kelola akun wali santri, staf, dan pengurus pondok pesantren secara terpusat.',
};

export default function UsersPage() {
  return <UserView />;
}
