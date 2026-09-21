'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat mengambil data dari server. Pastikan koneksi backend aktif.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center border-rose-200/80 bg-rose-50/40',
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-inner">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
