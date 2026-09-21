'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Plus, HeartHandshake, UploadCloud, FileText, ImageIcon, X } from 'lucide-react';
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
import { useCreateInfaq } from '../api/useCreateInfaq';
import { useGetInfaqCategories } from '../api/useGetInfaqCategories';
import { useGetStudents } from '@/features/master-data/api/useGetStudents';

const formSchema = z.object({
  student_id: z.string().optional(),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Nominal harus berupa angka lebih dari 0',
  }),
  payment_method: z.enum(['TRANSFER', 'CASH']),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RecordInfaqModal() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const createMutation = useCreateInfaq();
  const { data: categories } = useGetInfaqCategories();
  const { data: studentsData } = useGetStudents({ per_page: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      student_id: '0',
      category_id: '',
      amount: '',
      payment_method: 'CASH',
      note: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal adalah 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file harus berupa JPG, PNG, WEBP, atau PDF');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setInputKey((prev) => prev + 1);
  };

  const resetAll = () => {
    form.reset();
    handleRemoveFile();
  };

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      student_id: values.student_id === '0' || !values.student_id ? undefined : parseInt(values.student_id),
      category_id: parseInt(values.category_id),
      amount: parseInt(values.amount),
      payment_method: values.payment_method,
      note: values.note,
      proof: selectedFile,
    }, {
      onSuccess: () => {
        toast.success('Penerimaan Infaq berhasil dicatat');
        setOpen(false);
        resetAll();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal mencatat Infaq');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Catat Infaq
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-emerald-600" />
            Catat Penerimaan Infaq & Shadaqah
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Masukkan data donatur, peruntukan kategori, serta nominal yang diterima.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Atas Nama Santri / Umum</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || '0'}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih Santri atau Umum" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[220px]">
                      <SelectItem value="0">Hamba Allah / Umum (Bukan Santri)</SelectItem>
                      {studentsData?.data.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          Santri: {student.name} ({student.nis})
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Kategori Infaq</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih Kategori" />
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

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Metode Penyetoran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih Metode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Tunai (Kasir Bendahara)</SelectItem>
                        <SelectItem value="TRANSFER">Transfer Rekening Bank</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Nominal Infaq (Rp)</FormLabel>
                  <FormControl>
                    <MoneyInput 
                      placeholder="Contoh: 50,000" 
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Catatan / Doa Donatur (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Untuk pembangunan asrama santri" className="h-10 rounded-xl text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Bukti Pembayaran / Nota Infaq Upload Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Bukti Transfer / Nota Infaq</span>
                <span className="text-[10px] text-slate-400 font-normal">Opsional (JPG, PNG, PDF maks 5MB)</span>
              </label>

              <input
                key={inputKey}
                id="infaq-proof-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <label
                  htmlFor="infaq-proof-input"
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 hover:bg-emerald-50/20 rounded-xl p-3 transition-colors cursor-pointer flex items-center justify-center gap-3 text-center"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <UploadCloud className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700">Pilih atau unggah bukti pembayaran</p>
                    <p className="text-[11px] text-slate-400">Klik di sini untuk memilih foto nota / bukti transfer</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {previewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-10 w-10 rounded-lg object-cover border border-emerald-200 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                        {selectedFile.type === 'application/pdf' ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate max-w-[240px] text-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRemoveFile}
                    className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                    title="Hapus file bukti"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Infaq'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
