# Product Requirements Document (PRD)
**Project Name:** SIKESAN (Sistem Keuangan Santri) - Web Dashboard Frontend
**Target Users:** Super Admin & Bendahara (Treasurer)
**Backend API:** Laravel 11 Modular Monolith (Existing)

---

## 1. Pendahuluan
Dokumen ini merupakan panduan spesifikasi dan arsitektur untuk pengembangan *Frontend Web Dashboard* SIKESAN. Aplikasi ini berfungsi sebagai pusat kendali (*Control Panel*) bagi staf pesantren untuk mengelola master data, menagih SPP, memverifikasi Top Up, dan melihat laporan keuangan secara *real-time*.

## 2. Tech Stack & Architecture
Sesuai standar *Enterprise*, berikut adalah *stack* yang akan digunakan:
- **Framework:** Next.js 14+ (menggunakan **App Router**)
- **Language:** TypeScript (*Strict Mode*)
- **Styling:** TailwindCSS
- **UI Component Library:** shadcn/ui (berbasis Radix UI)
- **Data Fetching (Server State):** TanStack Query (React Query) v5 + Axios
- **Client State Management:** React Context (Tidak menggunakan Zustand untuk meminimalisir kompleksitas)
- **Form Management:** React Hook Form + Zod (untuk validasi skema)
- **Architecture Pattern:** *Bulletproof React* (Hibrida / Modular Feature-Based)
- **Testing:** Playwright (End-to-End) & Vitest (Unit/Component)
- **Deployment:** Docker (Next.js Standalone Mode)

## 3. Struktur Direktori Utama (Bulletproof React)
```text
src/
├── app/              # Next.js App Router (Halaman & Layouts)
├── components/       # Komponen UI Global (Button, Table, Modal dari shadcn)
├── lib/              # Setup pihak ketiga (Axios instance, TanStack Provider)
├── types/            # Tipe data global (Typescript Interfaces)
└── features/         # Modul Bisnis (terisolasi)
    ├── auth/         # Login, Session Management
    ├── dashboard/    # Metrik & Grafik
    ├── master-data/  # Asrama, Kelas, Santri, Wali
    └── finance/      # SPP, Top Up, Infaq, Laporan Ledger
```

## 4. Kebutuhan Fungsional Utama (Sesuai Backend)

### A. Modul Autentikasi (`/features/auth`)
- **Login:** Form *username* dan *password*.
- **Role-Based Access:** Melindungi rute spesifik agar hanya bisa diakses oleh *Super Admin* atau *Bendahara*.

### B. Modul Dashboard (`/features/dashboard`)
- **Metrik Bendahara:** Menampilkan agregasi dari `/api/v1/dashboard/treasurer` (Total Saldo Global, Tunggakan SPP Keseluruhan, Total Infaq).

### C. Modul Master Data (`/features/master-data`)
- **Asrama & Kelas:** Tabel CRUD standar (mengonsumsi `/api/v1/dormitories` dan `/api/v1/classes`).
- **Data Santri:** Tabel dengan *pagination* dan *filter* (Berdasarkan status/kelas).
- **Mapping Wali Santri:** Antarmuka (*UI*) untuk Admin memetakan user (Wali Santri) ke Santri tertentu (`/api/v1/students/{id}/guardians`).

### D. Modul Keuangan (`/features/finance`)
- **Generate Tagihan SPP:** Tombol aksi (*trigger*) untuk men-generate tagihan bulanan secara massal.
- **Persetujuan Top Up:** Tabel *request Top Up* dengan status `PENDING`. Terdapat aksi "Approve".
- **Pembayaran SPP Manual:** Form untuk Bendahara membayarkan SPP santri secara manual (memotong dari dompet santri terkait).
- **Buku Besar (Ledger):** Tabel riwayat mutasi campuran (dari Wallet, SPP, Infaq) menggunakan endpoint `/api/v1/reports/ledger`.

5. **Keputusan Arsitektur & Teknis (Architectural Decisions)**

1. **Strategi Autentikasi (Custom BFF & HTTP-Only Cookies):**
   - Menggunakan Next.js Route Handlers (`/api/auth/login`) sebagai proksi (Backend-for-Frontend).
   - *Bearer Token* dari Laravel akan disimpan ke dalam **HTTP-Only & Secure Cookies** oleh Next.js untuk mencegah risiko pencurian token via serangan XSS.
   - **Token Expiration & Error Handling:** Karena backend tidak menyertakan batas waktu eksplisit (`expires_in`), *Frontend* akan murni mengandalkan respon `401 Unauthorized`. Jika API mengembalikan `401`, *Axios Interceptor* akan menangkapnya, menghapus *session/cookie*, dan men-*redirect* pengguna kembali ke halaman Login (Force Logout).

