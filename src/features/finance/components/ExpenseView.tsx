'use client';

import { RecordExpenseModal } from './RecordExpenseModal';
import { useGetLedger } from '../api/useGetLedger';
import { ArrowUpFromLine, Receipt, AlertCircle, History } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

export function ExpenseView() {
  const { data: ledgerData, isLoading, isError, refetch } = useGetLedger({ per_page: 50 });

  const expenseTransactions = ledgerData?.data.filter((trx: any) => trx.type === 'EXPENSE' || trx.description?.toLowerCase().includes('pengeluaran')) || [];
  const totalExpense = expenseTransactions.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpFromLine className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Pengeluaran Operasional
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Catat dan pantau seluruh beban belanja operasional, gaji, sarana, dan logistik pondok.
          </p>
        </div>
        <RecordExpenseModal />
      </div>

      {/* Metric Summary Strip to eliminate empty voids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Beban Kas Terhitung"
          value={formatCurrency(totalExpense)}
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          isLoading={isLoading}
          variant="rose"
          badge="Beban Kas"
          valueClassName="text-rose-600 text-2xl font-extrabold"
        />
        <MetricCard
          title="Transaksi Pengeluaran"
          value={`${expenseTransactions.length} Transaksi`}
          icon={<Receipt className="h-4 w-4" />}
          isLoading={isLoading}
          variant="blue"
          badge="Audit Bukti"
          valueClassName="text-blue-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Status Anggaran"
          value="Terkontrol"
          icon={<AlertCircle className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Sesuai RAPB"
          valueClassName="text-slate-800 text-xl font-bold"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <History className="h-4 w-4 text-rose-600" />
              Riwayat Pengeluaran Operasional
            </h3>
            <p className="text-xs text-slate-400">Daftar biaya operasional yang telah dicatat ke dalam buku besar</p>
          </div>
        </div>

        {isError ? (
          <ErrorState
            title="Gagal Memuat Riwayat Pengeluaran"
            message="Tidak dapat mengambil daftar mutasi pengeluaran dari server."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
            <span>Memuat data pengeluaran...</span>
          </div>
        ) : expenseTransactions.length === 0 ? (
          <EmptyState
            icon={<ArrowUpFromLine className="h-7 w-7 text-rose-600" />}
            title="Belum Ada Pengeluaran Tercatat"
            description="Belum ada transaksi pengeluaran pada periode ini. Klik tombol Catat Pengeluaran untuk menambahkan."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Tanggal</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Keterangan Pengeluaran</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Tipe Akun</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-right">Nominal Beban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseTransactions.map((trx: any, index: number) => (
                  <tr key={index} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(trx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {trx.description}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80">
                        Beban Operasional
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-rose-600 tabular-nums">
                      - {formatCurrency(trx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
