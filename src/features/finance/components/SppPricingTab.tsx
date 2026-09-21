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
  User,
  HeartHandshake,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';

export function SppPricingTab() {
  const [studentSearch, setStudentSearch] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState<SppConfiguration | null>(null);

  const { data: academicYears = [] } = useGetAcademicYears();
  const activeAcademicYear = academicYears.find((ay) => ay.is_active) || academicYears[0];

  const { data: allConfigs = [], isLoading } = useGetSppConfigurations();
  const deleteMutation = useDeleteSppConfiguration();

  // Separate cohort configurations from student specific discounts
  const cohortConfigs = useMemo(() => {
    return allConfigs
      .filter((c) => !c.student_id)
      .sort((a, b) => (b.entry_year || 0) - (a.entry_year || 0));
  }, [allConfigs]);

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
              <GraduationCap className="h-3 w-3 text-emerald-700" />
              Sistem Tarif Berbasis Angkatan (Tahun Masuk)
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Tarif SPP santri berlaku tetap sejak tahun pertama masuk selama masa pendidikannya. Kenaikan tarif untuk angkatan baru tidak mempengaruhi angkatan sebelumnya.
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
            <span>Atur Tarif Angkatan</span>
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
        {/* Left Column: Cohort (Entry Year) Pricing List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5 border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Tarif per Angkatan</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {cohortConfigs.length} Angkatan
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Memuat konfigurasi...</div>
            ) : cohortConfigs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <p>Belum ada tarif angkatan yang diatur.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCohortModalOpen(true)}
                  className="text-xs"
                >
                  Tetapkan Tarif Angkatan Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cohortConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-emerald-50/20 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {config.entry_year ? `Angkatan ${config.entry_year}` : 'Standar Umum'}
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
                  type="search"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari santri penerima keringanan..."
                  className="pl-8 h-9 text-xs rounded-xl bg-white border-slate-200"
                />
              </div>
            </div>

            {/* Table of Discounts */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Nama Santri</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Angkatan</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Kelas</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Tarif Disetujui</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Keterangan / Alasan</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                          Memuat data keringanan santri...
                        </td>
                      </tr>
                    ) : filteredDiscounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                          {studentSearch.trim()
                            ? 'Tidak ada santri penerima keringanan dengan kata kunci tersebut.'
                            : 'Belum ada santri yang didaftarkan menerima keringanan tarif SPP.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDiscounts.map((discount) => (
                        <tr key={discount.id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{discount.student?.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              NIS: {discount.student?.nis}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-[11px]">
                              {discount.student?.entry_year || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-medium text-[11px]">
                              {discount.student?.classroom?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-emerald-700 text-xs tabular-nums">
                              Rp {discount.amount.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ bulan</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px]">
                            <span className="truncate block" title={discount.notes || '-'}>
                              {discount.notes || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeletingConfig(discount)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus keringanan (kembali ke tarif normal)"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Modals */}
      <CreateSppStandardPricingModal
        open={isCohortModalOpen}
        onOpenChange={setIsCohortModalOpen}
        defaultEntryYear={new Date().getFullYear()}
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
        onConfirm={handleDeleteConfirm}
        title="Hapus Konfigurasi Tarif SPP"
        description={
          deletingConfig?.student_id
            ? `Apakah Anda yakin ingin menghapus keringanan tarif untuk santri "${deletingConfig.student?.name}"? Santri ini selanjutnya akan dikenakan tarif reguler sesuai angkatannya.`
            : `Apakah Anda yakin ingin menghapus konfigurasi tarif untuk Angkatan ${deletingConfig?.entry_year || ''}?`
        }
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
