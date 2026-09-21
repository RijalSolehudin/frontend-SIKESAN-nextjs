import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function GET() {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/auth/login`,
      {
        username: 'superadmin',
        password: 'password',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (res.data.access_token) {
      const cookieStore = await cookies();
      cookieStore.set('sikesan_session', res.data.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      return NextResponse.json({ ok: true, user: res.data.user });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.response?.data || e.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: false, message: 'No access token returned' }, { status: 500 });
}
