'use client';

import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value?: string | number;
  icon: ReactNode;
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
  badge?: string;
  trend?: string;
  variant?: 'emerald' | 'rose' | 'blue' | 'amber';
}

export function MetricCard({
  title,
  value,
  icon,
  isLoading,
  className,
  valueClassName,
  badge = 'Real-time',
  variant = 'emerald',
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
          dotBg: 'bg-rose-500',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
          dotBg: 'bg-blue-500',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
          dotBg: 'bg-amber-500',
        };
      default:
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          dotBg: 'bg-emerald-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group relative overflow-hidden flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        <div
          className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform duration-200',
            styles.iconBg
          )}
        >
          {icon}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Skeleton className="h-9 w-36 rounded-lg my-1" />
        ) : (
          <div
            className={cn(
              'text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900',
              valueClassName
            )}
          >
            {value}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
              styles.badgeBg
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', styles.dotBg)} />
            {badge}
          </span>
          <span className="text-[11px] text-slate-400">Sinkronisasi otomatis</span>
        </div>
      </div>
    </div>
  );
}
