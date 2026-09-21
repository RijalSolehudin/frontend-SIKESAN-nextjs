# Work Package 05: Docker Deployment Setup (Standalone)

## 1. Objektif
Menyiapkan konfigurasi Docker untuk men-*deploy* aplikasi Next.js dalam mode **Standalone** agar *image* ringan, aman, dan siap dijalankan di *server* VPS atau On-Premise, sesuai **PRD Bagian 5 (Keputusan Arsitektur #5)**.

## 2. Referensi Dokumen
- `frontend_prd.md` -> Deployment.
- Next.js Documentation -> Output Standalone.

## 3. Detail Implementasi

### A. Konfigurasi Next.js
1. Verifikasi file `next.config.ts`.
2. Pastikan properti `output: 'standalone'` sudah diaktifkan di dalam konfigurasi.

### B. Pembuatan Dockerfile
1. Buat `Dockerfile` multi-stage:
   - **Stage 1 (deps):** Instalasi *dependencies* menggunakan `npm ci`.
   - **Stage 2 (builder):** *Copy source code* dan jalankan `npm run build`.
   - **Stage 3 (runner):** *Copy* folder `.next/standalone`, `.next/static`, dan `public` ke OS *Alpine Node.js*.
2. Tentukan variabel *environment* bawaan (contoh: `NODE_ENV=production`, `PORT=3000`).
3. Jalankan melalui `server.js` (hasil dari mode *standalone*).

### C. Pembuatan .dockerignore
1. Buat `.dockerignore`.
2. Masukkan `node_modules`, `.git`, `.next`, `README.md`, dsb., agar proses *build image* efisien dan bersih.

## 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Berhasil membangun *image* melalui perintah `docker build -t frontend-sikesan .`
- [ ] *Image* yang dihasilkan berukuran wajar (idealnya di bawah 200MB - 300MB berkat mode *standalone*).
- [ ] Aplikasi berjalan normal di `http://localhost:3000` saat kontainer dijalankan dengan `docker run`.

## 5. Pertanyaan Terbuka / Klarifikasi (Untuk Senior/Lead)
- Apakah proyek ini akan di- *deploy* di balik *Reverse Proxy* (seperti Nginx atau Traefik) bersamaan dengan kontainer *Backend* Laravel menggunakan `docker-compose.yml`? Jika ya, konfigurasi `docker-compose.yml` juga perlu disiapkan dalam tahap ini atau di *repository* infrastruktur.
