'use client';

import { useState, useMemo } from 'react';
import {
  useGetAnnualFeeConfigurations,
  useCreateAnnualFeeConfiguration,
  useUpdateAnnualFeeConfiguration,
  useDeleteAnnualFeeConfiguration,
  CreateAnnualFeeConfigPayload,
} from '../api/useAnnualFeeConfigurations';
import { useGetStudents } from '@/features/master-data/api/useGetStudents';
import { AnnualFeeConfiguration, BreakdownItem } from '../types/annual-fees';
import { AnnualFeeBreakdownModal } from './AnnualFeeBreakdownModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  School,
  Search,
  HeartHandshake,
  CalendarDays,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export function AnnualFeePricingTab() {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Modal State for Configure/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'standard' | 'student'>('standard');
  const [editingConfig, setEditingConfig] = useState<AnnualFeeConfiguration | null>(null);

  // Breakdown Preview Modal State
  const [breakdownPreview, setBreakdownPreview] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    items?: BreakdownItem[] | null;
    totalAmount: number;
  }>({
    isOpen: false,
    title: '',
    totalAmount: 0,
  });

  // Form State
  const [educationLevel, setEducationLevel] = useState<'SD' | 'SMP' | 'SMA'>('SMP');
  const [studentType, setStudentType] = useState<'NEW' | 'RETURNING'>('NEW');
  const [entryYear, setEntryYear] = useState<number>(new Date().getFullYear());
  const [studentId, setStudentId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>([
    { name: 'Uang Gedung', amount: 5000000 },
    { name: 'Uang Seragam', amount: 1500000 },
    { name: 'Uang Buku', amount: 1000000 },
  ]);
  const [customTotalAmount, setCustomTotalAmount] = useState<number>(0);

  const { data: configs, isLoading } = useGetAnnualFeeConfigurations();
  const { data: studentsData } = useGetStudents({ per_page: 200 });

  const createMutation = useCreateAnnualFeeConfiguration();
  const updateMutation = useUpdateAnnualFeeConfiguration();
  const deleteMutation = useDeleteAnnualFeeConfiguration();

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const calculatedTotal = breakdownItems.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  // Split standard vs student discount configs
  const standardConfigs = useMemo(() => {
    return (configs || []).filter((c) => !c.student_id);
  }, [configs]);

  const studentDiscounts = useMemo(() => {
    return (configs || []).filter((c) => !!c.student_id);
  }, [configs]);

  const filteredStandardConfigs = useMemo(() => {
    if (filterLevel === 'all') return standardConfigs;
    return standardConfigs.filter((c) => c.education_level === filterLevel);
  }, [standardConfigs, filterLevel]);

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

  const handleAddBreakdownRow = () => {
    setBreakdownItems([...breakdownItems, { name: '', amount: 0 }]);
  };

  const handleRemoveBreakdownRow = (index: number) => {
    setBreakdownItems(breakdownItems.filter((_, i) => i !== index));
  };

  const handleBreakdownChange = (index: number, field: 'name' | 'amount', value: any) => {
    const updated = [...breakdownItems];
    if (field === 'amount') {
      updated[index].amount = Number(value) || 0;
    } else {
      updated[index].name = value;
    }
    setBreakdownItems(updated);
  };

  const handleOpenAddStandard = () => {
    setEditingConfig(null);
    setModalMode('standard');
    setEducationLevel('SMP');
    setStudentType('NEW');
    setEntryYear(new Date().getFullYear());
    setNotes('');
    setBreakdownItems([
      { name: 'Uang Gedung', amount: 5000000 },
      { name: 'Uang Seragam', amount: 1500000 },
      { name: 'Uang Buku', amount: 1000000 },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenAddDiscount = () => {
    setEditingConfig(null);
    setModalMode('student');
    setStudentId('');
    setNotes('');
    setCustomTotalAmount(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (config: AnnualFeeConfiguration) => {
    setEditingConfig(config);
    if (config.student_id) {
      setModalMode('student');
      setStudentId(String(config.student_id));
      setCustomTotalAmount(config.total_amount);
      setNotes(config.notes || '');
    } else {
      setModalMode('standard');
      setEducationLevel(config.education_level || 'SMP');
      setStudentType(config.student_type || 'NEW');
      setEntryYear(config.entry_year || new Date().getFullYear());
      setBreakdownItems(
        config.breakdown_items && config.breakdown_items.length > 0
          ? config.breakdown_items
          : [{ name: 'Biaya Tahunan Standar', amount: config.total_amount }]
      );
      setNotes(config.notes || '');
    }
    setIsModalOpen(true);
  };

  const handleViewBreakdown = (config: AnnualFeeConfiguration) => {
    setBreakdownPreview({
      isOpen: true,
      title: `Rincian Biaya - Jenjang ${config.education_level || 'Umum'}`,
      subtitle: `${
        config.student_type === 'NEW' ? 'Santri Baru (Tahun Pertama)' : 'Santri Lama (Lanjutan)'
      } • Angkatan ${config.entry_year || 'Semua'}`,
      items: config.breakdown_items,
      totalAmount: config.total_amount,
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konfigurasi tarif ini?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Konfigurasi tarif berhasil dihapus'),
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menghapus'),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isStudentConfig = modalMode === 'student';
    const finalTotal = isStudentConfig ? customTotalAmount : calculatedTotal;

    if (finalTotal <= 0) {
      toast.error('Total nominal tarif harus lebih besar dari 0');
      return;
    }

    if (isStudentConfig && !studentId && !editingConfig?.student_id) {
      toast.error('Pilih santri untuk konfigurasi tarif khusus');
      return;
    }

    const payload: CreateAnnualFeeConfigPayload = {
      education_level: isStudentConfig ? undefined : educationLevel,
      student_type: isStudentConfig ? undefined : studentType,
      entry_year: isStudentConfig ? undefined : entryYear,
      student_id: isStudentConfig ? Number(studentId || editingConfig?.student_id) : undefined,
      total_amount: finalTotal,
      breakdown_items: isStudentConfig
        ? undefined
        : breakdownItems.filter((i) => i.name.trim() !== ''),
      notes: notes || undefined,
    };

    if (editingConfig) {
      updateMutation.mutate(
        { id: editingConfig.id, payload },
        {
          onSuccess: () => {
            toast.success('Konfigurasi tarif berhasil diperbarui');
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Gagal menyimpan');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Konfigurasi tarif berhasil ditambahkan');
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal menyimpan');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Context Info & Quick Actions (matching SppPricingTab) */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
              Sistem Tarif Biaya Tahunan & Uang Pangkal
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Tarif uang pangkal santri baru dan biaya daftar ulang tahunan santri lama berdasarkan jenjang pendidikan dan angkatan masuk. Keringanan khusus santri dapat diatur terpisah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAddStandard}
            className="rounded-xl text-xs gap-1.5 shadow-2xs"
          >
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
            <span>Atur Tarif Jenjang</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddDiscount}
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
                <p>Belum ada konfigurasi tarif jenjang.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddStandard}
                  className="text-xs"
                >
                  Atur Tarif Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStandardConfigs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-emerald-50/20 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cfg.education_level || 'Semua'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cfg.student_type === 'NEW'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {cfg.student_type === 'NEW'
                            ? 'Santri Baru (Th. 1)'
                            : 'Santri Lama (Lanjutan)'}
                        </span>
                        {cfg.entry_year && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100">
                            Th. {cfg.entry_year}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(cfg)}
                          className="h-7 w-7 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          title="Edit tarif ini"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(cfg.id)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Hapus tarif ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Total Tarif:</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">
                          {formatRupiah(cfg.total_amount)}
                        </span>
                      </div>

                      {/* Rincian Biaya Clickable Trigger */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBreakdown(cfg)}
                        className="h-7 px-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 gap-1.5 rounded-lg shadow-2xs"
                        title="Lihat Rincian Biaya"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Rincian Biaya</span>
                      </Button>
                    </div>
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
                    Dispensasi atau penetapan tarif khusus per santri persetujuan manajemen pondok.
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
                        {studentSearch
                          ? 'Tidak ada santri yang sesuai pencarian.'
                          : 'Belum ada keringanan khusus santri.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDiscounts.map((cfg) => (
                      <tr key={cfg.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{cfg.student?.name || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIS: {cfg.student?.nis || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {cfg.student?.classroom?.name || '-'}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-slate-600 max-w-[200px] truncate"
                          title={cfg.notes || ''}
                        >
                          {cfg.notes || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                          {formatRupiah(cfg.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenEdit(cfg)}
                              className="h-7 w-7 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              title="Edit keringanan"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(cfg.id)}
                              className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus keringanan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* Breakdown Preview Modal */}
      <AnnualFeeBreakdownModal
        isOpen={breakdownPreview.isOpen}
        onClose={() => setBreakdownPreview((prev) => ({ ...prev, isOpen: false }))}
        title={breakdownPreview.title}
        subtitle={breakdownPreview.subtitle}
        items={breakdownPreview.items}
        totalAmount={breakdownPreview.totalAmount}
      />

      {/* Create / Edit Configuration Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingConfig
                ? `Edit ${modalMode === 'standard' ? 'Tarif Jenjang' : 'Keringanan Santri'}`
                : `Tambah ${modalMode === 'standard' ? 'Tarif Standar Jenjang' : 'Keringanan Khusus Santri'}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {modalMode === 'standard' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Jenjang Pendidikan:</Label>
                    <Select
                      value={educationLevel}
                      onValueChange={(val: any) => setEducationLevel(val)}
                    >
                      <SelectTrigger className="rounded-xl h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SD">Jenjang SD</SelectItem>
                        <SelectItem value="SMP">Jenjang SMP</SelectItem>
                        <SelectItem value="SMA">Jenjang SMA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Kategori Santri:</Label>
                    <Select
                      value={studentType}
                      onValueChange={(val: any) => setStudentType(val)}
                    >
                      <SelectTrigger className="rounded-xl h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">Santri Baru (Tahun Pertama)</SelectItem>
                        <SelectItem value="RETURNING">Santri Lama (Daftar Ulang)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Angkatan (Tahun Masuk Santri):
                  </Label>
                  <Input
                    type="number"
                    value={entryYear || ''}
                    onChange={(e) => setEntryYear(Number(e.target.value))}
                    className="rounded-xl h-10 text-xs"
                    placeholder="Contoh: 2026"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Santri yang terdaftar dengan tahun masuk ini akan ditagih tarif ini.
                  </p>
                </div>

                {/* Breakdown Rows using MoneyInput */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-800">
                      Rincian Biaya (Komponen Pos):
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBreakdownRow}
                      className="h-7 px-2 text-[11px] text-emerald-700 rounded-lg gap-1 border-emerald-200"
                    >
                      <Plus className="h-3 w-3" /> Tambah Pos
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {breakdownItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder="Nama pos (mis: Uang Gedung)"
                          value={item.name}
                          onChange={(e) => handleBreakdownChange(idx, 'name', e.target.value)}
                          className="h-9 text-xs rounded-xl flex-1"
                          required
                        />
                        <div className="w-36">
                          <MoneyInput
                            placeholder="Nominal"
                            value={item.amount ? String(item.amount) : ''}
                            onChange={(val) => handleBreakdownChange(idx, 'amount', Number(val) || 0)}
                            className="h-9 text-xs rounded-xl font-mono text-right"
                            required
                          />
                        </div>
                        {breakdownItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveBreakdownRow(idx)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Calculated Total Banner */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-900">Total Tarif:</span>
                    <span className="text-sm font-extrabold text-emerald-800 font-mono">
                      {formatRupiah(calculatedTotal)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Modal Mode: Student Discount */
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Pilih Santri:</Label>
                  <Select
                    value={studentId}
                    onValueChange={setStudentId}
                    disabled={!!editingConfig?.student_id}
                  >
                    <SelectTrigger className="rounded-xl h-10 text-xs">
                      <SelectValue placeholder="Pilih santri yang menerima keringanan..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {(studentsData?.data || []).map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} ({s.nis}) - {s.classroom?.name || 'Belum ada kelas'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Total Nominal Tarif Khusus:
                  </Label>
                  <MoneyInput
                    value={customTotalAmount ? String(customTotalAmount) : ''}
                    onChange={(val) => setCustomTotalAmount(Number(val) || 0)}
                    placeholder="Contoh: 3.000.000"
                    className="rounded-xl h-10 font-mono font-bold text-base text-emerald-900"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Nominal ini menggantikan tarif standar untuk santri bersangkutan pada tahun berjalan.
                  </p>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Catatan / Kebijakan (Opsional):
              </Label>
              <Input
                placeholder="Misal: Keringanan anak yatim / beasiswa prestasi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Menyimpan...'
                  : editingConfig
                  ? 'Simpan Perubahan'
                  : 'Tambah Konfigurasi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
