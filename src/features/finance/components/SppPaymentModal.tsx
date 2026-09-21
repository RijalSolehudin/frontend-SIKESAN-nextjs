'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { usePaySpp } from '../api/usePaySpp';
import { SppBill } from '../types';
import { Student } from '@/features/master-data/types';
import { CreditCard, Calendar, Check, UploadCloud, FileText, ImageIcon, X } from 'lucide-react';

const formSchema = z.object({
  total_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Nominal harus berupa angka lebih dari 0',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface SppPaymentModalProps {
  student: Student | null;
  bills: SppBill[];
  isOpen: boolean;
  onClose: () => void;
  onSuccessPayment?: (paymentId: string) => void;
}

interface SppPaymentFormProps {
  student: Student;
  bills: SppBill[];
  onClose: () => void;
  onSuccessPayment?: (paymentId: string) => void;
}

function SppPaymentForm({ student, bills, onClose, onSuccessPayment }: SppPaymentFormProps) {
  const payMutation = usePaySpp();
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const unpaidBills = bills.filter((b) => b.status !== 'PAID');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      total_amount: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal adalah 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file harus berupa JPG, PNG, WEBP, atau PDF');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setInputKey((prev) => prev + 1);
  };

  const toggleBill = (id: string) => {
    const isSelected = selectedBills.includes(id);
    let newSelected: string[];
    
    if (isSelected) {
      newSelected = selectedBills.filter((b) => b !== id);
    } else {
      newSelected = [...selectedBills, id];
    }
    
    setSelectedBills(newSelected);
    
    if (newSelected.length > 0) {
      const selectedBillsData = unpaidBills.filter((b) => newSelected.includes(b.id));
      const total = selectedBillsData.reduce((acc, curr) => acc + curr.amount_billed, 0);
      form.setValue('total_amount', total.toString());
    } else {
      form.setValue('total_amount', '');
    }
  };

  const onSubmit = (values: FormValues) => {
    if (selectedBills.length === 0) {
      toast.error('Pilih minimal 1 bulan tagihan yang ingin dibayar');
      return;
    }

    payMutation.mutate({
      student_id: student.id,
      bill_ids: selectedBills,
      total_amount: parseInt(values.total_amount),
      proof: selectedFile,
    }, {
      onSuccess: (response: any) => {
        toast.success('Pembayaran SPP berhasil dicatat (Cash/Transfer)');
        handleRemoveFile();
        const paymentId = response?.data?.id;
        if (paymentId && onSuccessPayment) {
          onSuccessPayment(paymentId);
        }
        onClose();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal mencatat pembayaran');
      },
    });
  };

  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('id-ID', { month: 'long' });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Catat Pembayaran SPP (Manual)
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          Pilih bulan tagihan yang akan dibayar oleh <strong>{student.name}</strong> (NIS: {student.nis}). Pembayaran ini dicatat sebagai penerimaan Cash/Transfer kasir.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-2 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Tagihan Belum Lunas:
          </h4>
          <span className="text-[11px] text-slate-400">
            {unpaidBills.length} bulan tertunggak
          </span>
        </div>

        {unpaidBills.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Seluruh tagihan santri ini sudah lunas!</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {unpaidBills.map((bill) => {
              const isSelected = selectedBills.includes(bill.id);
              return (
                <div 
                  key={bill.id} 
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs ring-1 ring-emerald-500/20' 
                      : 'bg-white/80 border-slate-200/80 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleBill(bill.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Bulan {getMonthName(bill.period_month)} {bill.period_year}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {bill.status === 'PARTIAL' ? 'Dibayar sebagian' : 'Belum dibayar sama sekali'}
                      </p>
                    </div>
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 tabular-nums">
                    Rp {bill.amount_billed.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-slate-700">Total Uang Diterima (Rp)</FormLabel>
                <FormControl>
                  <MoneyInput 
                    placeholder="Contoh: 200,000" 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Bukti Pembayaran / Nota Kasir Upload Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Bukti Pembayaran / Nota Kasir</span>
              <span className="text-[10px] text-slate-400 font-normal">Opsional (JPG, PNG, PDF maks 5MB)</span>
            </label>

            <input
              key={inputKey}
              id="spp-payment-proof-input"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {!selectedFile ? (
              <label
                htmlFor="spp-payment-proof-input"
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 hover:bg-emerald-50/20 rounded-xl p-3 transition-colors cursor-pointer flex items-center justify-center gap-3 text-center"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Pilih atau unggah bukti pembayaran</p>
                  <p className="text-[11px] text-slate-400">Klik di sini untuk memilih foto nota / bukti transfer</p>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-emerald-200 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      {selectedFile.type === 'application/pdf' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate max-w-[240px] text-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRemoveFile}
                  className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                  title="Hapus file bukti"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={payMutation.isPending}
              className="rounded-lg"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={payMutation.isPending || unpaidBills.length === 0}
              className="rounded-lg font-semibold"
            >
              {payMutation.isPending ? 'Memproses...' : 'Catat Pembayaran'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

export function SppPaymentModal({ student, bills, isOpen, onClose, onSuccessPayment }: SppPaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        {student && (
          <SppPaymentForm 
            key={student.id} 
            student={student} 
            bills={bills} 
            onClose={onClose} 
            onSuccessPayment={onSuccessPayment}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
