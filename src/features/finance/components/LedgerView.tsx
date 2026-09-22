'use client';

import { useState } from 'react';
import { LedgerTable } from './LedgerTable';
import { LedgerExportModal } from './LedgerExportModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpenText,
  ArrowDownRight,
  ArrowUpRight,
  Scale,
  FileSpreadsheet,
} from 'lucide-react';
import { useGetLedger } from '../api/useGetLedger';
import { MetricCard } from '@/features/dashboard/components/MetricCard';

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

export function LedgerView() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Fetch summary data for current filter
  const { data, isLoading } = useGetLedger({
    month: selectedMonth,
    year: selectedYear,
    per_page: 200,
  });

  const transactions = data?.data || [];
  const totalIn = transactions
    .filter((t) => t.is_debit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = transactions
    .filter((t) => !t.is_debit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netFlow = totalIn - totalOut;

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const periodBadgeLabel = (() => {
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      const monthObj = MONTHS.find((m) => m.value === selectedMonth.toString());
      return `${monthObj?.label || `Bln ${selectedMonth}`} ${selectedYear}`;
    } else if (selectedMonth === 'all' && selectedYear !== 'all') {
      return `Thn ${selectedYear}`;
    } else if (selectedMonth !== 'all' && selectedYear === 'all') {
      const monthObj = MONTHS.find((m) => m.value === selectedMonth.toString());
      return `Bln ${monthObj?.label}`;
    }
    return 'Semua Waktu';
  })();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpenText className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Ledger Kas ( Seluruh Mutasi )
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit trail riwayat seluruh mutasi keuangan masuk (debet) dan keluar (kredit) secara terperinci.
          </p>
        </div>

        {/* Filter Month, Year, and Export Butn Ï*/}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Month Filter */}
          <Select
            value={selectedMonth.toString()}
            onValueChange={(val) => setSelectedMonth(val === 'all' ? 'all' : parseInt(val))}
          >
            <SelectTrigger className="h-10 w-44 bg-white border-slate-200 text-xs rounded-xl shadow-2xs font-medium">
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
            onValueChange={(val) => setSelectedYear(val === 'all' ? 'all' : parseInt(val))}
          >
            <SelectTrigger className="h-10 w-36 bg-white border-slate-200 text-xs rounded-xl shadow-2xs font-medium">
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

          <Button
            variant="outline"
            onClick={() => setExportModalOpen(true)}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold shadow-2xs gap-2 border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-400"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Cetak / Ekspor PDF</span>
          </Button>
        </div>
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Aliran Masuk (Debet)"
          value={formatCurrency(totalIn)}
          icon={<ArrowDownRight className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge={periodBadgeLabel}
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Total Aliran Keluar (Kredit)"
          value={formatCurrency(totalOut)}
          icon={<ArrowUpRight className="h-4 w-4" />}
          isLoading={isLoading}
          variant="rose"
          badge={periodBadgeLabel}
          valueClassName="text-rose-600 text-2xl font-extrabold"
        />
        <MetricCard
          title="Net Saldo Aliran Kas"
          value={formatCurrency(netFlow)}
          icon={<Scale className="h-4 w-4" />}
          isLoading={isLoading}
          variant={netFlow >= 0 ? 'blue' : 'rose'}
          badge={netFlow >= 0 ? 'Surplus' : 'Defisit'}
          valueClassName="text-slate-800 text-2xl font-extrabold"
        />
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Jurnal Mutasi Finansial</h3>
            <p className="text-xs text-slate-400">
              Pencatatan berurutan waktu periode: <strong className="text-slate-600">{periodBadgeLabel}</strong>
            </p>
          </div>
        </div>

        <LedgerTable month={selectedMonth} year={selectedYear} />
      </div>

      {/* Formal PDF Export & Paper Preview Modal */}
      <LedgerExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
    </div>
  );
}
