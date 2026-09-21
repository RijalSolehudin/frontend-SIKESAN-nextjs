'use client';

import { LedgerTable } from './LedgerTable';
import { Button } from '@/components/ui/button';
import { Download, BookOpenText, ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';
import { useGetLedger } from '../api/useGetLedger';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { toast } from 'sonner';

export function LedgerView() {
  const { data, isLoading } = useGetLedger({ per_page: 100 });

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

  const handleExport = () => {
    toast.info('Menyiapkan berkas Buku Besar (Ledger)...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpenText className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Buku Besar (Ledger Kas)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit trail riwayat seluruh mutasi keuangan masuk (debet) dan keluar (kredit) secara terperinci.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="shadow-2xs">
          <Download className="w-4 h-4 mr-2 text-slate-600" />
          Cetak / Ekspor PDF
        </Button>
      </div>

      {/* Metric Summary Strip to prevent empty screen voids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Aliran Masuk (Debet)"
          value={formatCurrency(totalIn)}
          icon={<ArrowDownRight className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Pemasukan"
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Total Aliran Keluar (Kredit)"
          value={formatCurrency(totalOut)}
          icon={<ArrowUpRight className="h-4 w-4" />}
          isLoading={isLoading}
          variant="rose"
          badge="Pengeluaran"
          valueClassName="text-rose-600 text-2xl font-extrabold"
        />
        <MetricCard
          title="Net Saldo Aliran Kas"
          value={formatCurrency(netFlow)}
          icon={<Scale className="h-4 w-4" />}
          isLoading={isLoading}
          variant={netFlow >= 0 ? 'blue' : 'rose'}
          badge="Surplus/Defisit"
          valueClassName="text-slate-800 text-2xl font-extrabold"
        />
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Jurnal Mutasi Finansial</h3>
            <p className="text-xs text-slate-400">Pencatatan berurutan waktu dengan nomor referensi unik</p>
          </div>
        </div>

        <LedgerTable />
      </div>
    </div>
  );
}
