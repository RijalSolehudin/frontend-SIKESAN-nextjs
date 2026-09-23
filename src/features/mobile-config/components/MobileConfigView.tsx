'use client';

import { useState, useMemo } from 'react';
import { useGetMobileMenus } from '../api/useGetMobileMenus';
import { useUpdateMobileMenus } from '../api/useUpdateMobileMenus';
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
  const { data: serverMenus, isLoading, isError, refetch } = useGetMobileMenus();
  const updateMutation = useUpdateMobileMenus();

  // Local draft overrides to enable reactive editing without effect synchronization
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [previewRole, setPreviewRole] = useState<string>('Wali Santri');

  // Merged menus with local overrides
  const effectiveMenus = useMemo(() => {
    if (!serverMenus) return [];
    return serverMenus.map((item) => ({
      ...item,
      is_enabled: overrides[item.id] !== undefined ? overrides[item.id] : item.is_enabled,
    }));
  }, [serverMenus, overrides]);

  // Check if there are unsaved local modifications
  const hasChanges = useMemo(() => {
    if (!serverMenus) return false;
    return Object.keys(overrides).length > 0 && serverMenus.some((m) => {
      return overrides[m.id] !== undefined && overrides[m.id] !== m.is_enabled;
    });
  }, [serverMenus, overrides]);

  // Toggle individual menu
  const handleToggle = (id: string, checked: boolean) => {
    setOverrides((prev) => ({ ...prev, [id]: checked }));
  };

  // Bulk actions
  const handleEnableAll = () => {
    if (!serverMenus) return;
    const nextOverrides: Record<string, boolean> = {};
    serverMenus.forEach((m) => {
      nextOverrides[m.id] = true;
    });
    setOverrides(nextOverrides);
  };

  const handleDisableAll = () => {
    if (!serverMenus) return;
    const nextOverrides: Record<string, boolean> = {};
    serverMenus.forEach((m) => {
      nextOverrides[m.id] = false;
    });
    setOverrides(nextOverrides);
  };

  const handleReset = () => {
    setOverrides({});
  };

  const handleSave = () => {
    updateMutation.mutate(effectiveMenus, {
      onSuccess: () => {
        setOverrides({});
      },
    });
  };

  // Filtered menus for the table/list
  const filteredMenus = useMemo(() => {
    return effectiveMenus.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.allowedRoles && item.allowedRoles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [effectiveMenus, searchQuery, selectedCategory]);

  // Counts
  const activeCount = useMemo(
    () => effectiveMenus.filter((m) => m.is_enabled).length,
    [effectiveMenus]
  );
  const inactiveCount = useMemo(
    () => effectiveMenus.filter((m) => !m.is_enabled).length,
    [effectiveMenus]
  );

  // Filter menus visible in the Mobile Preview based on previewRole
  const previewVisibleMenus = useMemo(() => {
    return effectiveMenus.filter((item) => {
      if (!item.is_enabled) return false;
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      const normRole = previewRole.toLowerCase();
      return item.allowedRoles.some((r) => r.toLowerCase() === normRole || normRole.includes(r.toLowerCase()));
    });
  }, [effectiveMenus, previewRole]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Smartphone className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Konfigurasi UI Dinamis Mobile
            </h1>
            {hasChanges && (
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                Ada Perubahan Belum Disimpan
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Aktifkan atau nonaktifkan modul menu yang tampil di aplikasi mobile Flutter SIKESAN secara real-time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-xs text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {updateMutation.isPending ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Modul Mobile"
          value={`${effectiveMenus.length} Modul`}
          icon={<LayoutGrid className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Katalog Menu"
          valueClassName="text-slate-900 text-2xl font-extrabold"
        />
        <MetricCard
          title="Modul Aktif"
          value={`${activeCount} Modul`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoading}
          variant="emerald"
          badge="Aktif di Mobile"
          valueClassName="text-emerald-700 text-2xl font-extrabold"
        />
        <MetricCard
          title="Modul Dinonaktifkan"
          value={`${inactiveCount} Modul`}
          icon={<XCircle className="h-4 w-4" />}
          isLoading={isLoading}
          variant="rose"
          badge="Disembunyikan"
          valueClassName="text-rose-700 text-2xl font-extrabold"
        />
      </div>

      {/* Main Content: Config List & Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls & Menu Table (7 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari modul atau peran..."
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
                  onClick={handleEnableAll}
                  className="text-[11px] h-9 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  Aktifkan Semua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableAll}
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

          {/* Menu Items List */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Memuat katalog modul mobile...</span>
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada modul yang cocok dengan kriteria pencarian.
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
                        {/* Target Roles */}
                        {item.allowedRoles && item.allowedRoles.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">Akses:</span>
                            {item.allowedRoles.map((role) => (
                              <span
                                key={role}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
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
                          {item.is_enabled ? 'Tampil' : 'Sembunyikan'}
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
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Aplikasi Mobile
                </h3>
              </div>
              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Preview
              </span>
            </div>

            {/* Role Switcher for Preview */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Simulasi Role:</span>
              <select
                value={previewRole}
                onChange={(e) => setPreviewRole(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Wali Santri">Wali Santri</option>
                <option value="Kasir">Kasir</option>
                <option value="Staff Kesantrian">Staff Kesantrian</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
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
                      <span className="text-xs font-bold block">Bapak/Ibu Wali</span>
                    </div>
                    <span className="text-[9px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-semibold">
                      {previewRole}
                    </span>
                  </div>

                  {/* Financial Balance Card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 space-y-1">
                    <span className="text-[9px] opacity-80 block">Total Tabungan Santri</span>
                    <span className="text-sm font-extrabold tracking-tight block">Rp 2.450.000</span>
                    <div className="flex justify-between items-center text-[9px] opacity-90 pt-1 border-t border-white/15">
                      <span>Tagihan SPP: Rp 0</span>
                      <span className="text-emerald-200">Lunas</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu Grid (4 cols) */}
                <div className="p-3 flex-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1">
                    <span>Menu Utama</span>
                    <span className="text-[9px] font-normal text-emerald-600">
                      {previewVisibleMenus.length} Tampil
                    </span>
                  </div>

                  {previewVisibleMenus.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-[10px] space-y-1">
                      <p>Semua menu disembunyikan untuk role ini.</p>
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
