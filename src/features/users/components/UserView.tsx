'use client';

import { useState } from 'react';
import { useGetUsers } from '../api/useGetUsers';
import { UserTable } from './UserTable';
import { CreateUserModal } from './CreateUserModal';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { Input } from '@/components/ui/input';

export function UserView() {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { data: allUsersData, isLoading: isLoadingAll } = useGetUsers({ per_page: 100 });
  const { data: filteredData, isLoading, isError, refetch } = useGetUsers({
    role: selectedRole === 'all' ? undefined : selectedRole,
    search: search ? search : undefined,
    page,
    per_page: perPage,
  });

  const allUsers = allUsersData?.data || [];
  const totalCount = allUsers.length;
  const waliCount = allUsers.filter((u) => u.roles && u.roles.includes('Wali Santri')).length;
  const staffCount = allUsers.filter((u) => u.roles && !u.roles.includes('Wali Santri')).length;
  const activeCount = allUsers.filter((u) => u.is_active).length;

  const roleFilters = [
    { label: 'Semua Peran', value: 'all' },
    { label: 'Wali Santri', value: 'Wali Santri' },
    { label: 'Bendahara', value: 'Bendahara' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Super Admin', value: 'Super Admin' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Manajemen Pengguna & Akun
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola akun wali santri, staf, dan pengurus pondok pesantren secara terpusat.
          </p>
        </div>
        <CreateUserModal />
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pengguna"
          value={`${totalCount} Akun`}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoadingAll}
          variant="emerald"
          badge="Terdaftar"
        />
        <MetricCard
          title="Wali Santri"
          value={`${waliCount} Akun`}
          icon={<UserCheck className="h-4 w-4" />}
          isLoading={isLoadingAll}
          variant="blue"
          badge="Wali Murid"
          valueClassName="text-xl sm:text-2xl text-blue-700 font-extrabold"
        />
        <MetricCard
          title="Staf & Pengurus"
          value={`${staffCount} Akun`}
          icon={<ShieldCheck className="h-4 w-4" />}
          isLoading={isLoadingAll}
          variant="amber"
          badge="Internal"
          valueClassName="text-xl sm:text-2xl text-amber-700 font-extrabold"
        />
        <MetricCard
          title="Akun Aktif"
          value={`${activeCount} Akun`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoadingAll}
          variant="emerald"
          badge="Siap Login"
        />
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {roleFilters.map((rf) => {
              const isSelected = selectedRole === rf.value;
              return (
                <button
                  key={rf.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(rf.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {rf.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama, username, no. HP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <UserTable
          data={filteredData?.data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          pagination={filteredData?.meta ? {
            currentPage: filteredData.meta.current_page || page,
            totalPages: filteredData.meta.last_page || 1,
            totalItems: filteredData.meta.total || 0,
            pageSize: filteredData.meta.per_page || perPage,
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
