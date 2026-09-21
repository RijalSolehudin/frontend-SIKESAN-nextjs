import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Teruskan request kredensial ke Backend Laravel
    const backendResponse = await axios.post(`${BACKEND_URL}/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const data = backendResponse.data;

    // Jika sukses dan Backend mengembalikan access_token
    if (data.access_token) {
      const cookieStore = await cookies();
      
      // Simpan JWT di HTTP-Only Cookie untuk mengamankan dari XSS
      cookieStore.set('sikesan_session', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      // Kembalikan response sukses ke client (hanya data user, tanpa token)
      return NextResponse.json(
        { user: data.user, message: 'Login successful' },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Invalid response from backend' }, { status: 500 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Internal Server Error' };
    
    return NextResponse.json(data, { status });
  }
}
