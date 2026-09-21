'use client';

import { useState } from 'react';
import { Role } from '../types';
import { useDeleteRole } from '../api/useDeleteRole';
import { EditRoleModal } from './EditRoleModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldCheck, Pencil, Trash2, Lock, KeyRound } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

const PROTECTED_ROLES = ['Super Admin', 'Admin', 'Bendahara', 'Wali Santri'];

interface RoleTableProps {
  data: Role[];
  isLoading: boolean;
}

export function RoleTable({ data, isLoading }: RoleTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteMutation = useDeleteRole();

  const handleDelete = () => {
    if (!deletingId) return;

    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success('Role berhasil dihapus');
        setDeletingId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Gagal menghapus role');
        setDeletingId(null);
      },
    });
  };

  const deletingRole = data.find((r) => r.id === deletingId);
  const paginatedData = data.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">Nama Role</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Tipe Peran</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Hak Akses (*Permissions*)</th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-48 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-8 w-16 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Belum ada peran/role yang terdaftar.
                  </td>
                </tr>
              ) : (
                paginatedData.map((role) => {
                  const isProtected = PROTECTED_ROLES.includes(role.name);
                  const permissions = role.permissions || [];

                  return (
                    <tr key={role.id} className="hover:bg-emerald-50/30 transition-colors">
                      {/* Role Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isProtected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {role.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              guard: {role.guard_name || 'web'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Type */}
                      <td className="px-5 py-3.5">
                        {isProtected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80">
                            <Lock className="h-3 w-3 text-emerald-600" />
                            Sistem Inti
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
                            <KeyRound className="h-3 w-3 text-slate-500" />
                            Kustom
                          </span>
                        )}
                      </td>

                      {/* Permissions badges */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {permissions.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">
                              Tidak ada hak akses spesifik
                            </span>
                          ) : (
                            permissions.slice(0, 5).map((p) => (
                              <span
                                key={p.id}
                                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-600"
                              >
                                {p.name}
                              </span>
                            ))
                          )}
                          {permissions.length > 5 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                              +{permissions.length - 5} lainnya
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRole(role)}
                            className="h-8 px-2.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructiveOutline"
                            size="sm"
                            onClick={() => setDeletingId(role.id)}
                            disabled={isProtected || deleteMutation.isPending}
                            title={isProtected ? 'Role sistem bawaan tidak dapat dihapus' : 'Hapus role'}
                            className={`h-8 px-2.5 text-xs ${
                              isProtected ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          currentPage={page}
          totalPages={Math.ceil(data.length / perPage) || 1}
          totalItems={data.length}
          pageSize={perPage}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPerPage(newSize);
            setPage(1);
          }}
          isLoading={isLoading}
        />
      </div>

      <EditRoleModal
        role={editingRole}
        isOpen={Boolean(editingRole)}
        onClose={() => setEditingRole(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Hapus Role Pengguna"
        description={`Apakah Anda yakin ingin menghapus role "${deletingRole?.name}"? Pengguna yang memegang peran ini akan kehilangan hak akses yang terhubung.`}
        confirmText="Ya, Hapus Role"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
