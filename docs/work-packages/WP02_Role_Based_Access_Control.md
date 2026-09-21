# Work Package 02: Role-Based Access Control (RBAC) Client-Side

## 1. Objektif
Menyediakan lapis keamanan kedua di sisi antarmuka (*Client-side*) untuk menyembunyikan tombol, menu, atau informasi yang tidak relevan dengan *role* pengguna (Super Admin vs Bendahara) sesuai **PRD Bagian 5 (Keputusan Arsitektur #6)**.

## 2. Referensi Dokumen
- `frontend_prd.md` -> Keputusan Arsitektur & Teknis (Poin 6: Strategi Kontrol Akses UI).
- `api_documentation.md` -> Authentication Response (Objek `user.roles`).

## 3. Detail Implementasi

### A. Auth Context & State Management
Karena PRD melarang penggunaan Zustand, gunakan **React Context API**.
1. Buat `src/features/auth/context/AuthContext.tsx`.
2. Saat *login* berhasil, simpan objek `User` (berisi informasi `roles`) ke dalam *Context*.
3. Agar *state* bertahan saat *refresh page*, simpan sesi sementara (metadata *user*, bukan token) di `localStorage`, ATAU buat *endpoint* lokal BFF (`GET /api/auth/me`) yang mengambil profil dari *backend* Laravel setiap kali halaman dimuat ulang.

### B. Custom Hook `usePermission`
1. Buat file `src/hooks/usePermission.ts`.
2. Hook ini mengonsumsi `AuthContext`.
3. Fungsi utama: `const { hasRole, isSuperAdmin, isTreasurer } = usePermission();`
4. Logika: Memeriksa array `user.roles` apakah mengandung nama peran yang ditanyakan.

### C. Implementasi di Komponen
1. Navigasi (`Sidebar.tsx` / `Header.tsx`): Sembunyikan menu Master Data jika pengguna hanyalah Bendahara murni (sesuaikan dengan matriks perizinan).
2. Aksi Tabel: Sembunyikan tombol "Hapus" pada Master Data jika bukan Super Admin.

## 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Tersedia `AuthContext` yang membungkus komponen aplikasi.
- [ ] Hook `usePermission` berfungsi dengan baik dan bisa mendeteksi *role*.
- [ ] Komponen UI sensitif tidak *render* jika pengguna tidak memiliki izin (bukan sekadar di-*disable*, tapi tidak di-*render* ke DOM).

## 5. Pertanyaan Terbuka / Klarifikasi (Untuk Senior/Lead)
- **Matriks Izin Spesifik:** Apa saja batasan spesifik antara Super Admin dan Bendahara? Apakah Bendahara boleh melihat Master Data tapi tidak boleh mengedit/menghapus? *Harus diklarifikasi ke Product Owner sebelum eksekusi tahap C.*
