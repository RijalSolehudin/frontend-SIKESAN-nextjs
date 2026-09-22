'use client';

import { useState } from 'react';
import {
  useGetAnnualFeeConfigurations,
  useCreateAnnualFeeConfiguration,
  useUpdateAnnualFeeConfiguration,
  useDeleteAnnualFeeConfiguration,
  CreateAnnualFeeConfigPayload,
} from '../api/useAnnualFeeConfigurations';
import { useGetStudents } from '@/features/master-data/api/useGetStudents';
import { AnnualFeeConfiguration, BreakdownItem } from '../types/annual-fees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, Edit, Sliders, UserCheck, School, Layers, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AnnualFeePricingTab() {
  const [activeSubTab, setActiveSubTab] = useState<'standard' | 'student'>('standard');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AnnualFeeConfiguration | null>(null);

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
  const { data: studentsData } = useGetStudents({ per_page: 100 });

  const createMutation = useCreateAnnualFeeConfiguration();
  const updateMutation = useUpdateAnnualFeeConfiguration();
  const deleteMutation = useDeleteAnnualFeeConfiguration();

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const calculatedTotal = breakdownItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleAddBreakdownRow = () => {
    setBreakdownItems([...breakdownItems, { name: '', amount: 0 }]);
  };

  const handleRemoveBreakdownRow = (index: number) => {
    setBreakdownItems(breakdownItems.filter((_, i) => i !== index));
  };

  const handleBreakdownChange = (index: number, field: 'name' | 'amount', value: any) => {
    const updated = [...breakdownItems];
    if (field === 'amount') {
      updated[index].amount = Number(value);
    } else {
      updated[index].name = value;
    }
    setBreakdownItems(updated);
  };

  const handleOpenAdd = () => {
    setEditingConfig(null);
    setEducationLevel('SMP');
    setStudentType(activeSubTab === 'standard' ? 'NEW' : 'NEW');
    setEntryYear(new Date().getFullYear());
    setStudentId('');
    setNotes('');
    if (activeSubTab === 'standard') {
      setBreakdownItems([
        { name: 'Uang Gedung', amount: 5000000 },
        { name: 'Uang Seragam', amount: 1500000 },
        { name: 'Uang Buku', amount: 1000000 },
      ]);
    } else {
      setBreakdownItems([]);
      setCustomTotalAmount(0);
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (config: AnnualFeeConfiguration) => {
    setEditingConfig(config);
    setEducationLevel(config.education_level || 'SMP');
    setStudentType(config.student_type || 'NEW');
    setEntryYear(config.entry_year || new Date().getFullYear());
    setStudentId(config.student_id ? String(config.student_id) : '');
    setNotes(config.notes || '');
    if (config.student_id) {
      setCustomTotalAmount(config.total_amount);
      setBreakdownItems(config.breakdown_items || []);
    } else {
      setBreakdownItems(config.breakdown_items || []);
    }
    setIsModalOpen(true);
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

    const isStudentConfig = activeSubTab === 'student' || !!editingConfig?.student_id;
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
      breakdown_items: isStudentConfig ? undefined : breakdownItems.filter((i) => i.name.trim() !== ''),
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

  // Filter configurations
  const standardConfigs = (configs || []).filter((c) => !c.student_id);
  const studentConfigs = (configs || []).filter((c) => !!c.student_id);

  const displayedConfigs = activeSubTab === 'standard'
    ? (filterLevel === 'all' ? standardConfigs : standardConfigs.filter((c) => c.education_level === filterLevel))
    : studentConfigs;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={activeSubTab === 'standard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubTab('standard')}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            Tarif Standar Jenjang
          </Button>
          <Button
            type="button"
            variant={activeSubTab === 'student' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubTab('student')}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Tarif Khusus Santri (Diskon)
          </Button>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {activeSubTab === 'standard' && (
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-white">
                <SelectValue placeholder="Semua Jenjang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenjang</SelectItem>
                <SelectItem value="SD">Jenjang SD</SelectItem>
                <SelectItem value="SMP">Jenjang SMP</SelectItem>
                <SelectItem value="SMA">Jenjang SMA</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {activeSubTab === 'standard' ? 'Tambah Tarif Jenjang' : 'Tambah Custom Santri'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white/70 shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <span>Memuat data konfigurasi tarif...</span>
          </div>
        ) : displayedConfigs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Belum ada konfigurasi tarif {activeSubTab === 'standard' ? 'standar jenjang' : 'khusus santri'}.
          </div>
        ) : (
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                {activeSubTab === 'standard' ? (
                  <>
                    <th className="px-5 py-3.5">Jenjang</th>
                    <th className="px-5 py-3.5">Kategori Santri</th>
                    <th className="px-5 py-3.5">Angkatan (Tahun)</th>
                    <th className="px-5 py-3.5">Rincian Komponen Pos</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-3.5">Santri</th>
                    <th className="px-5 py-3.5">Kelas / Jenjang</th>
                    <th className="px-5 py-3.5">Catatan / Alasan</th>
                  </>
                )}
                <th className="px-5 py-3.5 text-right">Total Biaya</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedConfigs.map((cfg) => (
                <tr key={cfg.id} className="hover:bg-slate-50/40 transition-colors">
                  {activeSubTab === 'standard' ? (
                    <>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {cfg.education_level || 'Semua'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {cfg.student_type === 'NEW' ? 'Santri Baru (Tahun ke-1)' : 'Santri Lama (Lanjutan)'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        {cfg.entry_year ? `Angkatan ${cfg.entry_year}` : 'Umum (Semua)'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {cfg.breakdown_items && cfg.breakdown_items.length > 0 ? (
                          <span className="text-xs">
                            {cfg.breakdown_items.map((b) => `${b.name} (${formatRupiah(b.amount)})`).join(', ')}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Tarif global</span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{cfg.student?.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">NIS: {cfg.student?.nis}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-slate-700">
                          {cfg.student?.classroom?.name || '-'} ({cfg.student?.classroom?.education_level || '-'})
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {cfg.notes || '-'}
                      </td>
                    </>
                  )}
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-800 text-sm">
                    {formatRupiah(cfg.total_amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(cfg)}
                        className="h-7 w-7 text-slate-600 hover:text-emerald-700"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cfg.id)}
                        className="h-7 w-7 text-slate-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add / Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingConfig ? 'Edit Konfigurasi Tarif' : activeSubTab === 'standard' ? 'Tambah Tarif Standar Jenjang' : 'Tambah Custom Tarif Santri'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {activeSubTab === 'standard' && !editingConfig?.student_id ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Jenjang Pendidikan:</Label>
                    <Select
                      value={educationLevel}
                      onValueChange={(val: any) => setEducationLevel(val)}
                    >
                      <SelectTrigger className="rounded-xl h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SD">SD / MI</SelectItem>
                        <SelectItem value="SMP">SMP / MTs</SelectItem>
                        <SelectItem value="SMA">SMA / MA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Kategori Santri:</Label>
                    <Select
                      value={studentType}
                      onValueChange={(val: any) => setStudentType(val)}
                    >
                      <SelectTrigger className="rounded-xl h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">Santri Baru (Tahun ke-1)</SelectItem>
                        <SelectItem value="RETURNING">Santri Lama (Lanjutan)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Tahun Angkatan (Entry Year):</Label>
                  <Input
                    type="number"
                    min={2020}
                    max={2035}
                    value={entryYear}
                    onChange={(e) => setEntryYear(Number(e.target.value))}
                    className="rounded-xl h-9 text-xs font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Bisa disesuaikan dengan tahun masuk santri untuk membedakan tarif per angkatan.
                  </p>
                </div>

                {/* Breakdown Items Editor */}
                <div className="space-y-2 pt-1 border-t border-slate-200/80">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-800">
                      Rincian Komponen Pos Biaya:
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBreakdownRow}
                      className="h-7 text-xs rounded-lg flex items-center gap-1 border-emerald-300 text-emerald-800"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Pos
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {breakdownItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder="Nama pos (misal: Uang Gedung)"
                          value={item.name}
                          onChange={(e) => handleBreakdownChange(idx, 'name', e.target.value)}
                          className="rounded-xl h-9 text-xs flex-1"
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Nominal"
                          value={item.amount || ''}
                          onChange={(e) => handleBreakdownChange(idx, 'amount', e.target.value)}
                          className="rounded-xl h-9 text-xs w-[130px] font-mono text-right"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBreakdownRow(idx)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 mt-2">
                    <span className="text-xs font-bold text-emerald-900">Total Nominal Tarif:</span>
                    <span className="text-sm font-bold font-mono text-emerald-800">
                      {formatRupiah(calculatedTotal)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Custom per Santri Form */
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Pilih Santri:</Label>
                  <Select
                    value={studentId}
                    onValueChange={setStudentId}
                    disabled={!!editingConfig?.student_id}
                  >
                    <SelectTrigger className="rounded-xl h-9 text-xs">
                      <SelectValue placeholder="Pilih santri penerima tarif khusus..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {(studentsData?.data || []).map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} (NIS: {s.nis} - {s.classroom?.name || '-'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Total Nominal Tarif Khusus (Rp):</Label>
                  <Input
                    type="number"
                    min={0}
                    value={customTotalAmount || ''}
                    onChange={(e) => setCustomTotalAmount(Number(e.target.value))}
                    placeholder="Contoh: 5000000"
                    className="rounded-xl h-10 font-mono font-bold text-emerald-900"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Catatan / Alasan (Opsional):</Label>
              <Input
                placeholder="Misal: Keringanan keluarga pengurus / beasiswa prestasi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl h-9 text-xs"
              />
            </div>

            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
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
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
