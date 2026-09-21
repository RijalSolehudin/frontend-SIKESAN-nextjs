import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const IS_SERVER = typeof window === 'undefined';
const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Jika di sisi server (SSR/Next API), kita bisa menembak backend langsung
// Jika di sisi client (Browser), tembak ke proxy Next.js kita agar token bisa disisipkan
const API_URL = IS_SERVER ? BACKEND_API : '/api/proxy';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const { method, url } = config;
  if (
    (method === 'post' || method === 'put' || method === 'patch') &&
    url &&
    (url.includes('/top-ups') || url.includes('/spp') || url.includes('/infaqs'))
  ) {
    config.headers['Idempotency-Key'] = uuidv4();
  }
  return config;
});

let isHandling401 = false;

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          if (!isHandling401) {
            isHandling401 = true;
            axios.post('/api/auth/logout').finally(() => {
              window.location.href = '/login';
            });
          }
        }
      } else if (status === 422) {
        if (typeof window !== 'undefined') {
          const errors = data?.errors;
          if (errors && typeof errors === 'object') {
            Object.values(errors).forEach((errMsgs: any) => {
              if (Array.isArray(errMsgs)) {
                errMsgs.forEach((msg) => toast.error(msg));
              }
            });
          } else {
            toast.error(data?.message || 'The given data was invalid.');
          }
        }
      } else if (status === 403) {
        if (typeof window !== 'undefined') {
          toast.error('Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.');
        }
      } else if (status === 500) {
        if (typeof window !== 'undefined') {
          toast.error('Terjadi kesalahan pada server.');
        }
      }
    }
    return Promise.reject(error);
  }
);
