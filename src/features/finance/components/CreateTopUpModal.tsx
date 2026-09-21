'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { Plus, ArrowDownToLine } from 'lucide-react';
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
import { useCreateTopUp } from '../api/useCreateTopUp';
import { useGetStudents } from '@/features/master-data/api/useGetStudents';

const formSchema = z.object({
  student_id: z.string().min(1, 'Santri wajib dipilih'),
  requested_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Nominal harus berupa angka lebih dari 0',
  }),
  payment_method: z.enum(['TRANSFER', 'CASH']),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTopUpModal() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTopUp();
  const { data: studentsData } = useGetStudents({ per_page: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: '',
      requested_amount: '',
      payment_method: 'TRANSFER',
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      student_id: parseInt(values.student_id),
      requested_amount: parseInt(values.requested_amount),
      payment_method: values.payment_method,
    }, {
      onSuccess: () => {
        toast.success('Permintaan Top-Up berhasil dibuat');
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal membuat permintaan Top-up');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Buat Permintaan Top-Up
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
            Top Up Saldo Dompet Santri
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Catat setoran manual atau transfer bank untuk menambah saldo santri.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Pilih Santri</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih Santri" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[220px]">
                      {studentsData?.data.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.nis})
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
              name="requested_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nominal Top-Up (Rp)</FormLabel>
                  <FormControl>
                    <MoneyInput 
                      placeholder="Contoh: 100,000" 
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
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Metode Pembayaran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih Metode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRANSFER">Transfer Bank / E-Wallet</SelectItem>
                      <SelectItem value="CASH">Setoran Tunai (Kasir)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
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
                {createMutation.isPending ? 'Memproses...' : 'Kirim Permintaan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
