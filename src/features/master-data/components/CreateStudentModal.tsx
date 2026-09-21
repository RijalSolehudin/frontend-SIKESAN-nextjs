'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
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
import { useCreateStudent } from '../api/useCreateStudent';
import { useGetClasses } from '../api/useGetClasses';
import { useGetDormitories } from '../api/useGetDormitories';

const formSchema = z.object({
  nis: z.string().min(1, 'NIS wajib diisi'),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(255),
  entry_year: z.string().min(4, 'Tahun Masuk minimal 4 digit').refine((val) => !isNaN(Number(val)) && Number(val) >= 2000, { message: 'Tahun Masuk harus valid (>= 2000)' }),
  class_id: z.string().min(1, 'Kelas wajib dipilih'),
  dormitory_id: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateStudentModal() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateStudent();
  const { data: classes } = useGetClasses();
  const { data: dormitories } = useGetDormitories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nis: '',
      name: '',
      entry_year: new Date().getFullYear().toString(),
      class_id: '',
      dormitory_id: 'none',
      status: 'ACTIVE',
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      entry_year: parseInt(values.entry_year),
      class_id: parseInt(values.class_id),
      dormitory_id: values.dormitory_id && values.dormitory_id !== 'none' ? parseInt(values.dormitory_id) : null,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Santri berhasil ditambahkan');
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal menambahkan santri');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Santri
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Tambah Santri Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Daftarkan santri baru ke dalam sistem keuangan pondok.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="nis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">NIS</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 2024001" className="h-10 rounded-xl text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Angkatan</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2026" className="h-10 rounded-xl text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Status Belajar</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                        <SelectItem value="GRADUATED">Lulus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nama Lengkap Santri</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Muhammad Fatih" className="h-10 rounded-xl text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Rombel / Kelas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes?.map((cls) => (
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

              <FormField
                control={form.control}
                name="dormitory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Asrama Mukim</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih Asrama" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Non-Mukim (Pulang-Pergi)</SelectItem>
                        {dormitories?.map((dorm) => (
                          <SelectItem key={dorm.id} value={dorm.id.toString()}>
                            {dorm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Data Santri'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
