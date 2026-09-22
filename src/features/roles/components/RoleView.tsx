'use client';

import { useState, useMemo } from 'react';
import { useGetRoles } from '../api/useGetRoles';
import { useGetPermissions } from '../api/useGetPermissions';
import { RoleTable } from './RoleTable';
import { CreateRoleModal } from './CreateRoleModal';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { ShieldCheck, KeyRound, Search, ShieldAlert } from 'lucide-react';

export function RoleView() {
  const { data: roles, isLoading: isLoadingRoles, isError, refetch } = useGetRoles();
  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.permissions || []).some((p) => p.name.toLowerCase().includes(q))
    );
  }, [roles, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Manajemen Role & Hak Akses
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Atur pengelompokan peran, izin akses modul finansial, dan hak otoritas pengguna sistem SIKESAN.
          </p>
        </div>
        <CreateRoleModal />
      </div>

      {isError && (
        <ErrorState
          title="Gagal Memuat Data Role"
          message="Tidak dapat mengambil daftar peran dan hak akses dari server."
          onRetry={() => refetch()}
        />
      )}

      {/* Metric Summary Strip to prevent empty screen voids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Peran Terdaftar"
          value={`${roles?.length || 0} Role`}
          icon={<ShieldCheck className="h-4 w-4" />}
          isLoading={isLoadingRoles}
          variant="emerald"
          badge="Peran Aktif"
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Hak Akses Terkonfigurasi"
          value={`${permissions?.length || 0} Permissions`}
          icon={<KeyRound className="h-4 w-4" />}
          isLoading={isLoadingPermissions}
          variant="blue"
          badge="Modul Akses"
          valueClassName="text-blue-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Sistem Keamanan"
          value="RBAC"
          icon={<ShieldAlert className="h-4 w-4" />}
          isLoading={false}
          variant="emerald"
          badge="Terproteksi"
          valueClassName="text-slate-800 text-xl font-bold"
        />
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Daftar Peran & Hak Akses</h3>
            <p className="text-xs text-slate-400">
              Pengguna mewarisi seluruh hak akses sesuai dengan role yang ditetapkan.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari role atau permission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-9 text-xs rounded-xl bg-white/80"
            />
          </div>
        </div>

        <RoleTable data={filteredRoles} isLoading={isLoadingRoles} />
      </div>
    </div>
  );
}
