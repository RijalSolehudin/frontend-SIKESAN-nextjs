'use client';

import { useState } from 'react';
import { Role } from '../types';
import { useGetPermissions } from '../api/useGetPermissions';
import { useUpdateRole } from '../api/useUpdateRole';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, CheckSquare, Square, KeyRound, Lock } from 'lucide-react';

const PERMISSION_LABELS: Record<string, { label: string; desc: string; category: string }> = {
  // Pengguna & Akses
  'manage users': {
    label: 'Kelola Pengguna',
    desc: 'Membuat, mengubah, dan menghapus akun pengguna sistem',
    category: 'Pengguna & Akses',
  },

  // Master Data
  'manage master_data': {
    label: 'Kelola Master Data',
    desc: 'Akses tahun ajaran, kelas, dan asrama santri',
    category: 'Master Data',
  },
  'manage spp_configurations': {
    label: 'Konfigurasi Tarif SPP',
    desc: 'Mengatur skema tarif dan kelompok SPP bulanan santri',
    category: 'Master Data',
  },
  'manage annual_fee_configurations': {
    label: 'Konfigurasi Biaya Tahunan',
    desc: 'Mengatur komponen dan tarif daftar ulang/biaya tahunan',
    category: 'Master Data',
  },

  // Santri
  'manage students': {
    label: 'Kelola Santri',
    desc: 'Registrasi santri, update status, dan pemetaan wali',
    category: 'Santri',
  },

  // Operasional Keuangan (Staf & Bendahara)
  'manage spp': {
    label: 'Kelola SPP (Akses Penuh)',
    desc: 'Akses penuh seluruh modul dan kelola SPP',
    category: 'Operasional Keuangan',
  },
  'generate spp_bills': {
    label: 'Generate Tagihan SPP Massal',
    desc: 'Menerbitkan tagihan SPP bulanan ke santri',
    category: 'Operasional Keuangan',
  },
  'direct_pay spp': {
    label: 'Input Pembayaran Kasir SPP',
    desc: 'Menerima dan mencatat pembayaran langsung SPP di loket kasir',
    category: 'Operasional Keuangan',
  },
  'verify spp_payments': {
    label: 'Verifikasi Bukti Transfer SPP',
    desc: 'Konfirmasi bukti bayar dan mutasi bank untuk tagihan SPP',
    category: 'Operasional Keuangan',
  },
  'generate annual_fee_bills': {
    label: 'Generate Tagihan Biaya Tahunan',
    desc: 'Menerbitkan tagihan biaya tahunan ke santri',
    category: 'Operasional Keuangan',
  },
  'direct_pay annual_fee': {
    label: 'Input Pembayaran Kasir Biaya Tahunan',
    desc: 'Menerima dan mencatat pembayaran langsung biaya tahunan di loket kasir',
    category: 'Operasional Keuangan',
  },
  'verify annual_fee_payments': {
    label: 'Verifikasi Bukti Biaya Tahunan',
    desc: 'Konfirmasi bukti bayar untuk tagihan biaya tahunan',
    category: 'Operasional Keuangan',
  },
  'manage wallet': {
    label: 'Kelola Dompet Santri (Admin)',
    desc: 'Top up manual dan penyesuaian saldo dompet santri oleh staf',
    category: 'Operasional Keuangan',
  },
  'manage expenses': {
    label: 'Kelola Beban Pengeluaran',
    desc: 'Pencatatan dan verifikasi beban operasional pondok',
    category: 'Operasional Keuangan',
  },

  // Layanan Mandiri Santri & Wali (Mobile & Portal)
  'pay own spp': {
    label: 'Bayar SPP Mandiri',
    desc: 'Membayar tagihan SPP santri asuhan via dompet atau transfer gateway',
    category: 'Layanan Mandiri Wali',
  },
  'pay own annual_fee': {
    label: 'Bayar Biaya Tahunan Mandiri',
    desc: 'Membayar tagihan biaya tahunan santri asuhan',
    category: 'Layanan Mandiri Wali',
  },
  'topup own wallet': {
    label: 'Top Up Saldo Mandiri',
    desc: 'Mengisi ulang saldo dompet santri binaan melalui aplikasi',
    category: 'Layanan Mandiri Wali',
  },
  'pay infaq': {
    label: 'Pembayaran Infak Kesantrian',
    desc: 'Menyalurkan infak dan donasi kesantrian melalui aplikasi',
    category: 'Layanan Mandiri Wali',
  },

  // Laporan & Akuntansi
  'view reports': {
    label: 'Lihat Laporan & Ledger',
    desc: 'Melihat buku besar, mutasi, dan ekspor laporan keuangan',
    category: 'Laporan & Akuntansi',
  },
};

