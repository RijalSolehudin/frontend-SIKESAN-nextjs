'use client';

import { useState, useEffect } from 'react';
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
import { MoneyInput } from '@/components/ui/money-input';
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
import {
  CreditCard,
  AlertCircle,
  UploadCloud,
  FileText,
  ImageIcon,
  X,
} from 'lucide-react';

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

  // Proof upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState<number>(Date.now());

  const payMutation = usePayAnnualFeeBill();

  // Reset file preview on close
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setAmount(0);
      setNotes('');
      setInputKey(Date.now());
    }
  }, [isOpen]);

  if (!bill) return null;

  const remaining = bill.remaining_amount;
  const progressPercent = Math.min(100, Math.round((bill.paid_amount / bill.total_amount) * 100));

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas maksimal 5MB');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setInputKey(Date.now());
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
        proof: selectedFile || undefined,
      },
      {
        onSuccess: (res) => {
          toast.success('Pembayaran cicilan berhasil dicatat!');
          onClose();
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
      <DialogContent className="sm:max-w-[520px] glass-modal p-6">
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

          {/* Input Amount using MoneyInput */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-700 font-semibold">
              Nominal Cicilan yang Dibayar:
            </Label>
            <MoneyInput
              value={amount ? String(amount) : ''}
              onChange={(val) => setAmount(Number(val) || 0)}
              placeholder="Contoh: 1.000.000"
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

          {/* Payment Method & Notes */}
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

          {/* Bukti Pembayaran / Upload Nota Kasir */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Bukti Pembayaran / Nota Kasir:</span>
              <span className="text-[10px] text-slate-400 font-normal">Opsional (JPG, PNG, PDF maks 5MB)</span>
            </label>

            <input
              key={inputKey}
              id="annual-fee-payment-proof-input"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {!selectedFile ? (
              <label
                htmlFor="annual-fee-payment-proof-input"
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 hover:bg-emerald-50/20 rounded-xl p-3 transition-colors cursor-pointer flex items-center justify-center gap-3 text-center"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Pilih atau unggah bukti pembayaran</p>
                  <p className="text-[11px] text-slate-400">Klik di sini untuk memilih foto nota / bukti transfer</p>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-emerald-200 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      {selectedFile.type === 'application/pdf' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate max-w-[260px] text-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearFile}
                  className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg shrink-0"
                  title="Hapus berkas"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
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
