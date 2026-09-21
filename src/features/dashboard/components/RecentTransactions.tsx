'use client';

import Link from 'next/link';
import { useGetLedger } from '@/features/finance/api/useGetLedger';
import { ArrowDownLeft, ArrowUpRight, Coins, History, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';

export function RecentTransactions() {
  const { data, isLoading, isError, refetch } = useGetLedger({ per_page: 5 });

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionMeta = (type: string) => {
    switch (type) {
      case 'SPP_PAYMENT':
        return {
          icon: <Coins className="h-4 w-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
          label: 'SPP',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'TOP_UP':
        return {
          icon: <ArrowDownLeft className="h-4 w-4 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-100',
          label: 'Top Up',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'INFAQ':
        return {
          icon: <ArrowUpRight className="h-4 w-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-100',
          label: 'Infaq',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      default:
        return {
          icon: <Coins className="h-4 w-4 text-slate-600" />,
          bg: 'bg-slate-50 border-slate-100',
          label: 'Mutasi',
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  if (isError) {
    return (
      <ErrorState 
        title="Gagal Memuat Transaksi" 
        message="Tidak dapat mengambil riwayat transaksi terbaru."
        onRetry={() => refetch()}
        className="p-4"
      />
    );
  }

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-600" />
            Aktivitas Terkini
          </h3>
          <p className="text-xs text-slate-400">5 mutasi buku besar terbaru</p>
        </div>
        <Link
          href="/finance/ledger"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>Semua</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-2.5 flex-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2.5 rounded-xl border border-slate-100">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : !data?.data || data.data.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada transaksi tercatat.
          </div>
        ) : (
          data.data.slice(0, 5).map((trx: any, index: number) => {
            const meta = getTransactionMeta(trx.type);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100/90 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {trx.description || meta.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(trx.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 shrink-0 tabular-nums">
                  {formatCurrency(trx.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
