'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';
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
import { useCreateSppConfiguration } from '../api/useSppConfigurations';

const formSchema = z.object({
  entry_year: z.string().min(4, 'Tahun Masuk minimal 4 digit').refine((val) => !isNaN(Number(val)) && Number(val) >= 2000, {
    message: 'Tahun Masuk harus valid (>= 2000)',
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Nominal harus berupa angka lebih dari 0',
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSppStandardPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEntryYear?: number;
}

export function CreateSppStandardPricingModal({
  open,
  onOpenChange,
  defaultEntryYear,
}: CreateSppStandardPricingModalProps) {
  const createMutation = useCreateSppConfiguration();

  const currentYear = new Date().getFullYear();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      entry_year: defaultEntryYear ? defaultEntryYear.toString() : currentYear.toString(),
      amount: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (defaultEntryYear) {
        form.setValue('entry_year', defaultEntryYear.toString());
      }
    }
  }, [open, defaultEntryYear, form]);

  const resetAll = () => {
    form.reset({
      entry_year: defaultEntryYear ? defaultEntryYear.toString() : currentYear.toString(),
      amount: '',
      notes: '',
    });
  };

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        entry_year: parseInt(values.entry_year),
        student_id: null,
        amount: parseInt(values.amount),
        notes: values.notes || null,
      },
      {
        onSuccess: () => {
          toast.success(`Tarif SPP Angkatan ${values.entry_year} berhasil disimpan`);
          onOpenChange(false);
          resetAll();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Gagal menyimpan tarif SPP angkatan');
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetAll();
      }}
    >
      <DialogContent className="sm:max-w-[460px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            Atur Tarif SPP Angkatan
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tetapkan tarif SPP standar untuk angkatan/tahun masuk tertentu. Tarif ini akan tetap berlaku selama masa pendidikan santri angkatan tersebut.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="entry_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Tahun Masuk / Angkatan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Contoh: 2026"
                      className="h-10 rounded-xl text-sm"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[11px] text-slate-400">
                    Santri yang terdaftar dengan tahun masuk ini akan ditagih tarif ini.
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nominal SPP per Bulan</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Masukkan nominal, contoh: 150.000"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Catatan Kebijakan <span className="text-slate-400 font-normal">(Opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Misal: Kenaikan tarif angkatan baru SK No. 12/2026"
                      className="h-10 rounded-xl text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetAll();
                }}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
              >
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Tarif Angkatan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
