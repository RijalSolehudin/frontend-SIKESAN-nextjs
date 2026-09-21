'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SppPaymentVerification } from '../types';
import { AlertTriangle } from 'lucide-react';
import { useRejectSppVerification } from '../api/useRejectSppVerification';
import { toast } from 'sonner';

interface RejectVerificationModalProps {
  payment: SppPaymentVerification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectVerificationModal({
  payment,
  open,
  onOpenChange,
}: RejectVerificationModalProps) {
  const [reason, setReason] = useState('');
  const rejectMutation = useRejectSppVerification();

  if (!payment) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      toast.error('Mohon masukkan alasan penolakan pembayaran.');
      return;
    }

    rejectMutation.mutate(
      {
        id: payment.id,
        rejection_reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Pembayaran SPP berhasil ditolak.');
          setReason('');
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal menolak pembayaran.');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-700">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            Tolak Pembayaran SPP
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tagihan santri akan dikembalikan ke status belum dibayar (*UNPAID*) dan wali santri dapat melakukan pengajuan ulang.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Santri:</span>
              <span className="font-semibold text-slate-800">
                {payment.bills?.[0]?.student?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Nominal:</span>
              <span className="font-semibold text-rose-700">
                Rp {payment.total_paid_amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rejection-reason" className="text-xs font-semibold text-slate-700">
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              placeholder="Contoh: Nominal transfer tidak sesuai, bukti transfer buram/tidak terbaca, atau mutasi bank belum masuk."
              rows={3}
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden resize-none"
            />
          </div>

          <DialogFooter className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={rejectMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="gap-1.5"
            >
              {rejectMutation.isPending ? 'Memproses...' : 'Tolak Pembayaran'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
