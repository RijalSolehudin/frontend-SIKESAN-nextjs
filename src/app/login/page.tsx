import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen mesh-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ambient blurred orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      
      <LoginForm />
    </main>
  );
}
