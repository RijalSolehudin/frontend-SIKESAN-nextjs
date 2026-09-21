'use client';

import { useState } from 'react';
import { useGetPermissions } from '../api/useGetPermissions';
import { useCreateRole } from '../api/useCreateRole';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Plus, CheckSquare, Square, KeyRound } from 'lucide-react';

const PERMISSION_LABELS: Record<string, { label: string; desc: string; category: string }> = {
  'manage users': {
    label: 'Kelola Pengguna',
    desc: 'Membuat, mengubah, dan menghapus akun pengguna sistem',
    category: 'Pengguna & Akses',
  },
  'manage master_data': {
    label: 'Kelola Master Data',
    desc: 'Akses tahun ajaran, kelas, asrama, dan konfigurasi SPP',
    category: 'Master Data',
  },
  'manage students': {
    label: 'Kelola Santri',
    desc: 'Registrasi santri, update status, dan pemetaan wali',
    category: 'Santri',
  },
  'manage spp': {
    label: 'Kelola SPP',
    desc: 'Generate tagihan massal dan input pembayaran kasir SPP',
    category: 'Keuangan',
  },
  'manage wallet': {
    label: 'Kelola Dompet Santri',
    desc: 'Top up saldo dan persetujuan penambahan dana santri',
    category: 'Keuangan',
  },
  'manage expenses': {
    label: 'Kelola Pengeluaran',
    desc: 'Pencatatan dan verifikasi beban operasional pondok',
    category: 'Keuangan',
  },
  'view reports': {
    label: 'Lihat Laporan & Ledger',
    desc: 'Melihat buku besar, mutasi, dan ekspor laporan keuangan',
    category: 'Laporan',
  },
};

export function CreateRoleModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions();
  const createMutation = useCreateRole();

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const selectAll = () => {
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
      toast.error('Nama role wajib diisi');
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        permissions: selectedPermissions,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'Role baru berhasil ditambahkan');
          setName('');
          setSelectedPermissions([]);
          setOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal menambahkan role');
        },
      }
    );
  };

  // Group permissions by category
  const groupedPermissions = (permissions || []).reduce<Record<string, NonNullable<typeof permissions>>>((acc, perm) => {
    const cat = PERMISSION_LABELS[perm.name]?.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="font-semibold shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Role Baru
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[560px] glass-modal p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Buat Role Pengguna Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tentukan nama peran dan pilih hak akses (*permissions*) yang diizinkan untuk peran ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1 pt-2">
          {/* Role Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Nama Peran / Role <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Staf Administrasi, Pengurus Asrama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl bg-white/80 text-sm font-medium"
              required
            />
          </div>

          {/* Permissions Header */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                Daftar Hak Akses Sistem
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
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
                      {perms.map((perm) => {
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
                              onChange={() => {}} // handled by parent onClick
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
              onClick={() => setOpen(false)}
              className="rounded-lg text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="rounded-lg font-semibold text-xs"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
