'use client';

import { useState, useMemo } from 'react';
import { useGetMobileMenus } from '../api/useGetMobileMenus';
import { useUpdateMobileMenus } from '../api/useUpdateMobileMenus';
import { SUPPORTED_ROLES, SupportedRole } from '../types';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ErrorState } from '@/components/ui/error-state';
import {
  Smartphone,
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  ArrowUpRight,
  Wallet,
  HeartHandshake,
  Receipt,
  ShoppingCart,
  ArrowDownLeft,
  Users,
  Building2,
  BookOpen,
  ShieldAlert,
  Settings,
  LayoutGrid,
  UserCheck,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  top_up: ArrowUpRight,
  bayar_spp: Wallet,
  infak: HeartHandshake,
  kwitansi: Receipt,
  sistem_kasir: ShoppingCart,
  uang_keluar: ArrowDownLeft,
  data_santri: Users,
  rek_wali_asrama: Building2,
  rek_kesantrian: BookOpen,
  akun_staff: ShieldAlert,
  settings: Settings,
};

export function MobileConfigView() {
  const { data: serverRolesMap, isLoading, isError, refetch } = useGetMobileMenus();
  const updateMutation = useUpdateMobileMenus();

  // Active role selected in the UI
  const [selectedRole, setSelectedRole] = useState<SupportedRole>('Wali Santri');

  // Local overrides organized by role: { "Wali Santri": { "top_up": true, ... }, "Kasir": { ... } }
  const [roleOverrides, setRoleOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Compute effective menus for a given role
  const getEffectiveMenusForRole = useMemo(() => {
    return (role: string) => {
      const serverItems = serverRolesMap?.[role] || [];
      const overrides = roleOverrides[role] || {};

      return serverItems.map((item) => ({
        ...item,
        is_enabled: overrides[item.id] !== undefined ? overrides[item.id] : item.is_enabled,
      }));
    };
  }, [serverRolesMap, roleOverrides]);

  // Current active role menus
  const currentRoleMenus = useMemo(() => {
    return getEffectiveMenusForRole(selectedRole);
  }, [getEffectiveMenusForRole, selectedRole]);

  // Check if current selected role has unsaved changes
  const hasChangesForRole = useMemo(() => {
    const serverItems = serverRolesMap?.[selectedRole] || [];
    const overrides = roleOverrides[selectedRole] || {};

    return serverItems.some(
      (item) => overrides[item.id] !== undefined && overrides[item.id] !== item.is_enabled
    );
  }, [serverRolesMap, roleOverrides, selectedRole]);

  // Toggle individual menu for current role
  const handleToggle = (menuId: string, checked: boolean) => {
    setRoleOverrides((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] || {}),
        [menuId]: checked,
      },
    }));
  };

  // Bulk actions for current role
  const handleEnableAllForRole = () => {
    const serverItems = serverRolesMap?.[selectedRole] || [];
    const allTrue: Record<string, boolean> = {};
    serverItems.forEach((m) => {
      allTrue[m.id] = true;
    });

    setRoleOverrides((prev) => ({
      ...prev,
      [selectedRole]: allTrue,
    }));
  };

  const handleDisableAllForRole = () => {
    const serverItems = serverRolesMap?.[selectedRole] || [];
    const allFalse: Record<string, boolean> = {};
    serverItems.forEach((m) => {
      allFalse[m.id] = false;
    });

    setRoleOverrides((prev) => ({
      ...prev,
      [selectedRole]: allFalse,
    }));
  };

  const handleResetForRole = () => {
    setRoleOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedRole];
      return next;
    });
  };

  const handleSaveForRole = () => {
    updateMutation.mutate(
      {
        role: selectedRole,
        menus: currentRoleMenus,
      },
      {
        onSuccess: () => {
          handleResetForRole();
        },
      }
    );
  };

  // Filtered menus for the table/list based on search & category
  const filteredMenus = useMemo(() => {
    return currentRoleMenus.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [currentRoleMenus, searchQuery, selectedCategory]);

  // Counts for currently selected role
  const activeCount = useMemo(
    () => currentRoleMenus.filter((m) => m.is_enabled).length,
    [currentRoleMenus]
  );
  const inactiveCount = useMemo(
    () => currentRoleMenus.filter((m) => !m.is_enabled).length,
    [currentRoleMenus]
  );

  // Menus visible in the live preview (only enabled ones for current role)
  const previewVisibleMenus = useMemo(() => {
    return currentRoleMenus.filter((m) => m.is_enabled);
  }, [currentRoleMenus]);

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Konfigurasi Mobile"
        message="Tidak dapat mengambil data menu konfigurasi dari server. Silakan coba lagi."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Smartphone className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Konfigurasi UI Mobile Berbasis Role
            </h1>
            {hasChangesForRole && (
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                Ada Perubahan Belum Disimpan ({selectedRole})
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih peran pengguna di bawah untuk mengaktifkan atau menonaktifkan seluruh 11 pilihan menu mobile secara fleksibel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasChangesForRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetForRole}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-xs text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSaveForRole}
            disabled={!hasChangesForRole || updateMutation.isPending}
            className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
          >
            {updateMutation.isPending ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Simpan Konfigurasi ({selectedRole})
          </Button>
        </div>
      </div>

      {/* Role Selector Segmented Bar */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center gap-2 px-2 pt-1 text-xs font-bold text-slate-600">
          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>PILIH ROLE PENGGUNA UNTUK DIKONFIGURASI:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SUPPORTED_ROLES.map((role) => {
            const isSelected = selectedRole === role;
            const roleMenus = getEffectiveMenusForRole(role);
            const activeMenus = roleMenus.filter((m) => m.is_enabled).length;

            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`relative p-3 rounded-xl text-left border transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold truncate leading-tight ${
                      isSelected ? 'text-emerald-900' : 'text-slate-800'
                    }`}
                  >
                    {role}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {activeMenus} / {roleMenus.length} Aktif
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Cards Strip for Selected Role */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={`Total Menu (${selectedRole})`}
          value={`${currentRoleMenus.length} Pilihan Menu`}
          icon={<LayoutGrid className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Semua Modul Terbuka"
          valueClassName="text-slate-900 text-2xl font-extrabold"
        />
        <MetricCard
          title="Menu Aktif Ditampilkan"
          value={`${activeCount} Modul`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Tampil di Layar"
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Menu Dinonaktifkan"
          value={`${inactiveCount} Modul`}
          icon={<XCircle className="h-4 w-4" />}
          isLoading={isLoading}
          variant="rose"
          badge="Disembunyikan"
          valueClassName="text-rose-700 text-2xl font-extrabold"
        />
      </div>

      {/* Main Content: Controls & Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls & Menu Table (7 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={`Cari menu untuk ${selectedRole}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableAllForRole}
                  className="text-[11px] h-9 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  Aktifkan Semua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableAllForRole}
                  className="text-[11px] h-9 px-2.5 text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Nonaktifkan Semua
                </Button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
              {['Semua', 'Keuangan', 'Operasional', 'Sistem'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items List - ALL 11 ITEMS SHOWN */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Memuat katalog modul untuk {selectedRole}...</span>
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada menu yang sesuai dengan kriteria pencarian.
              </div>
            ) : (
              filteredMenus.map((item) => {
                const IconComponent = ICON_MAP[item.id] || LayoutGrid;

                return (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      item.is_enabled ? 'hover:bg-slate-50/60' : 'bg-slate-50/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Icon & Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          item.is_enabled
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {item.title}
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              item.category === 'Keuangan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.category === 'Operasional'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.category || 'Modul'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex flex-col items-end">
                        <span
                          className={`text-xs font-semibold ${
                            item.is_enabled ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {item.is_enabled ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.is_enabled ? `Tampil di ${selectedRole}` : 'Disembunyikan'}
                        </span>
                      </div>
                      <Switch
                        checked={item.is_enabled}
                        onCheckedChange={(checked) => handleToggle(item.id, checked)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Live Mobile Mockup Preview (5 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Layar: {selectedRole}
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Preview
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Tampilan berikut menggambarkan apa yang dilihat oleh pengguna dengan peran <b>{selectedRole}</b> di aplikasi Flutter.
            </p>
          </div>

          {/* Smartphone Mockup Frame */}
          <div className="flex justify-center">
            <div className="w-[320px] rounded-[36px] bg-slate-900 p-3 shadow-2xl shadow-slate-900/30 border-4 border-slate-800">
              {/* Speaker / Camera Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-950" />
                <div className="w-8 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Mobile Screen Inside */}
              <div className="bg-[#F8FAFC] rounded-[28px] overflow-hidden flex flex-col min-h-[520px] text-slate-900 border border-slate-200">
                {/* Mock Header (Green) */}
                <div className="bg-[#10B981] p-4 text-white space-y-3 rounded-b-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] opacity-90 block">Assalamualaikum,</span>
                      <span className="text-xs font-bold block">
                        {selectedRole === 'Wali Santri' ? 'Bapak/Ibu Wali' : `Pengguna ${selectedRole}`}
                      </span>
                    </div>
                    <span className="text-[9px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-semibold">
                      {selectedRole}
                    </span>
                  </div>

                  {/* Financial Balance Card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 space-y-1">
                    <span className="text-[9px] opacity-80 block">
                      {selectedRole === 'Wali Santri' ? 'Total Tabungan Santri' : 'Ringkasan Kas & Transaksi'}
                    </span>
                    <span className="text-sm font-extrabold tracking-tight block">
                      {selectedRole === 'Wali Santri' ? 'Rp 2.450.000' : 'Rp 18.520.000'}
                    </span>
                    <div className="flex justify-between items-center text-[9px] opacity-90 pt-1 border-t border-white/15">
                      <span>Status Sistem</span>
                      <span className="text-emerald-200">Online & Sinkron</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu Grid (4 cols) */}
                <div className="p-3 flex-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1">
                    <span>Menu Utama</span>
                    <span className="text-[9px] font-normal text-emerald-600">
                      {previewVisibleMenus.length} Menu Aktif
                    </span>
                  </div>

                  {previewVisibleMenus.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-[10px] space-y-1">
                      <p className="font-semibold">Semua menu dinonaktifkan untuk {selectedRole}.</p>
                      <p className="text-[9px] text-slate-400">Aktifkan modul di sebelah kiri.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {previewVisibleMenus.map((menu) => {
                        const IconComp = ICON_MAP[menu.id] || LayoutGrid;

                        return (
                          <div
                            key={menu.id}
                            className="flex flex-col items-center gap-1 text-center p-1.5 rounded-xl bg-white border border-slate-100 shadow-2xs transition-transform hover:scale-105"
                          >
                            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <IconComp className="h-4 w-4" />
                            </div>
                            <span className="text-[9px] font-semibold text-slate-700 line-clamp-2 leading-tight">
                              {menu.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Mockup */}
                <div className="bg-white border-t border-slate-100 py-2 px-3 flex justify-around items-center text-slate-400 text-[9px]">
                  <div className="flex flex-col items-center text-emerald-600 font-bold">
                    <div className="h-1 w-4 bg-emerald-600 rounded-full mb-1" />
                    <span>Beranda</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>Mutasi</span>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center -mt-3 shadow-md shadow-emerald-600/30">
                    <span className="text-[8px] font-bold">CS</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>Info</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>Profil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
