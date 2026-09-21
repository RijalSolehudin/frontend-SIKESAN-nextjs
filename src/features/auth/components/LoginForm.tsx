'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiClient } from '@/lib/axios';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/auth/login', data, {
        baseURL: '',
      });
      
      if (response.status === 200) {
        if (response.data.user) {
          login(response.data.user);
        }
        toast.success('Berhasil masuk! Mengarahkan ke dasbor...');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Username atau kata sandi tidak sesuai.');
      } else {
        toast.error('Terjadi gangguan server. Silakan coba kembali.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md glass-card p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden border border-white/60">
      {/* Decorative top ambient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-900/20 ring-4 ring-emerald-500/10 mb-2">
          S
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Masuk ke SIKESAN
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          Sistem Informasi & Manajemen Keuangan Pondok Pesantren
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-slate-700">Username Petugas</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      aria-label="Username"
                      placeholder="Masukkan username Anda" 
                      className="pl-9 h-10 rounded-xl bg-white/70 border-slate-200 focus:bg-white transition-colors text-sm" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-slate-700">Kata Sandi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      aria-label="Password"
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-9 h-10 rounded-xl bg-white/70 border-slate-200 focus:bg-white transition-colors text-sm" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            size="lg"
            aria-label="Login"
            className="w-full mt-3 font-semibold rounded-xl text-sm shadow-md shadow-emerald-900/15" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memverifikasi...
              </>
            ) : (
              <>
                Masuk ke Dasbor
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Akses Terenkripsi & Audit Keuangan Pesantren</span>
      </div>
    </div>
  );
}
