'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetAnnualFeeReceipt } from '../api/useAnnualFeePayment';
import { printAnnualFeeReceipt } from '../utils/printReceipt';
import { Printer, CheckCircle2, Clock, FileText } from 'lucide-react';

interface AnnualFeeReceiptModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnualFeeReceiptModal({
  paymentId,
  isOpen,
  onClose,
}: AnnualFeeReceiptModalProps) {
  const { data: receipt, isLoading } = useGetAnnualFeeReceipt(isOpen ? paymentId : null);

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const handlePrint = () => {
    if (!receipt) return;
    printAnnualFeeReceipt(receipt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] glass-modal p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Kwitansi Biaya Tahunan
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bukti resmi pembayaran cicilan biaya tahunan santri
                </p>
              </div>
            </div>
            {receipt && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  receipt.remaining_balance <= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {receipt.remaining_balance <= 0 ? 'LUNAS' : 'CICILAN'}
              </span>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <span>Memuat data kwitansi...</span>
          </div>
        ) : receipt ? (
          <div className="mt-4 space-y-4">
            {/* Santri Info */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Nama Santri:</span>
                  <p className="font-bold text-slate-900">{receipt.student?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">NIS:</span>
                  <p className="font-semibold text-slate-800 font-mono">{receipt.student?.nis}</p>
                </div>
                <div>
                  <span className="text-slate-500">Kelas & Jenjang:</span>
                  <p className="font-semibold text-slate-800">
                    {receipt.student?.classroom?.name} ({receipt.student?.classroom?.education_level || '-'})
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Tahun Ajaran:</span>
                  <p className="font-semibold text-slate-800">{receipt.bill?.academic_year?.name}</p>
                </div>
              </div>
            </div>

            {/* Installment Summary */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Pos Pembayaran:</span>
                <span className="font-bold text-slate-900">
                  Cicilan Ke-{receipt.installment_number} dari {receipt.total_installments} Transaksi
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Nominal Dibayar Kali Ini:</span>
                <span className="font-bold text-emerald-800 font-mono text-sm">
                  {formatRupiah(receipt.payment.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-emerald-200/60 pt-2">
                <span className="text-slate-600">Total Biaya Tahunan:</span>
                <span className="font-semibold text-slate-800 font-mono">{formatRupiah(receipt.total_billed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Akumulasi Terbayar:</span>
                <span className="font-semibold text-emerald-700 font-mono">{formatRupiah(receipt.total_paid)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-emerald-200/60 pt-2">
                <span className="font-bold text-slate-800">Sisa Tagihan:</span>
                <span
                  className={`font-bold font-mono text-sm ${
                    receipt.remaining_balance <= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {formatRupiah(receipt.remaining_balance)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Cetak Kwitansi
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            Data kwitansi tidak ditemukan.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
