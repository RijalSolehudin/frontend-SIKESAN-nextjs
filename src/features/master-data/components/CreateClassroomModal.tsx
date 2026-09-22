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
import { useCreateClass } from '../api/useCreateClass';

const formSchema = z.object({
  name: z.string().min(2, 'Nama kelas minimal 2 karakter').max(100, 'Nama kelas maksimal 100 karakter'),
  education_level: z.enum(['SD', 'SMP', 'SMA']).nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateClassroomModal() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateClass();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      education_level: null,
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Kelas berhasil ditambahkan');
        setOpen(false);
        form.reset({ name: '', education_level: null });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal menambahkan kelas');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Kelas
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[440px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Tambah Kelas Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Masukkan nama rombongan belajar dan jenjang pendidikan santri.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nama Kelas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Kelas 7A (Tsanawiyyah)" className="rounded-xl h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Jenjang Pendidikan</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val || null)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-10 text-sm">
                        <SelectValue placeholder="Pilih jenjang pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SD">SD / Madrasah Ibtidaiyah (MI)</SelectItem>
                      <SelectItem value="SMP">SMP / Madrasah Tsanawiyah (MTs)</SelectItem>
                      <SelectItem value="SMA">SMA / Madrasah Aliyah (MA)</SelectItem>
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Kelas'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
