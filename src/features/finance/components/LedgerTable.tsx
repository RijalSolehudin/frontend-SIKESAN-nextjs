'use client';

import { useGetLedger } from '../api/useGetLedger';
import { ArrowDownRight, ArrowUpRight, BookOpenText } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

export function LedgerTable() {
  const { data, isLoading, isError, refetch } = useGetLedger({ per_page: 50 });

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Buku Besar"
        message="Terjadi kendala saat mengambil jurnal transaksi dari server."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Memuat jurnal mutasi...</span>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={<BookOpenText className="h-7 w-7 text-emerald-600" />}
        title="Belum Ada Mutasi Buku Besar"
        description="Belum ada transaksi penerimaan atau pengeluaran yang tercatat pada sistem."
      />
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SPP_PAYMENT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">SPP</span>;
      case 'TOP_UP':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200">Top Up</span>;
      case 'INFAQ':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200">Infaq</span>;
      case 'EXPENSE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200">Beban</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200">{type}</span>;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
          <tr>
            <th scope="col" className="px-5 py-3.5 font-semibold">Waktu / Tanggal</th>
            <th scope="col" className="px-5 py-3.5 font-semibold">Klasifikasi</th>
            <th scope="col" className="px-5 py-3.5 font-semibold">Keterangan Transaksi</th>
            <th scope="col" className="px-5 py-3.5 font-semibold text-right">Debet (Masuk)</th>
            <th scope="col" className="px-5 py-3.5 font-semibold text-right">Kredit (Keluar)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.data.map((trx, index) => (
            <tr key={`${trx.reference_id}-${index}`} className="hover:bg-emerald-50/30 transition-colors">
              <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                {new Date(trx.date).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-5 py-3.5">
                {getTypeBadge(trx.type)}
              </td>
              <td className="px-5 py-3.5">
                <div className="font-bold text-slate-900 line-clamp-1">{trx.description}</div>
                <div className="text-[11px] text-slate-400 font-mono">Ref: {trx.reference_id || '-'}</div>
              </td>
              <td className="px-5 py-3.5 text-right font-extrabold tabular-nums">
                {trx.is_debit ? (
                  <span className="inline-flex items-center justify-end text-emerald-700 font-bold">
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                    {formatCurrency(trx.amount)}
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>
              <td className="px-5 py-3.5 text-right font-extrabold tabular-nums">
                {!trx.is_debit ? (
                  <span className="inline-flex items-center justify-end text-rose-600 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-rose-500" />
                    {formatCurrency(trx.amount)}
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.last_page > 1 && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <p className="text-xs text-slate-400">
            Menampilkan {data.data.length} transaksi terakhir
          </p>
        </div>
      )}
    </div>
  );
}
