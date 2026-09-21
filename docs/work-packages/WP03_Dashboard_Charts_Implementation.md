# Work Package 03: Dashboard Charts & Recent Transactions

## 1. Objektif
Menggantikan *placeholder* "Segera Hadir" pada halaman dasbor utama menjadi grafik visual (Bar Chart) yang interaktif dan daftar transaksi mutasi terbaru untuk Bendahara.

## 2. Referensi Dokumen
- `frontend_prd.md` -> Modul Dashboard.
- Wireframe/Diskusi sebelumnya terkait porsi kosong di bawah *Metric Cards*.

## 3. Detail Implementasi

### A. Grafik Tren Pemasukan (Bar Chart)
1. Instal *library* grafik: `npm install recharts`.
2. Buat komponen `src/features/dashboard/components/RevenueChart.tsx`.
3. Gunakan warna utama ekosistem aplikasi (`emerald-600` untuk batang grafik).
4. Komponen harus *ResponsiveContainer* agar mengikuti ukuran *card*.

### B. Daftar Transaksi Terakhir
1. Buat komponen `src/features/dashboard/components/RecentTransactions.tsx`.
2. Ambil data dengan memanggil ulang `useGetLedger` (dari fitur Keuangan) dengan limit (misal: 5 data terbaru).
3. Tampilkan dalam bentuk daftar sederhana: Ikon tipe mutasi (SPP/TopUp/Infaq), Tanggal, Deskripsi Singkat, dan Nominal (Rupiah).

### C. Kebutuhan API Baru
Saat ini, `api_documentation.md` belum mendefinisikan *endpoint* untuk deret waktu (historis per bulan) bagi grafik. Kita perlu mengonsultasikan hal ini ke tim *backend*.

## 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Komponen grafik ter-*render* sempurna tanpa pesan "Segera Hadir".
- [ ] Daftar transaksi terakhir mengambil 5 data mutasi teratas dari *Ledger*.
- [ ] Memiliki status *Loading Skeleton* yang sinkron dengan pemanggilan API.

## 5. Pertanyaan Terbuka / Klarifikasi (Untuk Senior/Lead)
- **API Spec Modification:** Untuk mengisi data Bar Chart, apakah kita akan meminta *backend* menambahkan *endpoint* `GET /api/v1/dashboard/revenue-trends` yang me-*return* data array per bulan (Bulan, Total Uang Masuk)? Jika belum ada, untuk versi MVP apakah diperbolehkan menggunakan data *dummy* secara visual sementara menunggu *backend*?
