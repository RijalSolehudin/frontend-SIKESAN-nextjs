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
} from '@/components/ui/select';
import { useCreateAcademicYear } from '../api/useCreateAcademicYear';

const formSchema = z.object({
  name: z.string().min(3, 'Nama tahun ajaran minimal 3 karakter').max(50, 'Maksimal 50 karakter'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().min(1, 'Tanggal berakhir wajib diisi'),
  is_active: z.enum(['true', 'false']),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateAcademicYearModal() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateAcademicYear();

  const currentYear = new Date().getFullYear();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      start_date: `${currentYear}-07-01`,
      end_date: `${currentYear + 1}-06-30`,
      is_active: 'true',
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      name: values.name,
      start_date: values.start_date,
      end_date: values.end_date,
      is_active: values.is_active === 'true',
    }, {
      onSuccess: () => {
        toast.success('Tahun ajaran berhasil ditambahkan');
        setOpen(false);
        form.reset({ 
          name: '', 
          start_date: `${currentYear}-07-01`, 
          end_date: `${currentYear + 1}-06-30`, 
          is_active: 'true' 
        });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal menambahkan tahun ajaran');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Tahun Ajaran
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[460px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Tambah Tahun Ajaran Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Masukkan format nama tahun ajaran dan periode kalender operasional.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nama Tahun Ajaran</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 2025/2026" className="rounded-xl h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Status Operasional</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Aktif Berjalan</SelectItem>
                      <SelectItem value="false">Tidak Aktif</SelectItem>
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
