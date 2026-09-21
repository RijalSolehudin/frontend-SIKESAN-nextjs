'use client';

import { useState } from 'react';
import { User } from '../types';
import { useDeleteUser } from '../api/useDeleteUser';
import { EditUserModal } from './EditUserModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Pencil, 
  Trash2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  MessageCircle, 
  Mail, 
  ShieldCheck 
} from 'lucide-react';

import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface UserTableProps {
  data?: User[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
}

export function UserTable({ data, isLoading, isError, onRetry, pagination }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteMutation = useDeleteUser();

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Data Pengguna"
        message="Tidak dapat mengambil daftar akun pengguna dari server. Silakan coba kembali."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat data pengguna...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-7 w-7 text-emerald-600" />}
        title="Tidak Ada Pengguna Ditemukan"
        description="Belum ada akun pengguna yang sesuai dengan pencarian atau filter saat ini."
      />
    );
  }

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success('Pengguna berhasil dihapus');
        setDeletingId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Gagal menghapus pengguna');
        setDeletingId(null);
      },
    });
  };

  const renderRoleBadge = (roles?: string[]) => {
    const roleName = roles && roles.length > 0 ? roles[0] : 'User';
    switch (roleName) {
      case 'Super Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200/80">
            <ShieldCheck className="h-3 w-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'Bendahara':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80">
            Bendahara
          </span>
        );
      case 'Wali Santri':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80">
            Wali Santri
          </span>
        );
      case 'Admin':
      case 'Staff':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80">
            {roleName}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
            {roleName}
          </span>
        );
    }
  };

  const renderStatus = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80">
        <XCircle className="h-3 w-3 text-rose-500" />
        Nonaktif
      </span>
    );
  };

  const getCleanPhoneNumber = (phone?: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">Pengguna</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Tipe Akun (Role)</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Kontak</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Data Rekening</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((user) => {
              const isSuperAdmin = user.roles && user.roles.includes('Super Admin');
              const cleanPhone = getCleanPhoneNumber(user.phone);

              return (
                <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">
                          {user.name || user.username}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {renderRoleBadge(user.roles)}
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <div className="space-y-1">
                      {user.phone ? (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 transition-colors font-medium"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{user.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No. HP kosong</span>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    {user.bank_name || user.bank_account_number ? (
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>{user.bank_name || 'Bank'}</span>
                        </div>
                        <div className="font-mono text-slate-600 text-[11px]">
                          {user.bank_account_number}
                        </div>
                        {user.bank_account_holder && (
                          <div className="text-slate-400 text-[10px]">
                            a.n. {user.bank_account_holder}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Belum diisi</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {renderStatus(user.is_active)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        className="h-8 px-2.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      {!isSuperAdmin && (
                        <Button
                          variant="destructiveOutline"
                          size="sm"
                          onClick={() => setDeletingId(user.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 px-2.5 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          isLoading={isLoading}
        />
      )}
    </div>

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akun Pengguna"
        description="Apakah Anda yakin ingin menghapus akun pengguna ini? Pengguna tidak akan dapat login lagi ke sistem."
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
