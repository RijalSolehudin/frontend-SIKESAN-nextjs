'use client';

import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetSppReceipt } from '../api/useGetSppReceipt';
import { printSppReceipt, numberToWordsIndonesian } from '../utils/printReceipt';
import { Printer, MessageSquare, CheckCircle2, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SppReceiptModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SppReceiptModal({ paymentId, isOpen, onClose }: SppReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { data: receipt, isLoading, isError } = useGetSppReceipt(isOpen ? paymentId : null);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    if (!receipt) return;
    printSppReceipt(receipt);
  };

  const handleSendWhatsApp = () => {
    if (!receipt) return;

    const guardianPhone = receipt.guardian?.phone || '';
    if (!guardianPhone) {
      toast.error('Nomor WhatsApp wali santri tidak tersedia di data santri.');
      return;
    }

    // Clean phone number (e.g. 0812... -> 62812...)
    let cleanPhone = guardianPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const billDetails = receipt.bills
      .map((b) => `• SPP ${b.month_name} ${b.period_year}: ${formatCurrency(b.allocated_amount)}`)
      .join('\n');

    const formattedDate = new Date(receipt.payment_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const message = `*BUKTI KWITANSI PEMBAYARAN SPP*
*${receipt.institution.name}*
${receipt.institution.address}
---------------------------------------------
*No. Kwitansi :* ${receipt.receipt_number}
*Tanggal      :* ${formattedDate} (${receipt.payment_time} WIB)
*Metode       :* ${receipt.payment_method}
*Status       :* LUNAS / SAH DITERIMA

*DATA SANTRI:*
• Nama  : *${receipt.student?.name || '-'}*
• NIS   : ${receipt.student?.nis || '-'}
• Kelas : ${receipt.student?.classroom || '-'}

*RINCIAN TAGIHAN:*
${billDetails}

*TOTAL PEMBAYARAN:*
*${formatCurrency(receipt.total_paid_amount)}*
_(${numberToWordsIndonesian(receipt.total_paid_amount)} Rupiah)_
---------------------------------------------
_Alhamdulillah, pembayaran telah diverifikasi dan sah tercatat di sistem perbendaharaan pondok pesantren._

Terima kasih atas kerja samanya.
*Pengurus Keuangan / Bendahara SIKESAN*`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-slate-50 border border-slate-200">
        <DialogHeader className="p-4 sm:p-5 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Kwitansi Resmi Pembayaran SPP
          </DialogTitle>
          <span className="text-xs text-slate-400 font-mono">
            {receipt?.receipt_number || 'Loading...'}
          </span>
        </DialogHeader>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <p className="text-xs font-medium">Memuat rincian kwitansi...</p>
          </div>
        ) : isError || !receipt ? (
          <div className="py-12 text-center text-slate-500 px-6">
            <p className="text-sm font-semibold text-rose-600">Gagal memuat dokumen kwitansi.</p>
            <p className="text-xs text-slate-400 mt-1">Pastikan pembayaran telah tercatat atau coba beberapa saat lagi.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
            {/* Printable Receipt Paper Container */}
            <div
              ref={receiptRef}
              id="printable-spp-receipt"
              className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden text-slate-800"
            >
              {/* LUNAS Watermark Stamp */}
              <div className="absolute right-6 top-20 pointer-events-none select-none opacity-15 rotate-[-18deg] border-4 border-emerald-600 text-emerald-700 font-black text-4xl sm:text-5xl px-4 py-1 rounded-xl uppercase tracking-widest">
                LUNAS
              </div>

              {/* Header Lembaga / Pesantren */}
              <div className="border-b-4 border-double border-slate-900 pb-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-lg sm:text-xl tracking-tight uppercase">
                  <Building2 className="h-5 w-5" />
                  <span>{receipt.institution.name}</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 tracking-wide uppercase">
                  {receipt.institution.sub_name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {receipt.institution.address} • Telp: {receipt.institution.phone} • Email: {receipt.institution.email}
                </p>
              </div>

              {/* Receipt Title & Meta */}
              <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Kwitansi Bukti Pembayaran SPP
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-700 font-semibold">
                    No: {receipt.receipt_number}
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500">
                  <p className="flex items-center sm:justify-end gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(receipt.payment_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Pukul: {receipt.payment_time} WIB
                  </p>
                </div>
              </div>

              {/* Student and Guardian Details */}
              <div className="py-3 grid grid-cols-2 gap-3 text-xs border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identitas Santri:</span>
                  <p className="font-bold text-slate-900 text-sm">{receipt.student?.name || '-'}</p>
                  <p className="text-slate-500">NIS: <span className="font-mono text-slate-700">{receipt.student?.nis || '-'}</span></p>
                  <p className="text-slate-500">Kelas: <span className="font-medium text-slate-700">{receipt.student?.classroom}</span></p>
                  <p className="text-slate-500">Asrama: <span className="font-medium text-slate-700">{receipt.student?.dormitory}</span></p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Wali & Pembayaran:</span>
                  <p className="font-bold text-slate-900 text-sm">{receipt.guardian?.name || 'Wali Santri'}</p>
                  <p className="text-slate-500">No. WA: <span className="font-mono text-slate-700">{receipt.guardian?.phone || '-'}</span></p>
                  <p className="text-slate-500">Metode: <span className="font-semibold text-emerald-700">{receipt.payment_method}</span></p>
                  <p className="text-slate-500">Status: <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600"><CheckCircle2 className="h-3 w-3" /> SAH / LUNAS</span></p>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                      <th className="py-2 text-left font-semibold">No.</th>
                      <th className="py-2 text-left font-semibold">Keterangan Tagihan</th>
                      <th className="py-2 text-center font-semibold">Periode</th>
                      <th className="py-2 text-right font-semibold">Nominal Terbayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipt.bills.map((bill, idx) => (
                      <tr key={bill.id} className="text-slate-700">
                        <td className="py-2 font-mono text-slate-400">{idx + 1}.</td>
                        <td className="py-2 font-medium">SPP Santri ({receipt.student?.name})</td>
                        <td className="py-2 text-center font-medium text-slate-600">{bill.month_name} {bill.period_year}</td>
                        <td className="py-2 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(bill.allocated_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800/80 font-bold text-slate-900 text-sm">
                      <td colSpan={3} className="pt-3 text-right pr-4 uppercase tracking-wider text-xs">Total Pembayaran:</td>
                      <td className="pt-3 text-right text-emerald-700 font-extrabold text-base tabular-nums">
                        {formatCurrency(receipt.total_paid_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Terbilang */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Terbilang:</span>
                <p className="italic font-semibold text-slate-700">
                  &ldquo;{numberToWordsIndonesian(receipt.total_paid_amount)} Rupiah&rdquo;
                </p>
              </div>

              {/* Signature / Verifier Footer */}
              <div className="pt-6 flex justify-between items-end text-xs text-slate-500">
                <div className="space-y-1 text-[11px]">
                  <p className="text-slate-400">Dicetak melalui Sistem SIKESAN</p>
                  <p className="font-mono text-[10px] text-slate-400">ID Transaksi: {receipt.payment_id}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Bendahara / Petugas Kasir</p>
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-emerald-700 font-serif italic text-xs font-bold border-b border-emerald-700/60 pb-0.5">
                      SIKESAN Verified
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-xs">
                    {receipt.verifier?.name || receipt.creator?.name || 'Bendahara Pondok'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons (Hidden on Print) */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-full sm:w-auto text-xs"
              >
                Tutup
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendWhatsApp}
                  className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 gap-1.5 text-xs font-semibold"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Kirim via WhatsApp
                </Button>
                <Button
                  size="sm"
                  onClick={handlePrint}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs font-semibold"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Kwitansi
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
