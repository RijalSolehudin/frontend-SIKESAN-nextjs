'use client';

import { useState, useMemo } from 'react';
import {
  useGetSppConfigurations,
  useDeleteSppConfiguration,
} from '../api/useSppConfigurations';
import { useGetAcademicYears } from '@/features/master-data/api/useGetAcademicYears';
import { SppConfiguration } from '../types';
import { CreateSppStudentDiscountModal } from './CreateSppStudentDiscountModal';
import { CreateSppStandardPricingModal } from './CreateSppStandardPricingModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Search,
  School,
  HeartHandshake,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';

export function SppPricingTab() {
  const [studentSearch, setStudentSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState<SppConfiguration | null>(null);

  const { data: academicYears = [] } = useGetAcademicYears();
  const activeAcademicYear = academicYears.find((ay) => ay.is_active) || academicYears[0];

  const { data: allConfigs = [], isLoading } = useGetSppConfigurations();
  const deleteMutation = useDeleteSppConfiguration();

  // Separate standard cohort/level configurations from student specific discounts
  const standardConfigs = useMemo(() => {
    return allConfigs
      .filter((c) => !c.student_id)
      .sort((a, b) => (b.entry_year || 0) - (a.entry_year || 0));
  }, [allConfigs]);

  const filteredStandardConfigs = useMemo(() => {
    if (filterLevel === 'all') return standardConfigs;
    return standardConfigs.filter((c) => c.education_level === filterLevel);
  }, [standardConfigs, filterLevel]);

  const studentDiscounts = useMemo(() => {
    return allConfigs.filter((c) => !!c.student_id);
  }, [allConfigs]);

  // Filtered student discounts
  const filteredDiscounts = useMemo(() => {
    if (!studentSearch.trim()) return studentDiscounts;
    const q = studentSearch.toLowerCase();
    return studentDiscounts.filter(
      (c) =>
        c.student?.name.toLowerCase().includes(q) ||
        c.student?.nis.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
    );
  }, [studentDiscounts, studentSearch]);

  const handleDeleteConfirm = () => {
    if (!deletingConfig) return;
    deleteMutation.mutate(deletingConfig.id, {
      onSuccess: () => {
        toast.success('Konfigurasi tarif SPP berhasil dihapus');
        setDeletingConfig(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal menghapus konfigurasi');
        setDeletingConfig(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Context Info & Quick Actions */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
              Sistem Tarif SPP Berbasis Jenjang Pendidikan & Angkatan
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Tarif SPP santri berlaku tetap sejak tahun pertama masuk selama masa pendidikannya berdasarkan jenjang pendidikan (SD, SMP, SMA). Kenaikan tarif untuk angkatan baru tidak mempengaruhi angkatan sebelumnya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCohortModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 shadow-2xs"
          >
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
            <span>Atur Tarif SPP</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDiscountModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Keringanan Santri</span>
          </Button>
        </div>
      </div>

      {/* Grid: 2 Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Standard Tariff per Level & Cohort */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5 border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Tarif Standar Jenjang</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {standardConfigs.length} Tarif
              </span>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'SD', 'SMP', 'SMA'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filterLevel === lvl
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {lvl === 'all' ? 'Semua' : lvl}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Memuat konfigurasi...</div>
            ) : filteredStandardConfigs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <p>Belum ada tarif yang diatur.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCohortModalOpen(true)}
                  className="text-xs"
                >
                  Tetapkan Tarif Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredStandardConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-emerald-50/20 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {config.education_level || 'Semua Jenjang'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200/60">
                          {config.entry_year ? `Angkatan ${config.entry_year}` : 'Semua Angkatan'}
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-slate-800 tabular-nums">
                        Rp {config.amount.toLocaleString('id-ID')}
                        <span className="text-[11px] text-slate-400 font-normal ml-1">/ bulan</span>
                      </div>
                      {config.notes && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[220px]" title={config.notes}>
                          {config.notes}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingConfig(config)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                      title="Hapus konfigurasi ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Custom Student Discounts & Exceptions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-5 border shadow-sm space-y-4">
            {/* Header & Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Keringanan Khusus Santri</h2>
                  <p className="text-[11px] text-slate-500">
                    Dispensasi atau beasiswa khusus per santri persetujuan manajemen pondok.
                  </p>
                </div>
              </div>

              {/* Search Bar for Discounts */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari santri, NIS, catatan..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-xl bg-white/80"
                />
              </div>
            </div>

            {/* Table of Discounts */}
            <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white/70">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3">Santri</th>
                    <th className="px-4 py-3">Kelas / Jenjang</th>
                    <th className="px-4 py-3">Catatan / Alasan</th>
                    <th className="px-4 py-3 text-right">Tarif Khusus</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDiscounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        {studentSearch ? 'Tidak ada santri yang sesuai pencarian.' : 'Belum ada keringanan khusus santri.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDiscounts.map((config) => (
                      <tr key={config.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{config.student?.name || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIS: {config.student?.nis || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {config.student?.classroom?.name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={config.notes || ''}>
                          {config.notes || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                          Rp {config.amount.toLocaleString('id-ID')}
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">/ bln</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingConfig(config)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus keringanan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateSppStandardPricingModal
        open={isCohortModalOpen}
        onOpenChange={setIsCohortModalOpen}
        defaultEntryYear={activeAcademicYear ? parseInt(activeAcademicYear.name.split('/')[0]) : new Date().getFullYear()}
      />

      <CreateSppStudentDiscountModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        academicYears={academicYears}
        defaultAcademicYearId={activeAcademicYear?.id}
      />

      <ConfirmModal
        isOpen={!!deletingConfig}
        onClose={() => setDeletingConfig(null)}
        title="Hapus Konfigurasi Tarif SPP"
        description={
          deletingConfig?.student_id
            ? `Hapus tarif khusus santri ${deletingConfig.student?.name}? Santri akan kembali ditagih sesuai tarif standar angkatannya.`
            : `Hapus tarif standar ${deletingConfig?.education_level || ''} Angkatan ${deletingConfig?.entry_year}?`
        }
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
