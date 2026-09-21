import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth');
  
  // Ambil token dari session cookie yang diset oleh BFF
  const token = request.cookies.get('sikesan_session')?.value;

  // Cek untuk public route
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Jika tidak ada token (belum login), redirect ke halaman login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Karena Laravel menggunakan Sanctum (Opaque Token seperti "1|abcdef..."),
    // kita tidak bisa memverifikasinya sebagai JWT.
    // Verifikasi cukup mengandalkan eksistensi token di sisi Middleware,
    // dan jika token ternyata sudah tidak valid di backend, Axios Interceptor
    // akan menangkap error 401 dan memaksa logout.
    return NextResponse.next();
  } catch {
    // Fallback error handling
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('sikesan_session');
    return response;
  }
}

export const config = {
  matcher: [
    // Jalankan middleware ini di semua route kecuali Next.js internals dan aset statis
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
