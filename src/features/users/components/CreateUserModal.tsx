'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Phone 
} from 'lucide-react';
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
import { useCreateUser } from '../api/useCreateUser';
import { useGetRoles } from '@/features/roles/api/useGetRoles';

const formSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  username: z.string().min(3, 'Username minimal 3 karakter').max(50)
    .regex(/^[a-z0-9_.]+$/, 'Hanya huruf kecil, angka, titik, atau garis bawah (_)'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.string().min(1, 'Tipe akun / role wajib dipilih'),
  bank_name: z.string().optional().or(z.literal('')),
  bank_account_number: z.string().optional().or(z.literal('')),
  bank_account_holder: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    username: string;
    password: string;
    role: string;
    phone?: string;
  } | null>(null);

  const createUserMutation = useCreateUser();
  const { data: roles } = useGetRoles();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'Wali Santri',
      bank_name: '',
      bank_account_number: '',
      bank_account_holder: '',
    },
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Sk${result}!`;
    form.setValue('password', generated, { shouldValidate: true });
    setShowPassword(true);
    toast.info('Password acak berhasil digenerate');
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      username: values.username.toLowerCase(),
      email: values.email ? values.email : null,
      phone: values.phone ? values.phone : null,
      password: values.password,
      role: values.role,
      is_active: true,
      bank_name: values.bank_name ? values.bank_name : null,
      bank_account_number: values.bank_account_number ? values.bank_account_number : null,
      bank_account_holder: values.bank_account_holder ? values.bank_account_holder : null,
    };

    createUserMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Akun user berhasil dibuat');
        setCreatedCredentials({
          name: values.name,
          username: values.username.toLowerCase(),
          password: values.password,
          role: values.role,
          phone: values.phone || undefined,
        });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal membuat akun user');
      },
    });
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const message = `*KREDENSIAL AKUN SIKESAN*\n\n` +
      `Halo Bapak/Ibu ${createdCredentials.name},\n` +
      `Akun sistem keuangan santri Anda telah dibuat oleh Admin:\n\n` +
      `• *Username*: ${createdCredentials.username}\n` +
      `• *Password*: ${createdCredentials.password}\n` +
      `• *Peran*: ${createdCredentials.role}\n\n` +
      `Silakan gunakan kredensial ini untuk login ke sistem SIKESAN. Demi keamanan, mohon tidak menyebarkan kredensial ini.`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Kredensial disalin ke clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedCredentials(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        handleClose();
      } else {
        setOpen(true);
      }
    }}>
      <DialogTrigger
        render={
          <Button className="shadow-sm">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Tambah User Baru
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[560px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        {createdCredentials ? (
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <UserCheck className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Akun Berhasil Dibuat!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 max-w-sm mx-auto">
                Kredensial login berikut dapat langsung Anda bagikan kepada pengguna melalui WhatsApp atau SMS.
              </DialogDescription>
            </div>

            {/* Credential Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3 font-mono text-xs border border-slate-800 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Nama Lengkap:</span>
                <span className="font-semibold text-white font-sans">{createdCredentials.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Username Login:</span>
                <span className="font-bold text-emerald-400">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Kata Sandi (Password):</span>
                <span className="font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">{createdCredentials.password}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tipe Akun / Role:</span>
                <span className="text-blue-300">{createdCredentials.role}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="default"
                onClick={handleCopyCredentials}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Kredensial Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Salin Format WhatsApp
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-lg"
              >
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                Registrasi Akun Pengguna Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Buatkan akun untuk wali santri, staf, bendahara, atau administrator baru.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                {/* 1. Kredensial & Role */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    1. Kredensial & Peran Akses
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Username Login</FormLabel>
                          <FormControl>
                            <Input placeholder="contoh: ahmad_fauzi" className="h-9 rounded-xl text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Tipe Akun / Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 rounded-xl">
                                <SelectValue placeholder="Pilih Role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles && roles.length > 0 ? (
                                roles.map((r) => (
                                  <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="Wali Santri">Wali Santri</SelectItem>
                                  <SelectItem value="Bendahara">Bendahara</SelectItem>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-semibold text-slate-700">Kata Sandi Awal</FormLabel>
                          <button
                            type="button"
                            onClick={generateRandomPassword}
                            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            Generate Acak
                          </button>
                        </div>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? 'text' : 'password'} 
                              placeholder="Minimal 6 karakter" 
                              className="h-9 rounded-xl text-sm pr-10" 
                              {...field} 
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 2. Data Diri & Kontak */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    2. Data Diri & Kontak Pengguna
                  </span>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: H. Ahmad Fauzi, M.Pd" className="h-9 rounded-xl text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            No. WhatsApp / HP
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="081234567890" className="h-9 rounded-xl text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Email (Opsional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="user@gmail.com" className="h-9 rounded-xl text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 3. Data Rekening Bank */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-600" />
                    3. Data Rekening Bank (Opsional)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Nama Bank</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: BSI / BCA / BRI / Mandiri" className="h-9 rounded-xl text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bank_account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Nomor Rekening</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: 7123456789" className="h-9 rounded-xl text-sm font-mono" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bank_account_holder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Atas Nama Pemilik Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Ahmad Fauzi" className="h-9 rounded-xl text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={createUserMutation.isPending}
                    className="rounded-lg"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending}
                    className="rounded-lg font-semibold"
                  >
                    {createUserMutation.isPending ? 'Membuat Akun...' : 'Simpan & Buat Akun'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
