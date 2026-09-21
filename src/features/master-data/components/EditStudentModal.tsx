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
} from "@/components/ui/select";
import { useUpdateStudent } from '../api/useUpdateStudent';
import { useGetClasses } from '../api/useGetClasses';
import { useGetDormitories } from '../api/useGetDormitories';
import { Student } from '../types';

const formSchema = z.object({
  nis: z.string().min(3, 'NIS minimal 3 karakter').max(50),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(255),
  entry_year: z.string().min(4, 'Tahun Masuk minimal 4 digit').refine((val) => !isNaN(Number(val)) && Number(val) >= 2000, { message: 'Tahun Masuk harus valid (>= 2000)' }),
  class_id: z.string().min(1, 'Kelas wajib dipilih'),
  dormitory_id: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']),
});

type FormValues = z.infer<typeof formSchema>;

interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditStudentModal({ student, isOpen, onClose }: EditStudentModalProps) {
  const updateMutation = useUpdateStudent();
  const { data: classes } = useGetClasses();
  const { data: dormitories } = useGetDormitories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nis: '',
      name: '',
      entry_year: '',
      class_id: '',
      dormitory_id: 'none',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (student && isOpen) {
      form.reset({
        nis: student.nis,
        name: student.name,
        entry_year: student.entry_year ? student.entry_year.toString() : new Date().getFullYear().toString(),
        class_id: student.class_id ? student.class_id.toString() : '',
        dormitory_id: student.dormitory_id ? student.dormitory_id.toString() : 'none',
        status: student.status,
      });
    }
  }, [student, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    if (!student) return;

    const payload = {
      id: student.id,
      ...values,
      entry_year: parseInt(values.entry_year),
      class_id: parseInt(values.class_id),
      dormitory_id: values.dormitory_id && values.dormitory_id !== 'none' ? parseInt(values.dormitory_id) : null,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Data santri berhasil diperbarui');
        onClose();
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal memperbarui santri');
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Edit Data Santri
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Perbarui informasi identitas, kelas, asrama, dan status santri.
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
