'use client';

import { useGetAcademicYears } from '../api/useGetAcademicYears';
import { AcademicYearTable } from './AcademicYearTable';
import { CreateAcademicYearModal } from './CreateAcademicYearModal';
import { CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';

export function AcademicYearView() {
  const { data, isLoading, isError, refetch } = useGetAcademicYears();

  const totalYears = data?.length || 0;
  const activeYear = data?.find((y) => y.is_active);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Tahun Ajaran
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola periode tahun ajaran aktif untuk penetapan tagihan SPP dan administrasi.
          </p>
        </div>
        <CreateAcademicYearModal />
      </div>

      {/* Metric Summary Strip to prevent empty voids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Periode Terdaftar"
          value={`${totalYears} Tahun`}
          icon={<CalendarDays className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Arsip"
        />
        <MetricCard
          title="Tahun Ajaran Aktif Saat Ini"
          value={activeYear ? activeYear.name : 'Belum Ditentukan'}
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoading}
          variant="blue"
          badge="Berjalan"
          valueClassName="text-xl sm:text-2xl text-blue-700"
        />
        <MetricCard
          title="Status Tagihan Sistem"
          value={activeYear ? 'Siap Generate' : 'Tahun Ajaran Nonaktif'}
          icon={<AlertCircle className="h-4 w-4" />}
          isLoading={isLoading}
          variant="amber"
          badge="SPP Ready"
          valueClassName="text-lg sm:text-xl text-slate-800"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Tahun Ajaran</h3>
            <p className="text-xs text-slate-400">Pilih tahun ajaran yang sedang aktif untuk operasional santri</p>
          </div>
        </div>

        <AcademicYearTable data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
      </div>
    </div>
  );
}
