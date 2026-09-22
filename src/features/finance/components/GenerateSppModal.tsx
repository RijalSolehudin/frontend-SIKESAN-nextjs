'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "@/components/ui/select";
import { useGenerateSppBills } from '../api/useGenerateSppBills';

const formSchema = z.object({
  period_month: z.string().min(1, 'Bulan wajib dipilih'),
  period_year: z.string().min(1, 'Tahun wajib dipilih'),
  education_level: z.string().min(1, 'Jenjang wajib dipilih'),
});

type FormValues = z.infer<typeof formSchema>;

export function GenerateSppModal() {
  const [open, setOpen] = useState(false);
  const generateMutation = useGenerateSppBills();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period_month: (new Date().getMonth() + 1).toString(),
      period_year: currentYear.toString(),
      education_level: 'all',
    },
  });

  const onSubmit = (values: FormValues) => {
    generateMutation.mutate(
      {
        period_month: parseInt(values.period_month),
        period_year: parseInt(values.period_year),
        education_level: values.education_level === 'all' ? undefined : values.education_level,
      },
      {
        onSuccess: (res: any) => {
          toast.success(res?.message || 'SPP berhasil digenerate');
          setOpen(false);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Gagal generate tagihan SPP');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Generate Tagihan Masal
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Generate Tagihan SPP Masal
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Pilih periode bulan dan tahun ajaran untuk membuat tagihan SPP bagi santri berstatus aktif.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Bulan Periode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl bg-white">
                          <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[220px]">
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Tahun Periode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl bg-white">
                          <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="education_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Target Jenjang Pendidikan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl bg-white">
                        <SelectValue placeholder="Semua Jenjang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenjang (SD, SMP, SMA)</SelectItem>
                      <SelectItem value="SD">Hanya Jenjang SD</SelectItem>
                      <SelectItem value="SMP">Hanya Jenjang SMP</SelectItem>
                      <SelectItem value="SMA">Hanya Jenjang SMA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              Tagihan yang sudah terbit pada periode yang sama tidak akan terduplikasi.
            </div>

            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={generateMutation.isPending}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={generateMutation.isPending}
                className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {generateMutation.isPending ? 'Memproses...' : 'Generate Tagihan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
