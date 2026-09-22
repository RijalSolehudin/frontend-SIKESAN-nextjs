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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateClass } from '../api/useUpdateClass';
import { Classroom } from '../types';

const formSchema = z.object({
  name: z.string().min(2, 'Nama kelas minimal 2 karakter').max(100, 'Nama kelas maksimal 100 karakter'),
  education_level: z.enum(['SD', 'SMP', 'SMA']).nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClassroomModalProps {
  classroom: Classroom | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditClassroomModal({ classroom, isOpen, onClose }: EditClassroomModalProps) {
  const updateMutation = useUpdateClass();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      education_level: null,
    },
  });

  useEffect(() => {
    if (classroom && isOpen) {
      form.reset({
        name: classroom.name,
        education_level: classroom.education_level ?? null,
      });
    }
  }, [classroom, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    if (!classroom) return;

    updateMutation.mutate(
      {
        id: classroom.id,
        name: values.name,
        education_level: values.education_level ?? null,
      },
      {
        onSuccess: () => {
          toast.success('Kelas berhasil diperbarui');
          onClose();
          form.reset();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Gagal memperbarui kelas');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] glass-modal p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Edit Nama Kelas
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Perbarui nama Ruang Belajar atau tingkatan jenjang pendidikan santri.
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
                    <Input placeholder="Contoh: Kelas 10 A" className="rounded-xl h-10 text-sm" {...field} />
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
