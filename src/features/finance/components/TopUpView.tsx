'use client';

import { useState } from 'react';
import { useGetTopUps } from '../api/useGetTopUps';
import { TopUpTable } from './TopUpTable';
import { CreateTopUpModal } from './CreateTopUpModal';
import { ArrowDownToLine, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { DateRangeFilter, DateFilterValue } from '@/components/ui/date-range-filter';

export function TopUpView() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: 'all' });

  const { data, isLoading, isError, refetch } = useGetTopUps({
    page,
    per_page: perPage,
    start_date: dateFilter.startDate,
    end_date: dateFilter.endDate,
  });

  const topUps = data?.data || [];
  const pendingCount = topUps.filter((t) => t.status === 'PENDING').length;
  const approvedTotal = topUps
    .filter((t) => t.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.requested_amount, 0);

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
              <ArrowDownToLine className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Persetujuan Top Up Dompet
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Verifikasi dan setujui permintaan pengisian saldo dompet digital santri.
          </p>
        </div>
        <CreateTopUpModal />
      </div>

      {/* Metric Summary Strip to prevent empty voids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Menunggu Verifikasi"
          value={`${pendingCount} Permintaan`}
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoading}
          variant="amber"
          badge="Perlu Approval"
          valueClassName="text-amber-600 text-2xl font-extrabold"
        />
        <MetricCard
          title="Total Top Up Disetujui"
          value={formatCurrency(approvedTotal)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Berhasil"
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Total Transaksi"
          value={`${data?.total || topUps.length} Permintaan`}
          icon={<ArrowDownToLine className="h-4 w-4" />}
          isLoading={isLoading}
          variant="blue"
          badge="Seluruh Status"
          valueClassName="text-slate-800 text-2xl font-extrabold"
        />
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Permintaan Top Up</h3>
            <p className="text-xs text-slate-400">Daftar transfer dan setoran tunai yang membutuhkan persetujuan bendahara</p>
          </div>

          <DateRangeFilter 
            value={dateFilter}
            onChange={(newVal) => {
              setDateFilter(newVal);
              setPage(1);
            }}
          />
        </div>

        <TopUpTable 
          data={topUps} 
          isLoading={isLoading} 
          isError={isError} 
          onRetry={() => refetch()} 
          pagination={data ? {
            currentPage: data.current_page || page,
            totalPages: data.last_page || 1,
            totalItems: data.total || 0,
            pageSize: data.per_page || perPage,
            onPageChange: (newPage) => setPage(newPage),
            onPageSizeChange: (newSize) => {
              setPerPage(newSize);
              setPage(1);
            },
          } : undefined}
        />
      </div>
    </div>
  );
}
