'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
            <Trash2 className="h-6 w-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case 'success':
        return (
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  const getButtonVariant = () => {
    if (variant === 'danger') return 'destructive';
    if (variant === 'warning') return 'default';
    return 'default';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md p-6 glass-modal">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="space-y-1.5 flex-1 pt-0.5">
            <DialogTitle className="text-lg font-semibold text-slate-900 leading-snug">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-row justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg"
          >
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
