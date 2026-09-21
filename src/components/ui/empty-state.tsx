'use client';

import * as React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = 'Belum Ada Data',
  description = 'Data untuk kategori ini belum tersedia atau tidak ditemukan.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border-dashed border-slate-200/90',
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
        {icon || <FolderOpen className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
