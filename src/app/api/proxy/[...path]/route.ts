import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios, { AxiosError } from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest('GET', request, resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest('POST', request, resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest('PUT', request, resolvedParams);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest('PATCH', request, resolvedParams);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest('DELETE', request, resolvedParams);
}

async function handleRequest(method: string, request: NextRequest, params: { path: string[] }) {
  try {
    const path = params.path ? params.path.join('/') : '';
    const searchParams = request.nextUrl.search;
    const url = `${BACKEND_URL}/${path}${searchParams}`;
    
    // Ambil session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('sikesan_session')?.value;

    const contentType = request.headers.get('content-type') || '';

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Copy idempotency key if exists
    const idempotencyKey = request.headers.get('idempotency-key');
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    let data = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      if (contentType.includes('multipart/form-data')) {
        const arrayBuffer = await request.arrayBuffer();
        data = Buffer.from(arrayBuffer);
        headers['Content-Type'] = contentType;
      } else {
        headers['Content-Type'] = 'application/json';
        try {
          data = await request.json();
        } catch {
          // Body is not JSON or empty
        }
      }
    }

    const backendResponse = await axios({
      method,
      url,
      headers,
      data,
    });

    return NextResponse.json(backendResponse.data, { status: backendResponse.status });

  } catch (error: any) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: 'Internal Server Error' };
      return NextResponse.json(data, { status });
    }
    
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
