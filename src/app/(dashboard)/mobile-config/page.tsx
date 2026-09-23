import { Metadata } from 'next';
import { MobileConfigView } from '@/features/mobile-config/components/MobileConfigView';

export const metadata: Metadata = {
  title: 'Konfigurasi UI Mobile | SIKESAN',
  description: 'Kelola modul dan menu antarmuka dinamis aplikasi mobile SIKESAN',
};

export default function MobileConfigPage() {
  return <MobileConfigView />;
}
