'use client';

import { useState } from 'react';
import {
  useGetAnnualFeeVerifications,
  useApproveAnnualFeeVerification,
  useRejectAnnualFeeVerification,
} from '../api/useAnnualFeePayment';
import { AnnualFeePayment } from '../types/annual-fees';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function AnnualFeeVerificationTable() {
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<AnnualFeePayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { data, isLoading } = useGetAnnualFeeVerifications();
  const approveMutation = useApproveAnnualFeeVerification();
  const rejectMutation = useRejectAnnualFeeVerification();

  const verifications = data?.data || [];

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const handleApprove = (payment: AnnualFeePayment) => {
    if (!confirm(`Setujui cicilan sebesar ${formatRupiah(payment.amount)} untuk ${payment.bill?.student?.name}?`)) {
      return;
    }

    approveMutation.mutate(payment.id, {
      onSuccess: () => toast.success('Pembayaran cicilan berhasil disetujui!'),
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menyetujui'),
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment) return;
    if (!rejectionReason.trim()) {
      toast.error('Masukkan alasan penolakan');
      return;
    }

    rejectMutation.mutate(
      { id: rejectingPayment.id, rejection_reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success('Pembayaran cicilan ditolak.');
          setRejectingPayment(null);
          setRejectionReason('');
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menolak'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat data verifikasi cicilan...</span>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-slate-200/80">
        Tidak ada pembayaran cicilan yang menunggu verifikasi saat ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white/70 shadow-xs">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-3.5">Santri</th>
              <th className="px-5 py-3.5">Kelas</th>
              <th className="px-5 py-3.5">Tanggal Bayar</th>
              <th className="px-5 py-3.5">Metode / Catatan</th>
              <th className="px-5 py-3.5 text-right">Nominal Cicilan</th>
              <th className="px-5 py-3.5 text-center">Bukti Transfer</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {verifications.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-bold text-slate-900 block">{p.bill?.student?.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">NIS: {p.bill?.student?.nis}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-700">
                  {p.bill?.student?.classroom?.name || '-'}
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-mono">
                  {new Date(p.payment_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-slate-800 block">{p.payment_method}</span>
                  {p.notes && <span className="text-slate-500 italic text-[11px]">{p.notes}</span>}
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-800 text-sm">
                  {formatRupiah(p.amount)}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {p.proof_full_url || p.proof_url ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProofUrl(p.proof_full_url || p.proof_url || '')}
                      className="h-7 text-xs rounded-xl flex items-center gap-1 mx-auto text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Lihat Bukti
                    </Button>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">-</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApprove(p)}
                      disabled={approveMutation.isPending}
                      className="h-7 px-2.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Setujui
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectingPayment(p);
                        setRejectionReason('');
                      }}
                      className="h-7 px-2 text-xs rounded-xl border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Tolak
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proof Preview Modal */}
      <Dialog open={!!selectedProofUrl} onOpenChange={() => setSelectedProofUrl(null)}>
        <DialogContent className="sm:max-w-[500px] glass-modal p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Bukti Transfer Pembayaran
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex justify-center bg-slate-100/60 rounded-xl p-2 border border-slate-200/80 overflow-hidden">
            {selectedProofUrl && (
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="max-h-[420px] w-auto rounded-lg object-contain shadow-xs"
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedProofUrl(null)}
              className="rounded-xl text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Modal */}
      <Dialog open={!!rejectingPayment} onOpenChange={() => setRejectingPayment(null)}>
        <DialogContent className="sm:max-w-[420px] glass-modal p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Tolak Pembayaran Cicilan
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700 font-semibold">Alasan Penolakan:</Label>
              <Input
                placeholder="Misal: Bukti transfer tidak jelas / dana belum masuk"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>
            <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectingPayment(null)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={rejectMutation.isPending}
                className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {rejectMutation.isPending ? 'Menolak...' : 'Konfirmasi Tolak'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
