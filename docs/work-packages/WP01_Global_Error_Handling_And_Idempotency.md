# Work Package 01: Global Error Handling & Idempotency

## 1. Objektif
Mengimplementasikan sistem penanganan *error* global secara tersentralisasi pada klien (Axios Interceptors) dan memastikan kepatuhan standar transaksi finansial (Idempotency-Key) sesuai **PRD Bagian 5 (Keputusan Arsitektur #2 dan #3)**.

## 2. Referensi Dokumen
- `frontend_prd.md` -> Keputusan Arsitektur & Teknis (Poin 2 & 3).
- `api_documentation.md` -> Standar Respon Error (Bagian 6).

## 3. Detail Implementasi

### A. Axios Interceptors (`src/lib/axios.ts`)
Tambahkan logika `interceptors.response` pada *instance* Axios yang sudah ada:
1. **401 Unauthorized:**
   - Hapus kredensial klien atau panggil *route handler* lokal (BFF) untuk menghapus *HTTP-Only Cookie*.
   - *Redirect* pengguna secara paksa ke halaman `/login`.
2. **422 Unprocessable Entity:**
   - Tangkap `error.response.data.errors`.
   - Konversi *array* pesan *error* menjadi *Toast Notification* global menggunakan `sonner` (atau *alert* UI).
3. **403 Forbidden:**
   - Tampilkan *Toast Notification* "Akses ditolak. Anda tidak memiliki izin untuk tindakan ini."
4. **500 Internal Server Error:**
   - Tampilkan *Toast Notification* error generik "Terjadi kesalahan pada server."

### B. Idempotency-Key untuk Transaksi Keuangan
1. Instal *library* `uuid` (`npm install uuid` dan `npm install @types/uuid`).
2. Buat *Axios Request Interceptor*.
3. **Kondisi:** Jika *method request* adalah `POST`, `PUT`, atau `PATCH` dan *URL* mengandung *path* `/top-ups`, `/spp`, atau `/infaqs`.
4. **Aksi:** *Generate* UUID v4, lalu sisipkan ke dalam *headers* `Idempotency-Key`.

## 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Pengguna otomatis ter-*logout* jika server mengembalikan 401.
- [ ] Jika terjadi *error* validasi 422 saat *submit form* (contoh: Top Up), muncul *Toast* berwarna merah dengan pesan spesifik dari server.
- [ ] *Header* `Idempotency-Key` selalu terkirim di *Network Tab* peramban setiap kali Bendahara melakukan *Approve Top Up* atau *Bayar SPP*.

## 5. Pertanyaan Terbuka / Klarifikasi (Untuk Senior/Lead)
- Apakah penghapusan *session cookie* saat 401 dilakukan melalui *redirect* langsung, atau memanggil Next.js API route `/api/auth/logout` terlebih dahulu untuk membersihkan *HTTP-Only cookie*? **Rekomendasi:** Gunakan pemanggilan ke `/api/auth/logout` secara transparan sebelum *redirect*.
