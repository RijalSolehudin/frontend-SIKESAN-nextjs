'use client';

import { useState } from 'react';
import { useGetSppVerifications } from '../api/useGetSppVerifications';
import { useApproveSppVerification } from '../api/useApproveSppVerification';
import { SppPaymentVerification } from '../types';
import { ProofPreviewModal } from './ProofPreviewModal';
import { RejectVerificationModal } from './RejectVerificationModal';
import { 
  Check, 
  X, 
  Eye, 
  Search, 
  Building, 
  Calendar, 
  Clock,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const MONTH_NAMES: Record<number, string> = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mei', 6: 'Jun',
  7: 'Jul', 8: 'Agu', 9: 'Sep', 10: 'Okt', 11: 'Nov', 12: 'Des',
};

interface SppVerificationTableProps {
  onOpenReceipt?: (paymentId: string) => void;
}

export function SppVerificationTable({ onOpenReceipt }: SppVerificationTableProps = {}) {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'all'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [previewPayment, setPreviewPayment] = useState<SppPaymentVerification | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [rejectPayment, setRejectPayment] = useState<SppPaymentVerification | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data, isLoading } = useGetSppVerifications({
    status: statusFilter,
    search: debouncedSearch,
    per_page: 30,
  });

  const approveMutation = useApproveSppVerification();

  const verifications = data?.data?.data || [];
  const pendingCount = data?.meta?.pending_count ?? 0;

  const handleApprove = (payment: SppPaymentVerification) => {
    approveMutation.mutate(payment.id, {
      onSuccess: () => {
        toast.success(`Pembayaran SPP untuk ${payment.bills?.[0]?.student?.name || 'Santri'} berhasil disetujui.`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Gagal menyetujui pembayaran.');
      },
    });
  };

  const handleOpenPreview = (payment: SppPaymentVerification) => {
    setPreviewPayment(payment);
    setPreviewOpen(true);
  };

  const handleOpenReject = (payment: SppPaymentVerification) => {
    setRejectPayment(payment);
    setRejectOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header controls: Status Pills & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Menunggu</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'APPROVED'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disetujui
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'REJECTED'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ditolak
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Cari santri, wali, pengirim..."
            className="pl-9 h-9 rounded-xl text-xs bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">Tgl Pengajuan</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Santri & Kelas</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Wali / Pengirim</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Bulan SPP</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Nominal</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-center">Bukti Struk</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-center">Status</th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Memuat antrean verifikasi pembayaran...</span>
                  </div>
                </td>
              </tr>
            ) : verifications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-xs">
                  Tidak ada pengajuan pembayaran pada status ini.
                </td>
              </tr>
            ) : (
              verifications.map((payment) => {
                const firstBill = payment.bills?.[0];
                const student = firstBill?.student;
                const proofUrl = payment.proof_full_url || payment.proof_url;

                return (
                  <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Tanggal */}
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(payment.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block ml-5">
                        {new Date(payment.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </span>
                    </td>

                    {/* Santri & Kelas */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {student?.name || 'Santri'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-mono">{student?.nis || '-'}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200/60 text-[10px] font-medium">
                          {student?.classroom?.name || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Wali / Pengirim */}
                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-slate-800">
                        {payment.sender_account_holder || payment.creator?.name || 'Wali Santri'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{payment.sender_bank_name || 'Bank Transfer'}</span>
                      </div>
                    </td>

                    {/* Bulan SPP */}
                    <td className="px-5 py-3.5 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {payment.bills?.map((bill) => (
                          <span
                            key={bill.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          >
                            {MONTH_NAMES[bill.period_month] || bill.period_month} {bill.period_year}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Nominal */}
                    <td className="px-5 py-3.5 text-xs font-extrabold text-emerald-800 whitespace-nowrap">
                      Rp {payment.total_paid_amount.toLocaleString('id-ID')}
                    </td>

                    {/* Bukti Struk Preview Button */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {proofUrl ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPreview(payment)}
                          className="h-7 px-2.5 text-[11px] font-medium gap-1 text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Lihat Struk</span>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tidak ada</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {payment.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Menunggu
                        </span>
                      ) : payment.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="h-3 w-3 text-emerald-600" />
                          Disetujui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200" title={payment.rejection_reason || ''}>
                          <X className="h-3 w-3 text-rose-600" />
                          Ditolak
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {payment.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApprove(payment)}
                            disabled={approveMutation.isPending}
                            className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-2xs"
                            title="Setujui Pembayaran SPP"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Setujui</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReject(payment)}
                            disabled={approveMutation.isPending}
                            className="h-7 px-2.5 text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1"
                            title="Tolak Pembayaran"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Tolak</span>
                          </Button>
                        </div>
                      ) : payment.status === 'APPROVED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenReceipt?.(payment.id)}
                            className="h-7 px-2.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 gap-1"
                            title="Lihat / Cetak Kwitansi Resmi"
                          >
                            <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Kwitansi</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-600 max-w-[140px] truncate block text-right" title={payment.rejection_reason || ''}>
                          {payment.rejection_reason || 'Ditolak'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ProofPreviewModal
        payment={previewPayment}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <RejectVerificationModal
        payment={rejectPayment}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </div>
  );
}
