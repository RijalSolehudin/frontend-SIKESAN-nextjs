'use client';

import { RecordInfaqModal } from './RecordInfaqModal';
import { useGetLedger } from '../api/useGetLedger';
import { useGetTreasurerMetrics } from '@/features/dashboard/api/useGetTreasurerMetrics';
import { HeartHandshake, ArrowUpRight, CheckCircle2, History } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

export function InfaqView() {
  const { data: metrics, isLoading: isLoadingMetrics } = useGetTreasurerMetrics();
  const { data: ledgerData, isLoading: isLoadingLedger, isError, refetch } = useGetLedger({ per_page: 50 });

  const infaqTransactions = ledgerData?.data.filter((trx: any) => trx.type === 'INFAQ') || [];

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
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Penerimaan Infaq & Shadaqah
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan dana kebajikan, wakaf sarana, dan infaq operasional dari donatur maupun wali santri.
          </p>
        </div>
        <RecordInfaqModal />
      </div>

      {/* Metric Summary Strip to prevent empty screen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Infaq Terkumpul"
          value={formatCurrency(metrics?.total_infaq_overall)}
          icon={<HeartHandshake className="h-4 w-4" />}
          isLoading={isLoadingMetrics}
          variant="blue"
          badge="Akumulasi Kas"
          valueClassName="text-blue-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Pencatatan Masuk"
          value={`${infaqTransactions.length} Donasi`}
          icon={<ArrowUpRight className="h-4 w-4" />}
          isLoading={isLoadingLedger}
          variant="emerald"
          badge="Tercatat Buku Besar"
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Penyaluran Program"
          value="Sosial & Sarpras"
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoadingMetrics}
          variant="amber"
          badge="Transparan"
          valueClassName="text-slate-800 text-xl font-bold"
        />
      </div>

      {/* Transaction Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-600" />
              Riwayat Penerimaan Infaq Terakhir
            </h3>
            <p className="text-xs text-slate-400">Mutasi dana infaq yang telah diverifikasi ke dalam kas pondok</p>
          </div>
        </div>

        {isError ? (
          <ErrorState
            title="Gagal Memuat Riwayat Infaq"
            message="Tidak dapat mengambil daftar mutasi infaq dari server."
            onRetry={() => refetch()}
          />
        ) : isLoadingLedger ? (
          <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <span>Memuat data infaq...</span>
          </div>
        ) : infaqTransactions.length === 0 ? (
          <EmptyState
            icon={<HeartHandshake className="h-7 w-7 text-emerald-600" />}
            title="Belum Ada Riwayat Infaq"
            description="Belum ada penerimaan infaq yang tercatat pada buku besar. Klik tombol Catat Infaq untuk menambahkan donasi baru."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Tanggal</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Keterangan / Donatur</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Kategori</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-right">Nominal Donasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {infaqTransactions.map((trx: any, index: number) => (
                  <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
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
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80">
                        Infaq / Sedekah
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-emerald-700 tabular-nums">
                      {formatCurrency(trx.amount)}
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
