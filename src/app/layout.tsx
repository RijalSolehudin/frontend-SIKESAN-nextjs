import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIKESAN - Sistem Informasi Keuangan Santri",
  description: "Web Dashboard Manajemen Keuangan, Pembayaran SPP, dan Donasi Pondok Pesantren",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased text-slate-800 bg-slate-50 min-h-screen selection:bg-emerald-500/20 selection:text-emerald-900`}
      >
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            toastOptions={{
              className: 'glass-modal border border-slate-200/90 shadow-xl rounded-xl text-xs',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
