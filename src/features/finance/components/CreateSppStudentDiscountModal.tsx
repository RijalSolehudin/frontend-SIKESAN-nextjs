'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { Input } from '@/components/ui/input';
import { HeartHandshake } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentSearchCombobox } from './StudentSearchCombobox';
import { useCreateSppConfiguration } from '../api/useSppConfigurations';
import { AcademicYear } from '@/features/master-data/types';

const formSchema = z.object({
  student_id: z.string().min(1, 'Santri wajib dipilih'),
  academic_year_id: z.string().min(1, 'Tahun ajaran wajib dipilih'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Nominal harus berupa angka 0 atau lebih',
  }),
  notes: z.string().min(3, 'Alasan/keterangan keringanan wajib diisi (min 3 karakter)'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSppStudentDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYears: AcademicYear[];
  defaultAcademicYearId?: number;
}

export function CreateSppStudentDiscountModal({
  open,
  onOpenChange,
  academicYears,
  defaultAcademicYearId,
}: CreateSppStudentDiscountModalProps) {
  const createMutation = useCreateSppConfiguration();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: '',
      academic_year_id: defaultAcademicYearId ? defaultAcademicYearId.toString() : '',
      amount: '',
      notes: '',
    },
  });

  // Auto-set active academic year when modal opens or academic years load
  useEffect(() => {
    if (open && defaultAcademicYearId) {
      form.setValue('academic_year_id', defaultAcademicYearId.toString());
    }
  }, [open, defaultAcademicYearId, form]);

  const resetAll = () => {
    form.reset({
      student_id: '',
      academic_year_id: defaultAcademicYearId ? defaultAcademicYearId.toString() : '',
      amount: '',
      notes: '',
    });
  };

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        student_id: parseInt(values.student_id),
        academic_year_id: parseInt(values.academic_year_id),
        amount: parseInt(values.amount),
        notes: values.notes,
      },
      {
        onSuccess: () => {
          toast.success('Keringanan tarif SPP santri berhasil disimpan');
          onOpenChange(false);
          resetAll();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Gagal menyimpan tarif khusus santri');
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
      <DialogContent className="sm:max-w-[500px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-emerald-600" />
            Tambah Keringanan / Tarif Khusus Santri
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tetapkan nominal SPP khusus bagi santri tertentu yang mendapat keringanan atau beasiswa persetujuan manajemen.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Tahun Ajaran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih Tahun Ajaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((ay) => (
                        <SelectItem key={ay.id} value={ay.id.toString()}>
                          {ay.name} {ay.is_active ? '(Aktif)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="student_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Pilih Santri</FormLabel>
                  <FormControl>
                    <StudentSearchCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Nominal Tarif SPP Khusus (Rp)
                  </FormLabel>
                  <FormControl>
                    <MoneyInput
                      placeholder="Contoh: 150,000 (Isi 0 jika gratis/beasiswa 100%)"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <p className="text-[11px] text-slate-400">
                    Santri ini akan otomatis ditagih nominal ini setiap kali tagihan bulanan diterbitkan.
                  </p>
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
                    Alasan / Keterangan Persetujuan
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Keringanan 50% yatim piatu / Rekomendasi Pengasuh"
                      className="h-10 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                className="rounded-lg"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg font-semibold"
              >
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Keringanan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
