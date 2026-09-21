'use client';

import { useState } from 'react';
import { useGetStudents } from '@/features/master-data/api/useGetStudents';
import { useGetClasses } from '@/features/master-data/api/useGetClasses';
import { useGetStudentBills } from '../api/useGetStudentBills';
import { GenerateSppModal } from './GenerateSppModal';
import { SppPaymentModal } from './SppPaymentModal';
import { SppReceiptModal } from './SppReceiptModal';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Student } from '@/features/master-data/types';
import {
  Search,
  Receipt,
  CreditCard,
  Users,
  CheckCircle2,
  School,
  AlertCircle,
  MessageCircle,
  Clock,
  Sliders,
} from 'lucide-react';
import { SppPricingTab } from './SppPricingTab';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from '@/hooks/useDebounce';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { SppVerificationTable } from './SppVerificationTable';
import { useGetSppVerifications } from '../api/useGetSppVerifications';

const MONTH_NAMES: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
};

export function SppView() {
  const [activeTab, setActiveTab] = useState<'bills' | 'verifications' | 'pricing'>('bills');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // State for SPP Receipt Modal
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const handleOpenReceipt = (paymentId: string) => {
    setReceiptPaymentId(paymentId);
    setReceiptModalOpen(true);
  };

  // Fetch pending verifications for badge count
  const { data: verificationsData } = useGetSppVerifications({ status: 'PENDING' });
  const pendingCount = verificationsData?.meta?.pending_count ?? 0;

  // Fetch classes for dropdown filter
  const { data: classes } = useGetClasses();

  // Fetch students for the table with search, class filter, and pagination
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents({
    search: debouncedSearch,
    class_id: selectedClassId === 'all' ? undefined : Number(selectedClassId),
    page,
    per_page: perPage,
    status: 'ACTIVE',
  });

  // Fetch bills for the selected student
  const { data: billsData } = useGetStudentBills(selectedStudent?.id);

  const studentsList = studentsData?.data || [];
  const studentsWithTunggakan = studentsList.filter((s) =>
    s.bills && s.bills.some((b) => b.status === 'UNPAID' || b.status === 'PARTIAL')
  ).length;

  const handleSendWaReminder = (student: Student) => {
    const unpaidBills = student.bills?.filter(
      (b) => b.status === 'UNPAID' || b.status === 'PARTIAL'
    ) || [];

    if (unpaidBills.length === 0) {
      toast.info('Santri ini tidak memiliki tagihan tertunggak.');
      return;
    }

    const primaryGuardian = student.guardians?.find(
      (g) => g.pivot?.is_primary === 1 || g.pivot?.is_primary === true
    ) || student.guardians?.[0];

    const rawPhone = primaryGuardian?.phone;
    let formattedPhone = '';
    if (rawPhone && rawPhone.trim()) {
      formattedPhone = rawPhone.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      }
    }

    const totalUnpaidAmount = unpaidBills.reduce((acc, curr) => acc + curr.amount_billed, 0);

    const billsListText = unpaidBills
      .map((b) => {
        const monthName = MONTH_NAMES[b.period_month] || `Bulan ${b.period_month}`;
        return `• ${monthName} ${b.period_year} : Rp ${b.amount_billed.toLocaleString('id-ID')}`;
      })
      .join('\n');

    const guardianName = primaryGuardian?.name || 'Bapak/Ibu Wali Santri';

    const message =
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Yth. *${guardianName}*
Wali dari Ananda: *${student.name}* (NIS: ${student.nis})
Kelas: *${student.classroom?.name || '-'}*

Semoga Bapak/Ibu senantiasa dalam lindungan dan limpahan rahmat Allah SWT.

Kami dari bagian Keuangan Pesantren (SIKESAN) ingin menyampaikan rincian kewajiban SPP ananda yang saat ini masih tercatat belum diselesaikan:

📋 *Rincian Tunggakan SPP:*
${billsListText}

💰 *Total Tagihan:* *Rp ${totalUnpaidAmount.toLocaleString('id-ID')}*

Pembayaran dapat dilakukan secara langsung di kantor bendahara atau melalui transfer:
- *Bank:* Bank Syariah Indonesia (BSI)
- *No. Rekening:* 7123456780
- *Atas Nama:* Pesantren SIKESAN

Mohon konfirmasi dengan mengirimkan bukti transfer jika telah melakukan pembayaran.

Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
_Jazakumullah Khairan Katsiran._

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
— *Bendahara Keuangan Pesantren*`;

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    toast.success(`Membuka WhatsApp Pengingat untuk ${guardianName}...`);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Pengelolaan Tagihan SPP
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate tagihan bulanan santri secara massal, pantau tunggakan, dan verifikasi bukti transfer online dari wali santri.
          </p>
        </div>
        <GenerateSppModal />
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('bills')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'bills'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
        >
          <Users className="h-4 w-4" />
          <span>Tagihan Santri</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'verifications'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
        >
          <Clock className={`h-4 w-4 ${activeTab === 'verifications' ? 'text-white' : 'text-amber-500'}`} />
          <span>Verifikasi Pembayaran Online</span>
          {pendingCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${activeTab === 'verifications'
                ? 'bg-white text-emerald-700'
                : 'bg-amber-500 text-white animate-pulse'
                }`}
            >
              {pendingCount} Menunggu
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'pricing'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Tarif SPP & Keringanan</span>
        </button>
      </div>

      {activeTab === 'pricing' ? (
        <SppPricingTab />
      ) : activeTab === 'verifications' ? (
        <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm">
          <SppVerificationTable onOpenReceipt={handleOpenReceipt} />
        </div>
      ) : (
        <>
          {/* Metric Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Santri Wajib SPP (Aktif)"
              value={`${studentsData?.total || 0} Santri`}
              icon={<Users className="h-4 w-4" />}
              isLoading={isLoadingStudents}
              variant="emerald"
              badge="Kewajiban Aktif"
            />
            <MetricCard
              title="Santri Ada Tunggakan"
              value={`${studentsWithTunggakan} Santri`}
              icon={<AlertCircle className="h-4 w-4" />}
              isLoading={isLoadingStudents}
              variant="amber"
              badge="Perlu Ditagih"
              valueClassName="text-xl sm:text-2xl text-amber-700 font-extrabold"
            />
            <MetricCard
              title="Sinkronisasi Tagihan"
              value="Otomatis Bulanan"
              icon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={isLoadingStudents}
              variant="blue"
              badge="Idempotent"
              valueClassName="text-xl sm:text-2xl text-slate-800"
            />
          </div>

          {/* Main Table Card */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
            {/* Search & Class Filter Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-1 max-w-xl">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Cari nama atau NIS santri..."
                    className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-sm focus:border-emerald-600"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Class Filter Dropdown */}
                <div className="w-full sm:w-52">
                  <Select
                    value={selectedClassId}
                    onValueChange={(val) => {
                      setSelectedClassId(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <School className="h-4 w-4 text-emerald-600 shrink-0" />
                        <SelectValue placeholder="Pilih Kelas" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


            </div>

            {/* SPP Bills Table */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/80">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 font-semibold">NIS</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Nama Santri</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Kelas</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Asrama</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Tunggakan Bulan</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold text-center">Pengingat</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingStudents ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            <span>Memuat data tagihan SPP...</span>
                          </div>
                        </td>
                      </tr>
                    ) : studentsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                          Tidak ada santri yang ditemukan pada filter ini.
                        </td>
                      </tr>
                    ) : (
                      studentsList.map((student) => {
                        const unpaidBills = student.bills?.filter(
                          (b) => b.status === 'UNPAID' || b.status === 'PARTIAL'
                        ) || [];
                        const pendingBills = student.bills?.filter(
                          (b) => b.status === 'PENDING'
                        ) || [];
                        const hasUnpaidBills = unpaidBills.length > 0;
                        const hasPendingBills = pendingBills.length > 0;
                        const totalUnpaidAmount = unpaidBills.reduce(
                          (acc, curr) => acc + curr.amount_billed,
                          0
                        );

                        const primaryGuardian = student.guardians?.find(
                          (g) => g.pivot?.is_primary === 1 || g.pivot?.is_primary === true
                        ) || student.guardians?.[0];

                        return (
                          <tr key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{student.nis}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">{student.name}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-medium">
                                {student.classroom?.name || '-'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-medium">
                                {student.dormitory?.name || 'Non-Mukim'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              {!hasUnpaidBills && !hasPendingBills ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  Lunas
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1 max-w-[280px]">
                                    {/* Tagihan Tertunggak */}
                                    {unpaidBills.map((bill) => {
                                      const fullMonth = MONTH_NAMES[bill.period_month] || `Bulan ${bill.period_month}`;
                                      const shortMonth = fullMonth.slice(0, 3);
                                      return (
                                        <span
                                          key={bill.id}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 shadow-2xs"
                                          title={`Tagihan ${fullMonth} ${bill.period_year} - Rp ${bill.amount_billed.toLocaleString('id-ID')}`}
                                        >
                                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                          {shortMonth} {bill.period_year}
                                        </span>
                                      );
                                    })}

                                    {/* Tagihan Menunggu Verifikasi */}
                                    {pendingBills.map((bill) => {
                                      const fullMonth = MONTH_NAMES[bill.period_month] || `Bulan ${bill.period_month}`;
                                      const shortMonth = fullMonth.slice(0, 3);
                                      return (
                                        <span
                                          key={bill.id}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 shadow-2xs"
                                          title={`Menunggu Verifikasi: Tagihan ${fullMonth} ${bill.period_year}`}
                                        >
                                          <Clock className="h-2.5 w-2.5 text-amber-600" />
                                          {shortMonth} {bill.period_year} (Menunggu)
                                        </span>
                                      );
                                    })}
                                  </div>
                                  {hasUnpaidBills && (
                                    <span className="text-[10px] text-rose-600 font-medium block">
                                      {unpaidBills.length} Bulan Tertunggak (Rp {totalUnpaidAmount.toLocaleString('id-ID')})
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendWaReminder(student)}
                                disabled={!hasUnpaidBills}
                                className={`h-8 px-2.5 text-xs font-semibold gap-1.5 transition-all ${!hasUnpaidBills
                                  ? 'text-slate-400 bg-slate-50/50 border-slate-200 cursor-not-allowed opacity-50'
                                  : 'text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 shadow-2xs'
                                  }`}
                                title={
                                  !hasUnpaidBills
                                    ? 'Santri tidak memiliki tunggakan SPP'
                                    : primaryGuardian?.phone
                                      ? `Kirim pengingat WA ke ${primaryGuardian.name || 'Wali Santri'} (${primaryGuardian.phone})`
                                      : 'Nomor WhatsApp wali santri belum terdaftar di sistem'
                                }
                              >
                                <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span>Kirim Pengingat</span>
                              </Button>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {hasUnpaidBills ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setSelectedStudent(student)}
                                  className="h-8 px-3 text-xs font-semibold shadow-2xs"
                                  title="Bayar Tagihan SPP"
                                >
                                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                                  Bayar SPP
                                </Button>
                              ) : hasPendingBills ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="h-8 px-2.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border-amber-200/80 cursor-not-allowed opacity-90"
                                  title="Ada pembayaran yang sedang menunggu verifikasi bendahara"
                                >
                                  <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" />
                                  Menunggu Verifikasi
                                </Button>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="h-8 px-2.5 text-xs font-semibold text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
                                    title="Semua tagihan SPP santri ini telah lunas"
                                  >
                                    <CreditCard className="h-3.5 w-3.5 mr-1" />
                                    Lunas
                                  </Button>
                                  {(() => {
                                    const latestPaymentId = student.bills
                                      ?.filter(b => b.status === 'PAID')
                                      ?.flatMap(b => b.payments || [])
                                      ?.find(p => p.status === 'APPROVED')?.id;
                                    if (!latestPaymentId) return null;
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenReceipt(latestPaymentId)}
                                        className="h-8 px-2 text-xs font-semibold text-emerald-700 bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 gap-1"
                                        title="Lihat / Cetak Kwitansi Resmi Terakhir"
                                      >
                                        <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Kwitansi</span>
                                      </Button>
                                    );
                                  })()}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <DataTablePagination
                currentPage={studentsData?.current_page || page}
                totalPages={studentsData?.last_page || 1}
                totalItems={studentsData?.total || 0}
                pageSize={studentsData?.per_page || perPage}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setPerPage(newSize);
                  setPage(1);
                }}
                isLoading={isLoadingStudents}
              />
            </div>
          </div>
        </>
      )}

      <SppPaymentModal
        student={selectedStudent}
        bills={billsData || []}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSuccessPayment={handleOpenReceipt}
      />

      <SppReceiptModal
        paymentId={receiptPaymentId}
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setReceiptPaymentId(null);
        }}
      />
    </div>
  );
}
