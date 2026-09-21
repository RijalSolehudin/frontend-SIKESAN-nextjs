'use client';

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type DatePreset = 'all' | 'today' | '30_days' | 'custom';

export interface DateFilterValue {
  preset: DatePreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

interface DateRangeFilterProps {
  value?: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  className?: string;
  defaultPreset?: DatePreset;
}

/**
 * Format Date object to local YYYY-MM-DD string
 */
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateRangeFilter({
  value,
  onChange,
  className = '',
  defaultPreset = 'all',
}: DateRangeFilterProps) {
  const [internalPreset, setInternalPreset] = useState<DatePreset>(defaultPreset);
  const [customStart, setCustomStart] = useState<string>(value?.startDate || '');
  const [customEnd, setCustomEnd] = useState<string>(value?.endDate || '');

  const preset = value?.preset ?? internalPreset;

  const handlePresetChange = (newPreset: string) => {
    const p = newPreset as DatePreset;
    setInternalPreset(p);

    const now = new Date();
    const todayStr = toLocalDateString(now);

    if (p === 'today') {
      onChange({
        preset: 'today',
        startDate: todayStr,
        endDate: todayStr,
      });
    } else if (p === '30_days') {
      const past30 = new Date(now);
      past30.setDate(now.getDate() - 30);
      onChange({
        preset: '30_days',
        startDate: toLocalDateString(past30),
        endDate: todayStr,
      });
    } else if (p === 'all') {
      onChange({
        preset: 'all',
        startDate: undefined,
        endDate: undefined,
      });
    } else if (p === 'custom') {
      // Keep existing custom inputs or set defaults
      const start = customStart || toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      const end = customEnd || todayStr;
      setCustomStart(start);
      setCustomEnd(end);
      onChange({
        preset: 'custom',
        startDate: start,
        endDate: end,
      });
    }
  };

  const handleCustomStartChange = (val: string) => {
    setCustomStart(val);
    if (preset === 'custom') {
      onChange({
        preset: 'custom',
        startDate: val || undefined,
        endDate: customEnd || undefined,
      });
    }
  };

  const handleCustomEndChange = (val: string) => {
    setCustomEnd(val);
    if (preset === 'custom') {
      onChange({
        preset: 'custom',
        startDate: customStart || undefined,
        endDate: val || undefined,
      });
    }
  };

  const handleReset = () => {
    setInternalPreset('all');
    setCustomStart('');
    setCustomEnd('');
    onChange({
      preset: 'all',
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* Preset Selector Dropdown */}
      <div className="w-44">
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs font-medium shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
              <SelectValue placeholder="Pilih Periode" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Waktu</SelectItem>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="30_days">30 Hari Terakhir</SelectItem>
            <SelectItem value="custom">Rentang Kustom...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Pickers appear when 'custom' is selected */}
      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Dari:</span>
              <Input
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(e) => handleCustomStartChange(e.target.value)}
                className="h-7 w-32 border-0 p-0 text-xs text-slate-700 font-medium focus-visible:ring-0 shadow-none bg-transparent"
              />
            </div>
            <span className="text-slate-400 text-xs font-semibold px-0.5">-</span>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Sampai:</span>
              <Input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(e) => handleCustomEndChange(e.target.value)}
                className="h-7 w-32 border-0 p-0 text-xs text-slate-700 font-medium focus-visible:ring-0 shadow-none bg-transparent"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs text-slate-500 hover:text-rose-600 rounded-lg"
            title="Reset ke Semua Waktu"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
