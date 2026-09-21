'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Pencil, 
  Sparkles, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Building2, 
  Phone,
  KeyRound,
  Check,
  Copy
} from 'lucide-react';
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
import { User } from '../types';
import { useUpdateUser } from '../api/useUpdateUser';
import { useGetRoles } from '@/features/roles/api/useGetRoles';

const formSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  username: z.string().min(3, 'Username minimal 3 karakter').max(50)
    .regex(/^[a-z0-9_.]+$/, 'Hanya huruf kecil, angka, titik, atau garis bawah (_)'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: 'Password baru minimal 6 karakter',
  }),
  role: z.string().min(1, 'Tipe akun / role wajib dipilih'),
  is_active: z.enum(['true', 'false']),
  bank_name: z.string().optional().or(z.literal('')),
  bank_account_number: z.string().optional().or(z.literal('')),
  bank_account_holder: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  if (!user || !isOpen) return null;

  return (
    <EditUserForm 
      key={user.id} 
      user={user} 
      isOpen={isOpen} 
      onClose={onClose} 
    />
  );
}

function EditUserForm({ user, isOpen, onClose }: { user: User; isOpen: boolean; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<{
    name: string;
    username: string;
    password: string;
    role: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const updateUserMutation = useUpdateUser();
  const { data: roles } = useGetRoles();

  const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'Wali Santri';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || user.username,
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: userRole,
      is_active: user.is_active ? 'true' : 'false',
      bank_name: user.bank_name || '',
      bank_account_number: user.bank_account_number || '',
      bank_account_holder: user.bank_account_holder || '',
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
    toast.info('Password baru berhasil digenerate');
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      id: user.id,
      name: values.name,
      username: values.username.toLowerCase(),
      email: values.email ? values.email : null,
      phone: values.phone ? values.phone : null,
      password: values.password && values.password.trim() !== '' ? values.password : null,
      role: values.role,
      is_active: values.is_active === 'true',
      bank_name: values.bank_name ? values.bank_name : null,
      bank_account_number: values.bank_account_number ? values.bank_account_number : null,
      bank_account_holder: values.bank_account_holder ? values.bank_account_holder : null,
    };

    updateUserMutation.mutate(payload, {
      onSuccess: () => {
        if (payload.password) {
          setResetCredentials({
            name: values.name,
            username: values.username.toLowerCase(),
            password: payload.password,
            role: values.role,
          });
          toast.success('Profil diperbarui & password berhasil di-reset');
        } else {
          toast.success('Data user berhasil diperbarui');
          onClose();
        }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Gagal memperbarui user');
      },
    });
  };

  const handleCopyNewPassword = () => {
    if (!resetCredentials) return;
    const message = `*RESET KREDENSIAL AKUN SIKESAN*\n\n` +
      `Halo Bapak/Ibu ${resetCredentials.name},\n` +
      `Kata sandi akun sistem keuangan Anda telah diperbarui oleh Admin:\n\n` +
      `• *Username*: ${resetCredentials.username}\n` +
      `• *Password Baru*: ${resetCredentials.password}\n` +
      `• *Peran*: ${resetCredentials.role}\n\n` +
      `Silakan login dengan kata sandi baru tersebut di aplikasi SIKESAN.`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Kredensial baru disalin ke clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[560px] glass-modal p-6 max-h-[90vh] overflow-y-auto">
        {resetCredentials ? (
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto ring-8 ring-amber-50">
                <KeyRound className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Password Berhasil Di-Reset!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 max-w-sm mx-auto">
                Kredensial baru siap dibagikan kepada pengguna.
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3 font-mono text-xs border border-slate-800 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Username:</span>
                <span className="font-bold text-emerald-400 font-mono">{resetCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Password Baru:</span>
                <span className="font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">{resetCredentials.password}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peran:</span>
                <span className="text-blue-300 font-sans">{resetCredentials.role}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="default"
                onClick={handleCopyNewPassword}
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
                onClick={onClose}
                className="rounded-lg"
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-emerald-600" />
                Edit Akun & Hak Akses Pengguna
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Perbarui data profil, peran sistem, informasi perbankan, atau reset password akun.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                {/* 1. Identitas & Status */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    1. Identitas & Status Akun
                  </span>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Lengkap" className="h-9 rounded-xl text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Username Login</FormLabel>
                          <FormControl>
                            <Input className="h-9 rounded-xl text-sm font-mono" {...field} />
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
                      name="is_active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Status Akun</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 rounded-xl">
                                <SelectValue placeholder="Pilih Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Aktif (Dapat Login)</SelectItem>
                              <SelectItem value="false">Nonaktif / Ditangguhkan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Alamat Email (Opsional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@gmail.com" className="h-9 rounded-xl text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 2. Data Rekening */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-600" />
                    2. Data Rekening Bank (Opsional)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">Nama Bank</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: BSI / BCA / BRI" className="h-9 rounded-xl text-sm" {...field} />
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
                            <Input placeholder="Nomor rekening" className="h-9 rounded-xl text-sm font-mono" {...field} />
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
                        <FormLabel className="text-xs font-semibold text-slate-700">Atas Nama Pemilik</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama pemilik rekening" className="h-9 rounded-xl text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 3. Reset Password Section */}
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                      3. Reset Kata Sandi Pengguna
                    </span>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Generate Acak
                    </button>
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? 'text' : 'password'} 
                              placeholder="Kosongkan jika tidak ingin mengubah password" 
                              className="h-9 rounded-xl text-sm pr-10 bg-white" 
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
                  <p className="text-[11px] text-amber-700 leading-tight">
                    *Isi hanya jika admin ingin menetapkan kata sandi baru untuk akun ini.
                  </p>
                </div>

                <DialogFooter className="mt-6 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={updateUserMutation.isPending}
                    className="rounded-lg"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateUserMutation.isPending}
                    className="rounded-lg font-semibold"
                  >
                    {updateUserMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
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