interface EditRoleModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditRoleFormProps {
  role: Role;
  onClose: () => void;
}

function EditRoleForm({ role, onClose }: EditRoleFormProps) {
  const [name, setName] = useState(role.name);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    (role.permissions || []).map((p) => p.name)
  );

  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions();
  const updateMutation = useUpdateRole();

  const isSuperAdmin = role.name === 'Super Admin';

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSelectAll = () => {
    if (!permissions) return;
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissions.map((p) => p.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama peran wajib diisi');
      return;
    }

    updateMutation.mutate(
      {
        id: role.id,
        data: {
          name: name.trim(),
          permissions: selectedPermissions,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Peran "${name}" berhasil diperbarui`);
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal memperbarui peran');
        },
      }
    );
  };

  // Group permissions by category
  const groupedPermissions = (permissions || []).reduce<Record<string, typeof permissions>>(
    (acc, perm) => {
      const cat = PERMISSION_LABELS[perm.name]?.category || 'Lainnya';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(perm);
      return acc;
    },
    {}
  );

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Edit Peran & Hak Akses
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          Ubah nama peran dan sesuaikan daftar izin otoritas untuk peran ini.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Role Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Nama Peran (Role Name)
          </label>
          <Input
            type="text"
            placeholder="Contoh: Bendahara Pembantu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSuperAdmin}
            className="h-10 text-sm rounded-xl"
          />
          {isSuperAdmin && (
            <p className="text-[11px] text-amber-700 flex items-center gap-1 mt-1">
              <Lock className="h-3 w-3" />
              Nama peran Super Admin dilindungi dan tidak dapat diubah.
            </p>
          )}
        </div>

        {/* Permissions Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
              Daftar Hak Akses ({selectedPermissions.length} Dipilih)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              {selectedPermissions.length === (permissions?.length || 0) ? (
                <>
                  <CheckSquare className="h-3.5 w-3.5" />
                  Batal Pilih Semua
                </>
              ) : (
                <>
                  <Square className="h-3.5 w-3.5" />
                  Pilih Semua
                </>
              )}
            </button>
          </div>

          {/* Categorized Permissions */}
          {isLoadingPermissions ? (
            <div className="py-8 text-center text-xs text-slate-400">Memuat hak akses...</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    {category}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {perms?.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.name);
                      const meta = PERMISSION_LABELS[perm.name] || {
                        label: perm.name,
                        desc: 'Izin akses modul',
                      };

                      return (
                        <label
                          key={perm.id}
                          onClick={() => togglePermission(perm.name)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20 shadow-2xs'
                              : 'bg-white/70 border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 block">
                              {meta.label}{' '}
                              <code className="text-[10px] text-slate-400 font-normal">
                                ({perm.name})
                              </code>
                            </span>
                            <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                              {meta.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-lg text-xs"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending || !name.trim()}
            className="rounded-lg font-semibold text-xs"
          >
            {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function EditRoleModal({ role, isOpen, onClose }: EditRoleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        {role && (
          <EditRoleForm 
            key={role.id} 
            role={role} 
            onClose={onClose} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
