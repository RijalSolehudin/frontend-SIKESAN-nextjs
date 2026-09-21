'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Receipt, ExternalLink, Calendar, HeartHandshake, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface InfaqProofItem {
  date: string;
  description: string;
  amount: number;
  proof_url?: string | null;
}

interface InfaqProofModalProps {
  infaq: InfaqProofItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfaqProofModal({ infaq, open, onOpenChange }: InfaqProofModalProps) {
  if (!infaq) return null;

  const proofUrl = infaq.proof_url || '';
  const isPdf = proofUrl.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Bukti Transfer / Nota Penerimaan Infaq
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Keterangan / Donatur</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HeartHandshake className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{infaq.description}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nominal Donasi</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                Rp {infaq.amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Tanggal Transaksi</span>
              <span className="text-slate-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {new Date(infaq.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Proof Image / Document Preview Area */}
          <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-2 flex flex-col items-center justify-center min-h-[260px] max-h-[420px] overflow-auto">
            {proofUrl ? (
              isPdf ? (
                <div className="text-center p-6 space-y-3">
                  <FileText className="h-16 w-16 text-rose-500 mx-auto" />
                  <p className="text-xs text-slate-600">Dokumen bukti penerimaan berformat PDF.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(proofUrl, '_blank')}
                    className="text-xs gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka PDF di Tab Baru
                  </Button>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={proofUrl}
                  alt="Bukti Transfer / Nota Infaq"
                  className="max-h-[380px] w-auto rounded-lg object-contain border border-slate-200 shadow-2xs"
                />
              )
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-1">
                <FileText className="h-10 w-10 mx-auto text-slate-300" />
                <p className="text-xs">Foto bukti transfer tidak tersedia untuk transaksi ini.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            {proofUrl && !isPdf ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(proofUrl, '_blank')}
                className="text-xs text-slate-500 hover:text-emerald-700 gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Buka Gambar Penuh</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-lg"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
