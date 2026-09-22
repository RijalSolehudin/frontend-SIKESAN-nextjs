'use client';

import { useState } from 'react';
import { useGetStudents } from '../api/useGetStudents';
import { useGetClasses } from '../api/useGetClasses';
import { StudentTable } from './StudentTable';
import { CreateStudentModal } from './CreateStudentModal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, GraduationCap, UserCheck, UserX, Award, School } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { MetricCard } from '@/features/dashboard/components/MetricCard';

export function StudentView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: classes } = useGetClasses();

  const { data, isLoading, isError, refetch } = useGetStudents({
    search: debouncedSearch,
    class_id: selectedClassId === 'all' ? undefined : Number(selectedClassId),
    page,
    per_page: perPage,
  });

  const students = data?.data || [];
  const activeCount = students.filter((s) => s.status === 'ACTIVE').length;
  const inactiveCount = students.filter((s) => s.status === 'INACTIVE').length;
  const graduatedCount = students.filter((s) => s.status === 'GRADUATED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Master Data Santri
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola biodata santri, status pendidikan mukim, asrama, dan penugasan wali.
          </p>
        </div>
        <CreateStudentModal />
      </div>

      {/* Metric Summary Strip to prevent empty voids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Santri Terdaftar"
          value={`${data?.total || students.length} Orang`}
          icon={<GraduationCap className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Database"
        />
        <MetricCard
          title="Santri Aktif Belajar"
          value={`${activeCount} Santri`}
          icon={<UserCheck className="h-4 w-4" />}
          isLoading={isLoading}
          variant="blue"
          badge="Aktif SPP"
          valueClassName="text-xl sm:text-2xl text-blue-700"
        />
        <MetricCard
          title="Santri Lulus / Alumni"
          value={`${graduatedCount} Orang`}
          icon={<Award className="h-4 w-4" />}
          isLoading={isLoading}
          variant="amber"
          badge="Alumni"
          valueClassName="text-xl sm:text-2xl text-slate-800"
        />
        <MetricCard
          title="Nonaktif"
          value={`${inactiveCount} Santri`}
          icon={<UserX className="h-4 w-4" />}
          isLoading={isLoading}
          variant="rose"
          badge="Nonaktif"
          valueClassName="text-xl sm:text-2xl text-rose-600"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-1 max-w-xl">
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

            <div className="w-full sm:w-52">
              <Select
                value={selectedClassId}
                onValueChange={(val) => {
                  setSelectedClassId(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs font-medium shadow-2xs">
                  <div className="flex items-center gap-2 truncate">
                    <School className="h-4 w-4 text-emerald-600 shrink-0" />
                    <SelectValue placeholder="Semua Kelas" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {data ? (
              <span>Menampilkan <strong className="text-slate-800">{students.length}</strong> dari <strong className="text-slate-800">{data.total}</strong> santri</span>
            ) : null}
          </div>
        </div>

        <StudentTable
          data={students}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          pagination={data ? {
            currentPage: data.current_page || page,
            totalPages: data.last_page || 1,
            totalItems: data.total || 0,
            pageSize: data.per_page || perPage,
            onPageChange: (newPage) => setPage(newPage),
            onPageSizeChange: (newSize) => {
              setPerPage(newSize);
              setPage(1);
            },
          } : undefined}
        />
      </div>
    </div>
  );
}
