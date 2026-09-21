import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'sikesan_session',
    path: '/',
  });
  cookieStore.set('sikesan_session', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return NextResponse.json({ message: 'Logged out successfully' });
}
