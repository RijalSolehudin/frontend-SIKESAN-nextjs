export interface MobileMenuItem {
  id: string;
  title: string;
  is_enabled: boolean;
  description?: string;
  allowedRoles?: string[];
  category?: 'Keuangan' | 'Operasional' | 'Sistem';
}

export interface MobileConfigResponse {
  message: string;
  data: MobileMenuItem[];
}

export const MENU_METADATA: Record<
  string,
  {
    description: string;
    allowedRoles: string[];
    category: 'Keuangan' | 'Operasional' | 'Sistem';
    iconName: string;
  }
> = {
  top_up: {
    description: 'Permintaan pengisian saldo tabungan santri secara mandiri atau via kasir.',
    allowedRoles: ['Wali Santri', 'Bendahara', 'Kasir'],
    category: 'Keuangan',
    iconName: 'ArrowUpRight',
  },
  bayar_spp: {
    description: 'Pembayaran tagihan SPP bulanan santri dengan upload bukti transfer.',
    allowedRoles: ['Wali Santri', 'Bendahara'],
    category: 'Keuangan',
    iconName: 'Wallet',
  },
  infak: {
    description: 'Pemberian infak dan donasi pembangunan kesantrian oleh wali santri.',
    allowedRoles: ['Wali Santri', 'Bendahara'],
    category: 'Keuangan',
    iconName: 'HeartHandshake',
  },
  kwitansi: {
    description: 'Akses kwitansi digital dan bukti pembayaran transaksi santri.',
    allowedRoles: ['Wali Santri', 'Kasir', 'Bendahara'],
    category: 'Keuangan',
    iconName: 'Receipt',
  },
  sistem_kasir: {
    description: 'Pencatatan transaksi belanja santri dan pemotongan saldo uang saku.',
    allowedRoles: ['Kasir', 'Admin'],
    category: 'Operasional',
    iconName: 'ShoppingCart',
  },
  uang_keluar: {
    description: 'Pencatatan uang keluar tunai dan pengeluaran operasional di kasir.',
    allowedRoles: ['Kasir', 'Bendahara'],
    category: 'Keuangan',
    iconName: 'ArrowDownLeft',
  },
  data_santri: {
    description: 'Informasi biodata santri, kelas, kamar, dan status aktif.',
    allowedRoles: ['Staff Kesantrian', 'Admin'],
    category: 'Operasional',
    iconName: 'Users',
  },
  rek_wali_asrama: {
    description: 'Monitoring saldo rekening dan uang titipan santri di wali asrama.',
    allowedRoles: ['Staff Kesantrian', 'Bendahara'],
    category: 'Operasional',
    iconName: 'Building2',
  },
  rek_kesantrian: {
    description: 'Buku kas dan rekening operasional kegiatan santri pesantren.',
    allowedRoles: ['Staff Kesantrian', 'Bendahara'],
    category: 'Operasional',
    iconName: 'BookOpen',
  },
  akun_staff: {
    description: 'Manajemen akun login staf asrama, kasir, dan pengurus.',
    allowedRoles: ['Super Admin', 'Admin'],
    category: 'Sistem',
    iconName: 'ShieldAlert',
  },
  settings: {
    description: 'Pengaturan umum aplikasi, preferensi, dan informasi sistem.',
    allowedRoles: ['Super Admin', 'Admin'],
    category: 'Sistem',
    iconName: 'Settings',
  },
};
