'use client';

import { useState } from 'react';
import { TopUpRequest } from '../types';
import { useApproveTopUp } from '../api/useApproveTopUp';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Clock, XCircle, ArrowDownToLine } from 'lucide-react';

interface TopUpTableProps {
  data?: TopUpRequest[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function TopUpTable({ data, isLoading, isError, onRetry }: TopUpTableProps) {
  const [approvingId, setApprovingId] = useState<string | number | null>(null);
  const approveMutation = useApproveTopUp();

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Riwayat Top-Up"
        message="Tidak dapat mengambil daftar pengajuan Top-Up dari server."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat data permintaan Top-Up...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<ArrowDownToLine className="h-7 w-7 text-emerald-600" />}
        title="Belum Ada Riwayat Top-Up"
        description="Belum ada permintaan pengisian saldo dompet santri."
      />
    );
  }

  const handleApproveConfirm = () => {
    if (!approvingId) return;
    approveMutation.mutate(approvingId, {
      onSuccess: () => {
        toast.success('Permintaan Top-Up berhasil disetujui');
        setApprovingId(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal menyetujui Top-Up');
        setApprovingId(null);
      },
    });
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            Menunggu
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Disetujui
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200">
            <XCircle className="h-3 w-3 text-rose-600" />
            Ditolak
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">Tanggal</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Santri Pemilik</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Nominal Top Up</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Metode Bayar</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((req) => (
              <tr key={req.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {new Date(req.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-bold text-slate-900">{req.student?.name}</div>
                  <div className="text-xs text-slate-400 font-mono">NIS: {req.student?.nis}</div>
                </td>
                <td className="px-5 py-3.5 font-extrabold text-emerald-700 tabular-nums">
                  Rp {req.requested_amount.toLocaleString('id-ID')}
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                    {req.payment_method}
                  </span>
                </td>
                <td className="px-5 py-3.5">{renderStatus(req.status)}</td>
                <td className="px-5 py-3.5 text-right">
                  {req.status === 'PENDING' ? (
                    <Button 
                      variant="default"
                      size="sm"
                      aria-label="Approve"
                      onClick={() => setApprovingId(req.id)}
                      disabled={approveMutation.isPending}
                      className="h-8 px-3 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Setujui
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Selesai</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!approvingId}
        onClose={() => setApprovingId(null)}
        onConfirm={handleApproveConfirm}
        title="Setujui Permintaan Top-Up"
        description="Apakah Anda yakin ingin menyetujui pengisian saldo ini? Saldo dompet digital santri akan otomatis bertambah saat ini juga."
        confirmText="Ya, Setujui"
        variant="success"
        isLoading={approveMutation.isPending}
      />
    </>
  );
}
