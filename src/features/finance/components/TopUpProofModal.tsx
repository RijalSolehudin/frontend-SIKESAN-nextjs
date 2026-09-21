'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TopUpRequest } from '../types';
import { Receipt, ExternalLink, Calendar, CreditCard, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopUpProofModalProps {
  topUp: TopUpRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopUpProofModal({ topUp, open, onOpenChange }: TopUpProofModalProps) {
  if (!topUp) return null;

  const proofUrl = topUp.proof_full_url || topUp.proof_url || '';
  const isPdf = proofUrl.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Bukti Pembayaran / Nota Top-Up
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Santri Pemilik</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                {topUp.student?.name || 'Santri'}
              </span>
              {topUp.student?.nis && (
                <span className="text-[10px] text-slate-500 font-mono">NIS: {topUp.student.nis}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nominal Top-Up</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                Rp {topUp.requested_amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Metode Pembayaran</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-slate-400" />
                {topUp.payment_method}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Tanggal Transaksi</span>
              <span className="text-slate-700 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                {new Date(topUp.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  topUp.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : topUp.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {topUp.status === 'APPROVED' ? 'Disetujui' : topUp.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
              </span>
            </div>
          </div>

          {/* Proof Image / Document Preview Area */}
          <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-2 flex flex-col items-center justify-center min-h-[260px] max-h-[420px] overflow-auto">
            {proofUrl ? (
              isPdf ? (
                <div className="text-center p-6 space-y-3">
                  <FileText className="h-16 w-16 text-rose-500 mx-auto" />
                  <p className="text-xs text-slate-600">Dokumen bukti berformat PDF.</p>
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
                  alt="Bukti Pembayaran Top-Up"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-xs"
                />
              )
            ) : (
              <p className="text-xs text-slate-400">Tidak ada file bukti pembayaran yang dilampirkan.</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            {proofUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(proofUrl, '_blank')}
                className="text-xs text-slate-600 gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Ukuran Asli
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ml-auto"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
