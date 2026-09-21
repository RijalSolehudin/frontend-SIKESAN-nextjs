'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Plus, ArrowUpFromLine } from 'lucide-react';
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
import { useCreateExpense } from '../api/useCreateExpense';
import { useGetExpenseCategories } from '../api/useGetExpenseCategories';

const formSchema = z.object({
  expense_category_id: z.string().min(1, 'Kategori wajib dipilih'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Nominal harus berupa angka lebih dari 0',
  }),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  description: z.string().min(3, 'Deskripsi minimal 3 karakter'),
});

type FormValues = z.infer<typeof formSchema>;

export function RecordExpenseModal() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateExpense();
  const { data: categories } = useGetExpenseCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      expense_category_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      expense_category_id: parseInt(values.expense_category_id),
      amount: parseInt(values.amount),
      date: values.date,
      description: values.description,
    }, {
      onSuccess: () => {
        toast.success('Pengeluaran berhasil dicatat');
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal mencatat pengeluaran');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Catat Pengeluaran
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowUpFromLine className="h-5 w-5 text-rose-600" />
            Catat Pengeluaran Operasional
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Masukkan rincian beban operasional, tanggal transaksi, dan bukti pencatatan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="expense_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Kategori Biaya / Beban</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih Kategori Beban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Nominal Pengeluaran (Rp)</FormLabel>
                    <FormControl>
                      <MoneyInput 
                        placeholder="Contoh: 150,000" 
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Tanggal Pengeluaran</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-10 rounded-xl text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Keterangan Biaya</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Pembelian token listrik asrama putra" className="h-10 rounded-xl text-sm" {...field} />
                  </FormControl>
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
