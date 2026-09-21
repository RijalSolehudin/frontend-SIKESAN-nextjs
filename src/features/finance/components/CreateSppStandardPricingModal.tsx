'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { Input } from '@/components/ui/input';
import { Sliders } from 'lucide-react';
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
import { useCreateSppConfiguration } from '../api/useSppConfigurations';
import { AcademicYear, Classroom } from '@/features/master-data/types';

const formSchema = z.object({
  academic_year_id: z.string().min(1, 'Tahun ajaran wajib dipilih'),
  scope: z.enum(['all', 'class']),
  class_id: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Nominal harus berupa angka lebih dari 0',
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSppStandardPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYears: AcademicYear[];
  classes: Classroom[];
  defaultAcademicYearId?: number;
}

export function CreateSppStandardPricingModal({
  open,
  onOpenChange,
  academicYears,
  classes,
  defaultAcademicYearId,
}: CreateSppStandardPricingModalProps) {
  const createMutation = useCreateSppConfiguration();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academic_year_id: defaultAcademicYearId ? defaultAcademicYearId.toString() : '',
      scope: 'all',
      class_id: '',
      amount: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && defaultAcademicYearId) {
      form.setValue('academic_year_id', defaultAcademicYearId.toString());
    }
  }, [open, defaultAcademicYearId, form]);

  const scope = form.watch('scope');

  const resetAll = () => {
    form.reset({
      academic_year_id: defaultAcademicYearId ? defaultAcademicYearId.toString() : '',
      scope: 'all',
      class_id: '',
      amount: '',
      notes: '',
    });
  };

  const onSubmit = (values: FormValues) => {
    const classIdNum = values.scope === 'class' && values.class_id ? parseInt(values.class_id) : null;

    createMutation.mutate(
      {
        academic_year_id: parseInt(values.academic_year_id),
        class_id: classIdNum,
        student_id: null,
        amount: parseInt(values.amount),
        notes: values.notes || null,
      },
      {
        onSuccess: () => {
          toast.success('Tarif SPP standar berhasil ditetapkan');
          onOpenChange(false);
          resetAll();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Gagal menetapkan tarif SPP');
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
      <DialogContent className="sm:max-w-[480px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-emerald-600" />
            Atur Tarif SPP Standar
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tetapkan tarif default SPP per Tahun Ajaran atau bedakan tarif untuk tingkatan kelas tertentu.
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
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Cakupan Tarif</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih Cakupan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Default Semua Kelas (Umum)</SelectItem>
                      <SelectItem value="class">Khusus Kelas Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {scope === 'class' && (
              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Pilih Kelas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih Kelas Spesifik" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Nominal Tarif SPP Bulanan (Rp)
                  </FormLabel>
                  <FormControl>
                    <MoneyInput
                      placeholder="Contoh: 250,000"
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Keterangan (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Kenaikan tarif santri baru angkatan 2026"
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
                {createMutation.isPending ? 'Menyimpan...' : 'Tetapkan Tarif'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
