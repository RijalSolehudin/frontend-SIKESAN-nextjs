'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useUpdateDormitory } from '../api/useUpdateDormitory';
import { Dormitory } from '../types';

const formSchema = z.object({
  name: z.string().min(3, 'Nama asrama minimal 3 karakter').max(100, 'Nama asrama maksimal 100 karakter'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDormitoryModalProps {
  dormitory: Dormitory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDormitoryModal({ dormitory, isOpen, onClose }: EditDormitoryModalProps) {
  const updateMutation = useUpdateDormitory();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (dormitory && isOpen) {
      form.reset({ name: dormitory.name });
    }
  }, [dormitory, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    if (!dormitory) return;
    
    updateMutation.mutate({ id: dormitory.id, name: values.name }, {
      onSuccess: () => {
        toast.success('Asrama berhasil diperbarui');
        onClose();
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal memperbarui asrama');
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Edit Nama Asrama
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Perbarui nama gedung asrama santri mukim.
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
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="rounded-lg"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="rounded-lg font-semibold"
              >
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
