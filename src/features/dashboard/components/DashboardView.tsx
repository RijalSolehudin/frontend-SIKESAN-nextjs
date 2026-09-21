'use client';

import { Wallet, AlertCircle, HeartHandshake, LayoutDashboard } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useGetTreasurerMetrics } from '../api/useGetTreasurerMetrics';
import { RevenueChart } from './RevenueChart';
import { RecentTransactions } from './RecentTransactions';
import { ErrorState } from '@/components/ui/error-state';

export function DashboardView() {
  const { data: metrics, isLoading, isError, refetch } = useGetTreasurerMetrics();

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Dashboard Bendahara
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Ringkasan metrik kas pondok pesantren, saldo santri, dan piutang SPP.
          </p>
        </div>
      </div>

      {isError && (
        <ErrorState
          title="Gagal Memuat Ringkasan Keuangan"
          message="Server tidak dapat dihubungi atau sesi Anda telah berakhir. Silakan periksa koneksi atau masuk kembali."
          onRetry={() => refetch()}
        />
      )}

      {/* Top 3 KPI Metric Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Saldo Global Santri"
          value={formatCurrency(metrics?.global_wallet_balance || 0)}
          icon={<Wallet className="h-5 w-5" />}
          isLoading={isLoading}
          variant="emerald"
          valueClassName="text-emerald-700"
          badge="Dompet Santri"
        />
        <MetricCard
          title="Penerimaan SPP Tahun Ini"
          value={formatCurrency(metrics?.spp?.paid_this_year ?? metrics?.total_unpaid_spp_overall ?? 0)}
          icon={<AlertCircle className="h-5 w-5" />}
          isLoading={isLoading}
          variant="blue"
          valueClassName="text-blue-700"
          badge="Realisasi SPP"
        />
        <MetricCard
          title="Beban Operasional Tahun Ini"
          value={formatCurrency(metrics?.expenses?.this_year ?? metrics?.total_infaq_overall ?? 0)}
          icon={<HeartHandshake className="h-5 w-5" />}
          isLoading={isLoading}
          variant="rose"
          valueClassName="text-rose-600"
          badge="Pengeluaran"
        />
      </div>

      {/* Main Visuals Grid */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-7 items-stretch">
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 sm:p-6 shadow-sm border flex flex-col justify-between min-h-[380px]">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3 glass-card rounded-2xl p-5 sm:p-6 shadow-sm border flex flex-col justify-between min-h-[380px]">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
