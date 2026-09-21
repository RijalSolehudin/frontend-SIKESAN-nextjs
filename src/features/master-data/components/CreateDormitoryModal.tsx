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
import { useCreateDormitory } from '../api/useCreateDormitory';

const formSchema = z.object({
  name: z.string().min(3, 'Nama asrama minimal 3 karakter').max(100, 'Nama asrama maksimal 100 karakter'),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateDormitoryModal() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateDormitory();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Asrama berhasil ditambahkan');
        setOpen(false);
        form.reset({ name: '' });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal menambahkan asrama');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Asrama
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[440px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Tambah Asrama Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Masukkan nama gedung asrama santri mukim.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nama Asrama</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Asrama Putra Al-Fatih" className="rounded-xl h-10 text-sm" {...field} />
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Asrama'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
