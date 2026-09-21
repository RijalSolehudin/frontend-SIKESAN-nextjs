'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  GraduationCap, 
  CalendarDays, 
  School, 
  Building2, 
  Receipt, 
  ArrowDownToLine, 
  HeartHandshake, 
  ArrowUpFromLine, 
  BookOpenText,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Master Data', 
    icon: Users,
    children: [
      { name: 'Data Santri', href: '/master-data/students', icon: GraduationCap },
      { name: 'Tahun Ajaran', href: '/master-data/academic-years', icon: CalendarDays },
      { name: 'Kelas', href: '/master-data/classes', icon: School },
      { name: 'Asrama', href: '/master-data/dormitories', icon: Building2 },
    ]
  },
  { 
    name: 'Keuangan', 
    icon: Wallet,
    children: [
      { name: 'Tagihan SPP', href: '/finance/spp', icon: Receipt },
      { name: 'Top Up Saldo', href: '/finance/top-ups', icon: ArrowDownToLine },
      { name: 'Penerimaan Infaq', href: '/finance/infaq', icon: HeartHandshake },
      { name: 'Pengeluaran', href: '/finance/expenses', icon: ArrowUpFromLine },
      { name: 'Buku Besar', href: '/finance/ledger', icon: BookOpenText },
    ]
  },
  {
    name: 'Pengaturan Akses',
    icon: ShieldCheck,
    children: [
      { name: 'Manajemen User', href: '/users', icon: Users },
      { name: 'Manajemen Role', href: '/roles', icon: ShieldCheck },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 glass-sidebar z-20 min-h-screen sticky top-0 h-screen">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200/80 gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 ring-2 ring-emerald-500/20 font-bold text-lg">
          S
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">
            SIKESAN
          </span>
          <span className="text-[11px] font-medium text-emerald-600 leading-tight">
            Keuangan Santri
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 space-y-5">
        <nav className="space-y-4">
          {navigation.map((group) => {
            if (!group.children) {
              const isActive = pathname === group.href;
              return (
                <div key={group.name} className="px-1">
                  <Link
                    href={group.href!}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/10'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    )}
                  >
                    <group.icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    <span>{group.name}</span>
                  </Link>
                </div>
              );
            }

            return (
              <div key={group.name} className="space-y-1">
                <div className="px-3 py-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {group.children.map((child) => {
                    const isActive = pathname === child.href;
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-600 shadow-2xs pl-2.5'
                            : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                        )}
                      >
                        {ChildIcon && (
                          <ChildIcon
                            className={cn(
                              'h-3.5 w-3.5 shrink-0 transition-colors',
                              isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                            )}
                          />
                        )}
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-slate-200/80 mt-auto">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-emerald-300/50">
            A
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-800 truncate">
              Bendahara Pondok
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              Super Admin
            </span>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>
      </div>
    </aside>
  );
}
