'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnnualFeeBill } from '../types/annual-fees';
import { usePayAnnualFeeBill } from '../api/useAnnualFeePayment';
import { toast } from 'sonner';
import { CreditCard, Receipt, Wallet, AlertCircle } from 'lucide-react';

interface AnnualFeePaymentModalProps {
  bill: AnnualFeeBill | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessPayment?: (paymentId: string) => void;
}

export function AnnualFeePaymentModal({
  bill,
  isOpen,
  onClose,
  onSuccessPayment,
}: AnnualFeePaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [notes, setNotes] = useState<string>('');

  const payMutation = usePayAnnualFeeBill();

  if (!bill) return null;

  const remaining = bill.remaining_amount;
  const progressPercent = Math.min(100, Math.round((bill.paid_amount / bill.total_amount) * 100));

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const handleQuickAmount = (ratio: number) => {
    const calculated = Math.round(remaining * ratio);
    setAmount(calculated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error('Masukkan nominal cicilan yang valid');
      return;
    }

    if (amount > remaining) {
      toast.error(`Nominal pembayaran melebihi sisa tagihan (${formatRupiah(remaining)})`);
      return;
    }

    payMutation.mutate(
      {
        annual_fee_bill_id: bill.id,
        amount,
        payment_method: paymentMethod,
        notes: notes || undefined,
      },
      {
        onSuccess: (res) => {
          toast.success('Pembayaran cicilan berhasil dicatat!');
          onClose();
          setAmount(0);
          setNotes('');
          if (onSuccessPayment && res.data?.id) {
            onSuccessPayment(res.data.id);
          }
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal memproses pembayaran');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-modal p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Bayar Cicilan Biaya Tahunan
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Santri: <strong className="text-slate-700">{bill.student?.name}</strong> ({bill.student?.classroom?.name || '-'})
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Progress Card */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Total Tagihan:</span>
              <span className="font-bold text-slate-900 font-mono">{formatRupiah(bill.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Sudah Terbayar:</span>
              <span className="font-semibold text-emerald-700 font-mono">{formatRupiah(bill.paid_amount)} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200/50">
              <span className="font-semibold text-slate-700">Sisa Tagihan:</span>
              <span className="font-bold text-red-600 font-mono text-sm">{formatRupiah(remaining)}</span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Pilihan Cepat Nominal:</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(0.25)}
                className="text-xs rounded-xl h-8 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                25% ({formatRupiah(Math.round(remaining * 0.25))})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(0.5)}
                className="text-xs rounded-xl h-8 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                50% ({formatRupiah(Math.round(remaining * 0.5))})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(1)}
                className="text-xs rounded-xl h-8 border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-800"
              >
                Lunas (100%)
              </Button>
            </div>
          </div>

          {/* Input Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-700 font-semibold">Nominal Cicilan yang Dibayar (Rp):</Label>
            <Input
              type="number"
              min={1}
              max={remaining}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Masukkan nominal cicilan..."
              className="rounded-xl h-10 font-mono font-bold text-base text-emerald-900"
              required
            />
            {amount > remaining && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Nominal melebihi sisa tagihan!
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700 font-semibold">Metode Pembayaran:</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val: any) => setPaymentMethod(val)}
              >
                <SelectTrigger className="rounded-xl h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                  <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700 font-semibold">Catatan / Keterangan:</Label>
              <Input
                type="text"
                placeholder="Misal: Cicilan ke-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={payMutation.isPending}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={payMutation.isPending || amount <= 0 || amount > remaining}
              className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {payMutation.isPending ? 'Memproses...' : `Konfirmasi Pembayaran ${formatRupiah(amount)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
