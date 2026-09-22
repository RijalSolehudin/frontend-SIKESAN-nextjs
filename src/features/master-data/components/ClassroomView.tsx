'use client';

import { useGetClasses } from '../api/useGetClasses';
import { ClassroomTable } from './ClassroomTable';
import { CreateClassroomModal } from './CreateClassroomModal';
import { School, BookOpen, Users } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';

export function ClassroomView() {
  const { data, isLoading, isError, refetch } = useGetClasses();

  const totalClasses = data?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <School className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Master Data Kelas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola tingkatan dan kelas santri untuk pembagian kelompok belajar dan SPP.
          </p>
        </div>
        <CreateClassroomModal />
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Kelas Terdaftar"
          value={`${totalClasses} kelas`}
          icon={<School className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Aktif"
        />
        <MetricCard
          title="Rata-rata Distribusi"
          value="Tercatat"
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
          variant="blue"
          badge="Ruang Belajar Santri"
          valueClassName="text-xl sm:text-2xl text-blue-700"
        />
        <MetricCard
          title="Sinkronisasi Akademik"
          value="Tersinkron"
          icon={<BookOpen className="h-4 w-4" />}
          isLoading={isLoading}
          variant="amber"
          badge="Real-time"
          valueClassName="text-xl sm:text-2xl text-slate-800"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Kelas Santri</h3>
            <p className="text-xs text-slate-400">Daftar seluruh kelompok kelas dan waktu pembuatan</p>
          </div>
        </div>

        <ClassroomTable data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
      </div>
    </div>
  );
}
