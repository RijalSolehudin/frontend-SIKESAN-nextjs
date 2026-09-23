export interface MobileMenuItem {
  id: string;
  title: string;
  is_enabled: boolean;
  description?: string;
  allowedRoles?: string[];
  category?: 'Keuangan' | 'Operasional' | 'Sistem';
}

export const SUPPORTED_ROLES = [
  'Wali Santri',
  'Kasir',
  'Staff Kesantrian',
  'Bendahara',
  'Admin',
  'Super Admin',
] as const;

export type SupportedRole = (typeof SUPPORTED_ROLES)[number];

export type RoleMenuConfigMap = Record<string, MobileMenuItem[]>;

export interface AllRolesConfigResponse {
  message: string;
  roles?: string[];
  data: Record<string, MobileMenuItem[]>;
}

export interface SingleRoleConfigResponse {
  message: string;
  role: string;
  data: MobileMenuItem[];
}

export const MENU_METADATA: Record<
  string,
  {
    description: string;
    category: 'Keuangan' | 'Operasional' | 'Sistem';
    iconName: string;
    defaultRoles: string[];
  }
> = {
  top_up: {
    description: 'Permintaan pengisian saldo tabungan santri secara mandiri atau via kasir.',
    category: 'Keuangan',
    iconName: 'ArrowUpRight',
    defaultRoles: ['Wali Santri', 'Bendahara', 'Kasir', 'Admin', 'Super Admin'],
  },
  bayar_spp: {
    description: 'Pembayaran tagihan SPP bulanan santri dengan upload bukti transfer.',
    category: 'Keuangan',
    iconName: 'Wallet',
    defaultRoles: ['Wali Santri', 'Bendahara', 'Admin', 'Super Admin'],
  },
  infak: {
    description: 'Pemberian infak dan donasi pembangunan kesantrian oleh wali santri.',
    category: 'Keuangan',
    iconName: 'HeartHandshake',
    defaultRoles: ['Wali Santri', 'Bendahara', 'Admin', 'Super Admin'],
  },
  kwitansi: {
    description: 'Akses kwitansi digital dan bukti pembayaran transaksi santri.',
    category: 'Keuangan',
    iconName: 'Receipt',
    defaultRoles: ['Wali Santri', 'Kasir', 'Bendahara', 'Admin', 'Super Admin'],
  },
  sistem_kasir: {
    description: 'Pencatatan transaksi belanja santri dan pemotongan saldo uang saku.',
    category: 'Operasional',
    iconName: 'ShoppingCart',
    defaultRoles: ['Kasir', 'Admin', 'Super Admin'],
  },
  uang_keluar: {
    description: 'Pencatatan uang keluar tunai dan pengeluaran operasional di kasir.',
    category: 'Keuangan',
    iconName: 'ArrowDownLeft',
    defaultRoles: ['Kasir', 'Bendahara', 'Admin', 'Super Admin'],
  },
  data_santri: {
    description: 'Informasi biodata santri, kelas, kamar, dan status aktif.',
    category: 'Operasional',
    iconName: 'Users',
    defaultRoles: ['Staff Kesantrian', 'Bendahara', 'Admin', 'Super Admin'],
  },
  rek_wali_asrama: {
    description: 'Monitoring saldo rekening dan uang titipan santri di wali asrama.',
    category: 'Operasional',
    iconName: 'Building2',
    defaultRoles: ['Staff Kesantrian', 'Bendahara', 'Admin', 'Super Admin'],
  },
  rek_kesantrian: {
    description: 'Buku kas dan rekening operasional kegiatan santri pesantren.',
    category: 'Operasional',
    iconName: 'BookOpen',
    defaultRoles: ['Staff Kesantrian', 'Bendahara', 'Admin', 'Super Admin'],
  },
  akun_staff: {
    description: 'Manajemen akun login staf asrama, kasir, dan pengurus.',
    category: 'Sistem',
    iconName: 'ShieldAlert',
    defaultRoles: ['Admin', 'Super Admin'],
  },
  settings: {
    description: 'Pengaturan umum aplikasi, preferensi, dan informasi sistem.',
    category: 'Sistem',
    iconName: 'Settings',
    defaultRoles: ['Admin', 'Super Admin'],
  },
};
