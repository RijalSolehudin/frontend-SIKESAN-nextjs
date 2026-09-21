'use client';

import { useGetDormitories } from '../api/useGetDormitories';
import { DormitoryTable } from './DormitoryTable';
import { CreateDormitoryModal } from './CreateDormitoryModal';
import { Building2, Home, Bed } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';

export function DormitoryView() {
  const { data, isLoading, isError, refetch } = useGetDormitories();

  const totalDorms = data?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Master Data Asrama
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola daftar gedung asrama / kobong santri mukim putra dan putri.
          </p>
        </div>
        <CreateDormitoryModal />
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Gedung Asrama"
          value={`${totalDorms} Asrama`}
          icon={<Building2 className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Terdata"
        />
        <MetricCard
          title="Penempatan Santri"
          value="Aktif Mukim"
          icon={<Home className="h-4 w-4" />}
          isLoading={isLoading}
          variant="blue"
          badge="Kapasitas"
          valueClassName="text-xl sm:text-2xl text-blue-700"
        />
        <MetricCard
          title="Status Fasilitas"
          value="Siap Huni"
          icon={<Bed className="h-4 w-4" />}
          isLoading={isLoading}
          variant="amber"
          badge="Tersedia"
          valueClassName="text-xl sm:text-2xl text-slate-800"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Asrama Santri</h3>
            <p className="text-xs text-slate-400">Data gedung asrama dan tanggal pendataan di sistem</p>
          </div>
        </div>

        <DormitoryTable data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
      </div>
    </div>
  );
}
