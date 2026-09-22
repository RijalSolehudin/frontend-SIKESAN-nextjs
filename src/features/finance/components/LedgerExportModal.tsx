'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetLedger } from '../api/useGetLedger';
import { printLedgerReport } from '../utils/printLedger';
import { numberToWordsIndonesian } from '../utils/printReceipt';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Printer,
  FileSpreadsheet,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';

interface LedgerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number | 'all';
  selectedYear: number | 'all';
  onMonthChange: (month: number | 'all') => void;
  onYearChange: (year: number | 'all') => void;
}

const MONTHS = [
  { value: 'all', label: 'Semua Bulan (All Time)' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  { value: 'all', label: 'Semua Tahun (All Time)' },
  { value: (CURRENT_YEAR - 2).toString(), label: (CURRENT_YEAR - 2).toString() },
  { value: (CURRENT_YEAR - 1).toString(), label: (CURRENT_YEAR - 1).toString() },
  { value: CURRENT_YEAR.toString(), label: CURRENT_YEAR.toString() },
  { value: (CURRENT_YEAR + 1).toString(), label: (CURRENT_YEAR + 1).toString() },
];

export function LedgerExportModal({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: LedgerExportModalProps) {
  const { user } = useAuth();

  // Fetch all transactions for this period (up to 200 items for full export)
  const { data: ledgerData, isLoading } = useGetLedger({
    month: selectedMonth,
    year: selectedYear,
    per_page: 200,
  });

  const transactions = ledgerData?.data || [];
  const totalIn = transactions
    .filter((t) => t.is_debit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = transactions
    .filter((t) => !t.is_debit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netFlow = totalIn - totalOut;

  const formatCurrency = (amount: number = 0) => {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  };

  const periodLabel = (() => {
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      const monthObj = MONTHS.find((m) => m.value === selectedMonth.toString());
      return `${monthObj?.label || `Bulan ${selectedMonth}`} ${selectedYear}`;
    } else if (selectedMonth === 'all' && selectedYear !== 'all') {
      return `Tahun ${selectedYear} (Semua Bulan)`;
    } else if (selectedMonth !== 'all' && selectedYear === 'all') {
      const monthObj = MONTHS.find((m) => m.value === selectedMonth.toString());
      return `Bulan ${monthObj?.label} (Semua Tahun)`;
    }
    return 'Seluruh Periode (All Time)';
  })();

  const officerName = user?.name || 'Bendahara Keuangan SIKESAN';

  const handlePrint = () => {
    printLedgerReport({
      transactions,
      periodMonth: selectedMonth,
      periodYear: selectedYear,
      totalIn,
      totalOut,
      netFlow,
      officerName,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-slate-50 border border-slate-200">
        <DialogHeader className="p-4 sm:p-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              Pratinjau Dokumen Resmi Buku Besar
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Format ekspor formal standar akuntansi pesantren (Kop, Jurnal Mutasi, & Pengesahan)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-lg"
            >
              Tutup
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              disabled={isLoading || transactions.length === 0}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Filter Strip at top of modal to refine period before printing */}
        <div className="px-5 py-3 bg-slate-100/80 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Filter className="h-3.5 w-3.5 text-emerald-600" />
            <span>Periode Yang Diekspor:</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Month Filter */}
            <Select
              value={selectedMonth.toString()}
              onValueChange={(val) => onMonthChange(val === 'all' ? 'all' : parseInt(val))}
            >
              <SelectTrigger className="h-8 w-44 bg-white border-slate-200 text-xs rounded-lg">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select
              value={selectedYear.toString()}
              onValueChange={(val) => onYearChange(val === 'all' ? 'all' : parseInt(val))}
            >
              <SelectTrigger className="h-8 w-36 bg-white border-slate-200 text-xs rounded-lg">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Printable Paper Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[72vh]">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
              <p className="text-xs">Menyusun dokumen laporan resmi...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden text-slate-800">
              {/* Official Watermark */}
              <div className="absolute right-10 top-24 pointer-events-none select-none opacity-5 rotate-[-15deg] border-4 border-emerald-800 text-emerald-900 font-black text-4xl sm:text-5xl px-6 py-2 rounded-xl uppercase tracking-widest">
                DOKUMEN RESMI SIKESAN
              </div>

              {/* Kop Lembaga / Pesantren */}
              <div className="border-b-4 border-double border-slate-900 pb-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-lg sm:text-xl tracking-tight uppercase">
                  <Building2 className="h-5 w-5" />
                  <span>PONDOK PESANTREN SIKESAN</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 tracking-wide uppercase">
                  Sistem Informasi Keuangan & Santri (SIKESAN)
                </p>
                <p className="text-[10px] text-slate-400">
                  Jl. Pesantren Luhur No. 1, Jawa Barat, Indonesia • Telp: +62 812-9876-5432 • Email: keuangan@sikesan.ac.id
                </p>
              </div>

              {/* Document Header & Meta */}
              <div className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Laporan Buku Besar Kas (General Ledger)
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Periode: {periodLabel}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-500">
                  <p><strong>Dicetak Oleh:</strong> {officerName}</p>
                  <p className="text-[10px] text-slate-400">Total Transaksi: {transactions.length} Mutasi</p>
                </div>
              </div>

              {/* Financial Summary Strip */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Total Debet (Masuk)</p>
                  <p className="text-sm font-extrabold text-emerald-700 tabular-nums">
                    {formatCurrency(totalIn)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Total Kredit (Keluar)</p>
                  <p className="text-sm font-extrabold text-rose-600 tabular-nums">
                    {formatCurrency(totalOut)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Saldo Kas Bersih</p>
                  <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(netFlow)}{' '}
                    <span className="text-[10px] font-bold text-emerald-700">
                      ({netFlow >= 0 ? 'Surplus' : 'Defisit'})
                    </span>
                  </p>
                </div>
              </div>

              {/* Formal Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden my-3">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="text-[10px] uppercase bg-slate-100/90 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 w-8 text-center font-bold">No</th>
                      <th className="px-3 py-2 w-28 text-center font-bold">Waktu</th>
                      <th className="px-3 py-2 w-16 text-center font-bold">Jenis</th>
                      <th className="px-3 py-2 font-bold">Uraian / Keterangan Transaksi</th>
                      <th className="px-3 py-2 text-right font-bold w-24">Debet (Rp)</th>
                      <th className="px-3 py-2 text-right font-bold w-24">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                          Tidak ada catatan mutasi pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      transactions.slice(0, 50).map((trx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-center text-[10px] font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 text-center text-[10px] font-mono text-slate-500 whitespace-nowrap">
                            {new Date(trx.date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-[10px]">
                            {trx.type === 'SPP_PAYMENT'
                              ? 'SPP'
                              : trx.type === 'INFAQ'
                              ? 'Infaq'
                              : trx.type === 'EXPENSE'
                              ? 'Beban'
                              : trx.type === 'TOP_UP'
                              ? 'Top Up'
                              : trx.type}
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-900 block truncate max-w-sm">
                              {trx.description}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Ref: {trx.reference_id ? trx.reference_id.slice(-8) : '-'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-emerald-700 tabular-nums">
                            {trx.is_debit ? formatCurrency(trx.amount) : '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-rose-600 tabular-nums">
                            {!trx.is_debit ? formatCurrency(trx.amount) : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                    {transactions.length > 50 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-2 text-center text-[11px] text-slate-500 bg-slate-50 font-medium">
                          ... dan {transactions.length - 50} mutasi lainnya (seluruh data akan dicetak lengkap pada dokumen PDF).
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100/90 font-bold border-t border-slate-300 text-xs">
                    <tr>
                      <td colSpan={4} className="px-3 py-2.5 text-right font-extrabold uppercase">
                        Total Mutasi:
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-800 tabular-nums">
                        {formatCurrency(totalIn)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-rose-800 tabular-nums">
                        {formatCurrency(totalOut)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Terbilang */}
              <div className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-600 my-3">
                <strong>Terbilang Saldo:</strong>{' '}
                <em>{numberToWordsIndonesian(Math.abs(netFlow))} Rupiah {netFlow < 0 ? '(Defisit)' : ''}</em>
              </div>

              {/* Signature Section Preview */}
              <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 text-xs text-center">
                <div className="w-48 space-y-1">
                  <p className="text-slate-500">Dibuat oleh,</p>
                  <p className="font-semibold text-slate-700 text-[11px]">Bendahara Keuangan</p>
                  <div className="h-12" />
                  <p className="font-bold text-slate-900 border-b border-slate-800 pb-0.5">{officerName}</p>
                  <p className="text-[10px] text-slate-400">Pengurus Keuangan</p>
                </div>

                <div className="w-56 space-y-1">
                  <p className="text-slate-500">
                    Jawa Barat,{' '}
                    {new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="font-semibold text-slate-700 text-[11px]">Mengetahui & Mengesahkan,</p>
                  <div className="h-12" />
                  <p className="font-bold text-slate-900 border-b border-slate-800 pb-0.5">
                    K.H. Ahmad Dahlan, Lc., M.A.
                  </p>
                  <p className="text-[10px] text-slate-400">Mudir / Pimpinan Pesantren</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
