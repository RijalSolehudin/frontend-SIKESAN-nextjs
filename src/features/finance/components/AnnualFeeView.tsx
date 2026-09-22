'use client';

import { useState } from 'react';
import { useGetAnnualFeeBills, useGenerateAnnualFeeBills } from '../api/useAnnualFeeBills';
import { useGetAnnualFeeVerifications } from '../api/useAnnualFeePayment';
import { useGetClasses } from '@/features/master-data/api/useGetClasses';
import { useGetAcademicYears } from '@/features/master-data/api/useGetAcademicYears';
import { AnnualFeeBill, BreakdownItem } from '../types/annual-fees';
import { AnnualFeePaymentModal } from './AnnualFeePaymentModal';
import { AnnualFeeBreakdownModal } from './AnnualFeeBreakdownModal';
import { AnnualFeeReceiptModal } from './AnnualFeeReceiptModal';
import { AnnualFeePricingTab } from './AnnualFeePricingTab';
import { AnnualFeeVerificationTable } from './AnnualFeeVerificationTable';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import {
  Search,
  Receipt,
  CreditCard,
  Users,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Clock,
  FileText,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';

export function AnnualFeeView() {
  const [activeTab, setActiveTab] = useState<'bills' | 'verifications' | 'pricing'>('bills');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modals state
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<AnnualFeeBill | null>(null);
  const [breakdownModalData, setBreakdownModalData] = useState<{
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
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');

  // Fetch queries
  const { data: billsResponse, isLoading, refetch } = useGetAnnualFeeBills({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    education_level: selectedLevel !== 'all' ? selectedLevel : undefined,
    class_id: selectedClassId !== 'all' ? selectedClassId : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const { data: classesData } = useGetClasses();
  const { data: academicYearsData } = useGetAcademicYears();
  const { data: verificationsData } = useGetAnnualFeeVerifications();
  const generateMutation = useGenerateAnnualFeeBills();

  const pendingCount = verificationsData?.meta?.pending_count || 0;
  const bills = billsResponse?.data || [];
  const meta = billsResponse?.meta;
  const summary = meta?.summary;

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  const handleOpenBreakdown = (bill: AnnualFeeBill) => {
    setBreakdownModalData({
      isOpen: true,
      title: `Rincian Pos Biaya - ${bill.student?.name}`,
      subtitle: `${bill.student?.classroom?.name || '-'} (${bill.student_type === 'NEW' ? 'Santri Baru' : 'Santri Lama'})`,
      items: bill.snapshot_breakdown,
      totalAmount: bill.total_amount,
    });
  };

  const handleOpenReceiptLatest = (bill: AnnualFeeBill) => {
    const latestPayment = bill.payments?.[bill.payments.length - 1];
    if (latestPayment) {
      setReceiptPaymentId(latestPayment.id);
    } else {
      toast.error('Belum ada riwayat pembayaran untuk tagihan ini');
    }
  };

  const handleGenerateBills = () => {
    generateMutation.mutate(
      {
        academic_year_id: selectedAcademicYearId ? Number(selectedAcademicYearId) : undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          setIsGenerateModalOpen(false);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal generate tagihan');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Main Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-emerald-600" />
            Biaya Tahunan & Uang Pangkal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan uang pangkal santri baru, biaya daftar ulang tahunan, dan skema cicilan bebas.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 shadow-xs">
          <Button
            type="button"
            variant={activeTab === 'bills' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('bills')}
            className="rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Receipt className="h-3.5 w-3.5" />
            Tagihan Santri
          </Button>

          <Button
            type="button"
            variant={activeTab === 'verifications' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('verifications')}
            className="rounded-xl text-xs font-semibold flex items-center gap-1.5 relative"
          >
            <Clock className="h-3.5 w-3.5" />
            Verifikasi Online
            {pendingCount > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant={activeTab === 'pricing' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('pricing')}
            className="rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Sliders className="h-3.5 w-3.5" />
            Konfigurasi Tarif
          </Button>
        </div>
      </div>

      {activeTab === 'pricing' && <AnnualFeePricingTab />}

      {activeTab === 'verifications' && <AnnualFeeVerificationTable />}

      {activeTab === 'bills' && (
        <div className="space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Tagihan Tahunan"
              value={formatRupiah(summary?.total_billed || 0)}
              icon={<Building2 className="h-5 w-5 text-emerald-600" />}
            />
            <MetricCard
              title="Total Sudah Terbayar"
              value={formatRupiah(summary?.total_paid || 0)}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            />
            <MetricCard
              title="Sisa Piutang Biaya"
              value={formatRupiah(summary?.total_remaining || 0)}
              variant="rose"
              icon={<AlertCircle className="h-5 w-5 text-rose-600" />}
            />
            <MetricCard
              title="Total Tagihan Diterbitkan"
              value={`${meta?.total || 0} Santri`}
              variant="blue"
              icon={<Users className="h-5 w-5 text-blue-600" />}
            />
          </div>

          {/* Filters & Actions Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Cari nama / NIS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-white border-slate-200"
                />
              </div>

              {/* Jenjang Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl bg-white">
                  <SelectValue placeholder="Semua Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenjang</SelectItem>
                  <SelectItem value="SD">Jenjang SD</SelectItem>
                  <SelectItem value="SMP">Jenjang SMP</SelectItem>
                  <SelectItem value="SMA">Jenjang SMA</SelectItem>
                </SelectContent>
              </Select>

              {/* Kelas Filter */}
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-white">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {(classesData || []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} {c.education_level ? `(${c.education_level})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl bg-white">
                  <SelectValue placeholder="Status Pelunasan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="UNPAID">Belum Bayar</SelectItem>
                  <SelectItem value="PARTIAL">Mencicil (Sebagian)</SelectItem>
                  <SelectItem value="PAID">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => setIsGenerateModalOpen(true)}
              className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
              Generate Tagihan Massal
            </Button>
          </div>

          {/* Bills Table */}
          <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white/70 shadow-xs">
            {isLoading ? (
              <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Memuat data tagihan biaya tahunan...</span>
              </div>
            ) : bills.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400">
                Tidak ada tagihan yang sesuai dengan filter pencarian.
              </div>
            ) : (
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5">Santri</th>
                    <th className="px-5 py-3.5">Kelas & Jenjang</th>
                    <th className="px-5 py-3.5">Kategori</th>
                    <th className="px-5 py-3.5 text-right">Total Biaya</th>
                    <th className="px-5 py-3.5 text-center">Progres Pembayaran</th>
                    <th className="px-5 py-3.5 text-right">Sisa Tagihan</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((bill) => {
                    const progress = Math.min(100, Math.round((bill.paid_amount / bill.total_amount) * 100));
                    const isLunas = bill.status === 'PAID' || bill.remaining_amount <= 0;

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 block">{bill.student?.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">NIS: {bill.student?.nis}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-slate-800 font-medium block">
                            {bill.student?.classroom?.name || '-'}
                          </span>
                          {bill.student?.classroom?.education_level && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              {bill.student?.classroom?.education_level}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              bill.student_type === 'NEW'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {bill.student_type === 'NEW' ? 'Santri Baru' : 'Santri Lama'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {formatRupiah(bill.total_amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenBreakdown(bill)}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline font-medium mt-0.5"
                          >
                            Lihat Rincian Pos
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-center min-w-[140px]">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                            <span className="font-mono text-emerald-700 font-bold">{formatRupiah(bill.paid_amount)}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isLunas ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold">
                          <span className={isLunas ? 'text-emerald-700' : 'text-red-600'}>
                            {formatRupiah(bill.remaining_amount)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isLunas
                                ? 'bg-emerald-100 text-emerald-800'
                                : bill.status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isLunas ? 'LUNAS' : bill.status === 'PARTIAL' ? 'MENCICIL' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!isLunas && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setSelectedBillForPayment(bill)}
                                className="h-7 px-2.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                              >
                                <CreditCard className="h-3 w-3" />
                                Bayar Cicilan
                              </Button>
                            )}
                            {bill.payments && bill.payments.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReceiptLatest(bill)}
                                className="h-7 px-2 text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                                title="Cetak Kwitansi Cicilan Terakhir"
                              >
                                <Receipt className="h-3 w-3" />
                                Kwitansi
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {meta && (
              <DataTablePagination
                currentPage={page}
                totalPages={meta.last_page || 1}
                totalItems={meta.total || 0}
                pageSize={perPage}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPerPage(newSize);
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <AnnualFeePaymentModal
        bill={selectedBillForPayment}
        isOpen={!!selectedBillForPayment}
        onClose={() => setSelectedBillForPayment(null)}
        onSuccessPayment={(paymentId) => {
          setReceiptPaymentId(paymentId);
          refetch();
        }}
      />

      {/* Breakdown Modal */}
      <AnnualFeeBreakdownModal
        isOpen={breakdownModalData.isOpen}
        onClose={() => setBreakdownModalData({ ...breakdownModalData, isOpen: false })}
        title={breakdownModalData.title}
        subtitle={breakdownModalData.subtitle}
        items={breakdownModalData.items}
        totalAmount={breakdownModalData.totalAmount}
      />

      {/* Receipt Modal */}
      <AnnualFeeReceiptModal
        paymentId={receiptPaymentId}
        isOpen={!!receiptPaymentId}
        onClose={() => setReceiptPaymentId(null)}
      />

      {/* Generate Bills Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[440px] glass-modal p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Generate Tagihan Biaya Tahunan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 text-xs text-slate-600">
            <p>
              Proses ini akan membuat tagihan Biaya Tahunan (Uang Pangkal / Daftar Ulang) untuk seluruh santri aktif
              berdasarkan konfigurasi jenjang dan angkatan masing-masing.
            </p>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Tahun Ajaran:</label>
              <Select
                value={selectedAcademicYearId}
                onValueChange={setSelectedAcademicYearId}
              >
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Tahun Ajaran Aktif Saat Ini" />
                </SelectTrigger>
                <SelectContent>
                  {(academicYearsData || []).map((ay) => (
                    <SelectItem key={ay.id} value={String(ay.id)}>
                      {ay.name} {ay.is_active ? '(Aktif)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Santri yang sudah memiliki tagihan pada tahun ajaran ini akan dilewati secara otomatis (tidak duplikat).
            </p>
          </div>
          <DialogFooter className="mt-5 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGenerateModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleGenerateBills}
              disabled={generateMutation.isPending}
              className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {generateMutation.isPending ? 'Men-generate...' : 'Mulai Generate Tagihan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
