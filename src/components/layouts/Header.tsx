'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Menu, LogOut, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.includes('/master-data/students')) return 'Data Santri';
  if (pathname.includes('/master-data/academic-years')) return 'Tahun Ajaran';
  if (pathname.includes('/master-data/classes')) return 'Kelas';
  if (pathname.includes('/master-data/dormitories')) return 'Asrama';
  if (pathname.includes('/finance/spp')) return 'Tagihan SPP';
  if (pathname.includes('/finance/top-ups')) return 'Top Up Saldo';
  if (pathname.includes('/finance/infaq')) return 'Penerimaan Infaq';
  if (pathname.includes('/finance/expenses')) return 'Pengeluaran';
  if (pathname.includes('/finance/ledger')) return 'Buku Besar';
  if (pathname.includes('/roles')) return 'Manajemen Role & Hak Akses';
  return 'Dashboard';
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    logout();
    toast.success('Berhasil keluar');
    router.push('/login');
    router.refresh();
  };

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass-header px-4 sm:px-6 shadow-2xs">
      {/* Mobile Menu Trigger */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5 text-slate-700" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="w-72 p-0 glass-modal">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SheetDescription className="sr-only">Navigasi aplikasi SIKESAN</SheetDescription>
          <div className="flex h-16 items-center border-b border-slate-200/80 px-6 gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            <div className="font-bold text-lg text-slate-900 tracking-tight">
              SIKESAN
            </div>
          </div>
          <div className="p-4 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <Button variant="ghost" className="justify-start w-full text-slate-700" onClick={() => router.push('/')}>
              Dashboard
            </Button>
            
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master Data</div>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/master-data/students')}>Data Santri</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/master-data/academic-years')}>Tahun Ajaran</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/master-data/classes')}>Kelas</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/master-data/dormitories')}>Asrama</Button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keuangan</div>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/finance/spp')}>Tagihan SPP</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/finance/top-ups')}>Top Up Saldo</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/finance/infaq')}>Penerimaan Infaq</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/finance/expenses')}>Pengeluaran</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/finance/ledger')}>Buku Besar</Button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengaturan Akses</div>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/users')}>Manajemen User</Button>
            <Button variant="ghost" className="justify-start pl-6 w-full text-slate-600 text-xs" onClick={() => router.push('/roles')}>Manajemen Role</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">SIKESAN</span>
        <span className="text-xs text-slate-300 hidden sm:inline-block">/</span>
        <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
          {getPageTitle(pathname)}
        </h2>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Date Pill Widget */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 font-medium">
        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
        <span>{currentDate}</span>
      </div>

      {/* Active System Pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium">
        <Sparkles className="h-3 w-3" />
        <span>Sistem Aktif</span>
      </div>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 hover:ring-2 hover:ring-emerald-500/30 transition-all">
              <Avatar className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm font-semibold text-xs">
                <AvatarFallback className="bg-transparent text-white font-bold">
                  {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56 glass-modal rounded-xl p-1 shadow-xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-slate-800">
                  {user?.name || user?.username || 'Petugas SIKESAN'}
                </p>
                <p className="text-xs leading-none text-slate-500">
                  {user?.email || 'petugas@sikesan.id'}
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-700 rounded-lg px-3 py-2 text-xs font-medium"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar Aplikasi</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
