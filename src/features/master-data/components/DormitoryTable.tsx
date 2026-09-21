'use client';

import { useState } from 'react';
import { Dormitory } from '../types';
import { useDeleteDormitory } from '../api/useDeleteDormitory';
import { EditDormitoryModal } from './EditDormitoryModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Pencil, Trash2, Building2 } from 'lucide-react';

interface DormitoryTableProps {
  data?: Dormitory[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function DormitoryTable({ data, isLoading, isError, onRetry }: DormitoryTableProps) {
  const [editingDorm, setEditingDorm] = useState<Dormitory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteMutation = useDeleteDormitory();

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Asrama"
        message="Terjadi kendala saat mengambil data asrama dari server."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat data asrama...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-7 w-7 text-emerald-600" />}
        title="Belum Ada Data Asrama"
        description="Silakan buat gedung asrama baru untuk penempatan santri mukim."
      />
    );
  }

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success('Asrama berhasil dihapus');
        setDeletingId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Gagal menghapus asrama');
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
              <th scope="col" className="px-5 py-3.5 font-semibold">Nama Gedung / Asrama</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Tanggal Dibuat</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((dorm) => (
              <tr key={dorm.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{dorm.id}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900">{dorm.name}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {new Date(dorm.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingDorm(dorm)}
                      className="h-8 px-2.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructiveOutline" 
                      size="sm"
                      onClick={() => setDeletingId(dorm.id)}
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
      
      <EditDormitoryModal 
        dormitory={editingDorm} 
        isOpen={!!editingDorm} 
        onClose={() => setEditingDorm(null)} 
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Asrama"
        description="Apakah Anda yakin ingin menghapus asrama ini? Data santri mukim yang menempati asrama ini mungkin perlu dialihkan."
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
