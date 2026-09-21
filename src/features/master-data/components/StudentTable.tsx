'use client';

import { useState } from 'react';
import { Student } from '../types';
import { useDeleteStudent } from '../api/useDeleteStudent';
import { EditStudentModal } from './EditStudentModal';
import { GuardianMappingModal } from './GuardianMappingModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Pencil, Trash2, Users, UserCheck, CheckCircle2, XCircle, Award } from 'lucide-react';

interface StudentTableProps {
  data?: Student[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function StudentTable({ data, isLoading, isError, onRetry }: StudentTableProps) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [mappingStudent, setMappingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteMutation = useDeleteStudent();

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Data Santri"
        message="Tidak dapat mengambil daftar santri dari server. Silakan coba kembali."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat data santri...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-7 w-7 text-emerald-600" />}
        title="Tidak Ada Santri Ditemukan"
        description="Belum ada data santri yang cocok dengan pencarian atau filter saat ini."
      />
    );
  }

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success('Santri berhasil dihapus');
        setDeletingId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Gagal menghapus santri');
        setDeletingId(null);
      },
    });
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Aktif
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80">
            <XCircle className="h-3 w-3 text-rose-500" />
            Tidak Aktif
          </span>
        );
      case 'GRADUATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80">
            <Award className="h-3 w-3 text-blue-500" />
            Lulus
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">NIS</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Nama Santri</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Kelas</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Asrama</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Wali Santri</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Saldo Dompet</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((student) => (
              <tr key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{student.nis}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900">{student.name}</td>
                <td className="px-5 py-3.5 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-medium">
                    {student.classroom?.name || 'Belum diatur'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {student.dormitory ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60 font-medium">
                      {student.dormitory.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/70 font-medium text-[11px]">
                      Non-Mukim
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {student.guardians && student.guardians.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-medium">
                      <UserCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[130px]">{student.guardians[0].username || student.guardians[0].name || 'Wali Santri'}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Belum dipetakan</span>
                  )}
                </td>
                <td className="px-5 py-3.5">{renderStatus(student.status)}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                  {formatCurrency(student.wallet?.balance || 0)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setMappingStudent(student)}
                      className="h-8 px-2.5 text-xs text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Wali
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingStudent(student)}
                      className="h-8 px-2.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructiveOutline" 
                      size="sm"
                      onClick={() => setDeletingId(student.id)}
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
      
      <EditStudentModal 
        student={editingStudent} 
        isOpen={!!editingStudent} 
        onClose={() => setEditingStudent(null)} 
      />

      <GuardianMappingModal 
        student={mappingStudent} 
        isOpen={!!mappingStudent} 
        onClose={() => setMappingStudent(null)} 
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Santri"
        description="Apakah Anda yakin ingin menghapus santri ini? Seluruh riwayat tagihan dan dompet santri akan terhapus secara permanen."
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
