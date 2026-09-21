'use client';

import { useState, useMemo } from 'react';
import {
  useGetSppConfigurations,
  useDeleteSppConfiguration,
} from '../api/useSppConfigurations';
import { useGetAcademicYears } from '@/features/master-data/api/useGetAcademicYears';
import { useGetClasses } from '@/features/master-data/api/useGetClasses';
import { SppConfiguration } from '../types';
import { CreateSppStudentDiscountModal } from './CreateSppStudentDiscountModal';
import { CreateSppStandardPricingModal } from './CreateSppStandardPricingModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Sliders,
  Plus,
  Trash2,
  Search,
  User,
  HeartHandshake,
  Layers,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SppPricingTab() {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState<SppConfiguration | null>(null);

  const { data: academicYears = [] } = useGetAcademicYears();
  const { data: classes = [] } = useGetClasses();

  const activeAcademicYear = academicYears.find((ay) => ay.is_active) || academicYears[0];

  const {
    data: allConfigs = [],
    isLoading,
  } = useGetSppConfigurations(
    selectedAcademicYearId !== 'all'
      ? { academic_year_id: parseInt(selectedAcademicYearId) }
      : undefined
  );

  const deleteMutation = useDeleteSppConfiguration();

  // Separate standard/class configurations from student specific discounts
  const standardConfigs = useMemo(() => {
    return allConfigs.filter((c) => !c.student_id);
  }, [allConfigs]);

  const studentDiscounts = useMemo(() => {
    return allConfigs.filter((c) => !!c.student_id);
  }, [allConfigs]);

  // Find general default price for active academic year
  const defaultYearConfig = useMemo(() => {
    if (activeAcademicYear) {
      return standardConfigs.find(
        (c) => c.academic_year_id === activeAcademicYear.id && !c.class_id
      );
    }
    return standardConfigs.find((c) => !c.class_id);
  }, [standardConfigs, activeAcademicYear]);

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
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Tahun Ajaran Aktif: {activeAcademicYear?.name || 'Belum Ditentukan'}
            </span>
            <span className="text-xs text-slate-500">
              • Tarif SPP Dasar:{' '}
              <strong className="text-slate-800">
                {defaultYearConfig
                  ? `Rp ${defaultYearConfig.amount.toLocaleString('id-ID')} / bulan`
                  : 'Belum Diatur'}
              </strong>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Sistem secara cerdas memprioritaskan: <strong>Keringanan Santri</strong> &gt;{' '}
            <strong>Tarif Kelas</strong> &gt; <strong>Tarif Dasar Tahun Ajaran</strong> saat penerbitan tagihan bulanan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-44">
            <Select
              value={selectedAcademicYearId}
              onValueChange={setSelectedAcademicYearId}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs bg-white">
                <SelectValue placeholder="Pilih Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                {academicYears.map((ay) => (
                  <SelectItem key={ay.id} value={ay.id.toString()}>
                    {ay.name} {ay.is_active ? '(Aktif)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStandardModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 shadow-2xs"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-600" />
            <span>Atur Tarif Standar / Kelas</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDiscountModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Keringanan Santri</span>
          </Button>
        </div>
      </div>

      {/* Grid: 2 Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Standard / Class Pricing List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5 border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Tarif Standar & Kelas</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {standardConfigs.length} Konfigurasi
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Memuat konfigurasi...</div>
            ) : standardConfigs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <p>Belum ada tarif standar yang diatur.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStandardModalOpen(true)}
                  className="text-xs"
                >
                  Tetapkan Tarif Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {standardConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-emerald-50/20 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            config.classroom
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {config.classroom ? `Kelas ${config.classroom.name}` : 'Semua Kelas (Umum)'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {config.academicYear?.name}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-800 tabular-nums">
                        Rp {config.amount.toLocaleString('id-ID')}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">/ bulan</span>
                      </div>
                      {config.notes && (
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{config.notes}</p>
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
                  <h2 className="text-sm font-bold text-slate-900">Tarif Khusus & Keringanan Santri</h2>
                  <p className="text-[11px] text-slate-500">
                    Pengecualian tarif bagi santri kurang mampu, yatim, atau beasiswa persetujuan manajemen.
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
                      <th scope="col" className="px-4 py-3 font-semibold">Kelas</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Tarif Khusus</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Alasan / Persetujuan</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                          Memuat data keringanan santri...
                        </td>
                      </tr>
                    ) : filteredDiscounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
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
                          <td className="px-4 py-3 text-xs text-slate-600 max-w-[220px]">
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
        open={isStandardModalOpen}
        onOpenChange={setIsStandardModalOpen}
        academicYears={academicYears}
        classes={classes}
        defaultAcademicYearId={activeAcademicYear?.id}
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
            ? `Apakah Anda yakin ingin menghapus keringanan tarif untuk santri "${deletingConfig.student?.name}"? Santri ini selanjutnya akan dikenakan tarif reguler.`
            : 'Apakah Anda yakin ingin menghapus konfigurasi tarif ini?'
        }
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
