'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BreakdownItem } from '../types/annual-fees';
import { FileText, School } from 'lucide-react';

interface AnnualFeeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items?: BreakdownItem[] | null;
  totalAmount: number;
}

export function AnnualFeeBreakdownModal({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  totalAmount,
}: AnnualFeeBreakdownModalProps) {
  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] glass-modal p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white/70">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-2.5">Komponen Pos Biaya</th>
                  <th className="px-4 py-2.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items && items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-2.5 font-medium">{item.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatRupiah(item.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-slate-400 italic">
                      Tidak ada rincian pos komponen (tarif global)
                    </td>
                  </tr>
                )}
                <tr className="bg-emerald-50/50 font-bold border-t border-emerald-200/80">
                  <td className="px-4 py-3 text-emerald-900">Total Biaya Tahunan</td>
                  <td className="px-4 py-3 text-right text-emerald-800 font-mono text-sm">
                    {formatRupiah(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
