# Work Package 04: End-to-End (E2E) Testing with Playwright

## 1. Objektif
Membangun otomatisasi pengetesan alur kritis finansial untuk mencegah malpraktik dan kegagalan sistem pada tahap produksi, sesuai **PRD Bagian 5 (Keputusan Arsitektur #4)**.

## 2. Referensi Dokumen
- `frontend_prd.md` -> Strategi Testing (Quality Assurance).

## 3. Detail Implementasi

### A. Setup Playwright
1. Inisialisasi: `npx playwright install`.
2. Konfigurasi `playwright.config.ts`: Set URL dasar ke `http://localhost:3000` (atau port dev yang relevan).
3. Buat folder `e2e/` di *root* direktori proyek.

### B. Skenario Pengetesan: Alur Finansial Utama
Buat file `e2e/financial-flow.spec.ts` yang mensimulasikan langkah berikut:
1. **Login Bendahara:** Masukkan kredensial dan pastikan masuk ke halaman dasbor.
2. **Generate SPP:** Navigasi ke halaman SPP, klik tombol "Generate SPP", konfirmasi, dan pastikan notifikasi sukses muncul.
3. **Approve Top Up:** Navigasi ke halaman Top Up, cari status "PENDING", klik tombol "Approve", dan verifikasi status berubah.

## 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] `npx playwright test` berjalan hijau (sukses) tanpa intervensi manual.
- [ ] Skrip menggunakan penyeleksi aksesibilitas (*Role/Text*) bukan sekadar nama kelas CSS yang rentan berubah (contoh: `page.getByRole('button', { name: 'Approve' })`).

## 5. Pertanyaan Terbuka / Klarifikasi (Untuk Senior/Lead)
- Saat E2E dijalankan, apakah ada *database seeding* khusus di *backend* agar datanya persisten (tidak mengotori data *development*)? Sebaiknya kita gunakan variabel *environment* khusus (misal: akun Bendahara *Test*) saat menjalankan skrip tes ini.
