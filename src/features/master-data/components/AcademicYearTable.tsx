'use client';

import { useState } from 'react';
import { AcademicYear } from '../types';
import { useDeleteAcademicYear } from '../api/useDeleteAcademicYear';
import { EditAcademicYearModal } from './EditAcademicYearModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Pencil, Trash2, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';

interface AcademicYearTableProps {
  data?: AcademicYear[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function AcademicYearTable({ data, isLoading, isError, onRetry }: AcademicYearTableProps) {
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteMutation = useDeleteAcademicYear();

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Tahun Ajaran"
        message="Tidak dapat mengambil daftar tahun ajaran dari server."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat data tahun ajaran...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-7 w-7 text-emerald-600" />}
        title="Belum Ada Tahun Ajaran"
        description="Silakan buat tahun ajaran baru terlebih dahulu untuk memulai operasional."
      />
    );
  }

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success('Tahun ajaran berhasil dihapus');
        setDeletingId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Gagal menghapus tahun ajaran');
        setDeletingId(null);
      },
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/60">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">ID</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Nama Tahun Ajaran</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Periode Kalender</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Status Operasional</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((year) => (
              <tr key={year.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{year.id}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900">{year.name}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                  {year.start_date && year.end_date ? (
                    <span>
                      {new Date(year.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      {' - '}
                      {new Date(year.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {year.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Aktif Berjalan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200/70">
                      <XCircle className="h-3.5 w-3.5 text-slate-400" />
                      Tidak Aktif
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingYear(year)}
                      className="h-8 px-2.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructiveOutline" 
                      size="sm"
                      onClick={() => setDeletingId(year.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 px-2.5 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <EditAcademicYearModal 
        academicYear={editingYear} 
        isOpen={!!editingYear} 
        onClose={() => setEditingYear(null)} 
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tahun Ajaran"
        description="Apakah Anda yakin ingin menghapus tahun ajaran ini? Data tagihan atau referensi kelas yang terikat mungkin akan terpengaruh."
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