2. **Penanganan Error Global (Hybrid Middleware & Axios):**
   - **Next.js Middleware (`middleware.ts`):** Bertugas mengamankan rute secara *server-side*. Token akan didekode (atau diverifikasi) di middleware untuk memastikan kecocokan *Role* (Super Admin / Bendahara). Jika tidak valid, akses langsung diblokir sebelum *render*.
   - **Axios Interceptor:** Menangani error API (*Client-side fetching*) dan merespon standar validasi (422) atau *server error* (500) menjadi *Toast Notification* global.

3. **Standar Integrasi API (Compliance):**
   - **Idempotency Key:** Untuk setiap form mutasi keuangan (*Create/Approve*), *frontend* **WAJIB** men-generate UUID unik dan menyertakannya di *Header* `Idempotency-Key` (mencegah duplikasi data jika jaringan lag).
   - **TypeScript DTOs:** Membuat *Interface* yang 100% cocok (*mirroring*) dengan respons JSON Laravel (memanfaatkan Zod schema).

4. **Strategi Testing (Quality Assurance):**
   - **Playwright (E2E):** Diwajibkan untuk mengetes alur kritis finansial (Alur Login -> Generate SPP -> Persetujuan Top Up) guna mencegah malpraktik finansial.
   - **Vitest:** Digunakan opsional untuk kalkulasi UI / utilitas format mata uang.

5. **Deployment:**
   - Aplikasi akan dibangun menggunakan **Next.js Standalone Mode** (`output: 'standalone'`).
   - Dikemas (di-*containerize*) menggunakan **Docker**, sehingga siap di-deploy ke VPS/On-Premise dengan fleksibilitas tinggi dan performa jaringan yang lebih baik saat berkomunikasi dengan backend Laravel di infrastruktur yang sama.

6. **Strategi Kontrol Akses UI (Role-Based Access Control / RBAC):**
   - Di level server, proteksi ditangani oleh `middleware.ts`.
   - Di level UI (*Client-side*), kita menggunakan *Custom Hook* (misal: `usePermission`) yang membaca status *role* untuk menyembunyikan tombol/menu yang tidak boleh diakses (sebagai lapis kedua setelah middleware).

## 6. Coding Standards & Best Practices

1. **Pola Pemisahan Logika (Custom Hooks Pattern):**
   - **Hindari** menumpuk logika *fetching* API atau manipulasi *state* rumit di dalam komponen UI (`.tsx`).
   - Pindahkan logika bisnis (terutama *TanStack Query*) ke dalam **Custom Hooks** di dalam folder fitur terkait (misal: `features/finance/api/useGetLedger.ts`). Komponen UI murni berfungsi sebagai *Presenter*.

2. **Paradigma App Router (Server vs Client Components):**
   - Jadikan semua halaman (`page.tsx`) dan *layout* (`layout.tsx`) sebagai **Server Components** (*default*).
   - Gunakan direktif `'use client'` **hanya** pada komponen daun (*leaf components*) yang membutuhkan interaktivitas langsung (seperti *Button*, *Form*, atau elemen yang memakai *Zustand*/*Hooks*). Jangan letakkan `'use client'` di komponen akar (*root*).

3. **Styling & Class Management (Tailwind):**
   - **Wajib** menggunakan utilitas `cn()` (gabungan `clsx` dan `tailwind-merge`) dari `shadcn/ui` saat melakukan penggabungan *class* bersyarat (*conditional classes*) untuk mencegah bentrok spesifisitas Tailwind.

4. **Pola Form & Validasi:**
   - Semua input form mutlak dikelola menggunakan **React Hook Form** untuk mencegah *re-render* yang berlebihan.
   - Skema validasi harus dipisahkan ke dalam file Zod tersendiri (misal: `features/finance/schemas/topUpSchema.ts`) agar mudah di-tes dan di- *reuse*.

5. **Organisasi Komponen (Global vs Lokal):**
   - Komponen generik (*Button, Modal, Input*) diletakkan terpusat di `src/components/ui/` (dikelola oleh CLI shadcn).
   - Komponen yang spesifik untuk konteks bisnis tertentu (seperti `TopUpTable.tsx` atau `LedgerFilter.tsx`) **wajib** diletakkan di dalam fitur masing-masing (`src/features/finance/components/`).

6. **Pedoman Visual Dasar (Design System & Theming):**
   - **Typography:** **Inter** (keterbacaan optimal untuk angka dan tabel keuangan).
   - **Iconography:** **lucide-react** (*default* dari ekosistem shadcn/ui).
   - **Primary Color:** **Emerald** (Hijau - memberikan identitas pesantren sekaligus nuansa aman untuk sistem finansial).

---
> [!NOTE]
> **Langkah Selanjutnya:**
> Bawa dokumen PRD ini saat Anda membuka *Workspace* baru di luar folder Backend. Dokumen ini sudah sangat komprehensif dan akan memandu AI secara akurat dalam men-generate fondasi *Enterprise* Next.js sesuai dengan arsitektur yang disepakati.
