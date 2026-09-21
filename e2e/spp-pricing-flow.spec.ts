import { test, expect } from '@playwright/test';

test.describe('Alur Konfigurasi Tarif SPP & Keringanan Santri', () => {
  test('Bendahara dapat mengatur tarif angkatan dan mendaftarkan keringanan khusus santri', async ({ page }) => {
    // 1. Login Petugas / Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Navigasi ke Halaman SPP
    await page.goto('/finance/spp');
    await expect(page.getByRole('heading', { name: /pengelolaan tagihan spp/i })).toBeVisible({ timeout: 10000 });

    // 3. Masuk ke Tab Tarif SPP & Keringanan
    const pricingTabBtn = page.getByRole('button', { name: /tarif spp & keringanan/i });
    await expect(pricingTabBtn).toBeVisible();
    await pricingTabBtn.click();

    // Verifikasi bagian-bagian utama di tab tarif
    await expect(page.getByRole('heading', { name: /tarif per angkatan/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: /keringanan khusus santri/i })).toBeVisible();

    // 4. Atur Tarif SPP Angkatan
    await page.getByRole('button', { name: /atur tarif angkatan/i }).click();
    const cohortModal = page.getByRole('dialog');
    await expect(cohortModal).toBeVisible();
    await expect(cohortModal.getByRole('heading', { name: /atur tarif spp angkatan/i })).toBeVisible();

    const yearInput = cohortModal.getByPlaceholder(/contoh: 2026/i);
    await yearInput.fill('2026');

    const cohortAmountInput = cohortModal.getByPlaceholder(/150/i);
    await cohortAmountInput.fill('275000');

    await cohortModal.getByRole('button', { name: /simpan tarif angkatan/i }).click();
    await expect(page.getByText(/tarif spp angkatan 2026 berhasil disimpan/i)).toBeVisible({ timeout: 10000 });

    // Verifikasi tarif angkatan muncul di kolom kiri
    await expect(page.getByText(/275\.000/i).first()).toBeVisible({ timeout: 5000 });

    // 5. Tambah Keringanan Khusus untuk Santri
    await page.getByRole('button', { name: /tambah keringanan santri/i }).click();
    const discountModal = page.getByRole('dialog');
    await expect(discountModal).toBeVisible();
    await expect(discountModal.getByRole('heading', { name: /tambah keringanan \/ tarif khusus santri/i })).toBeVisible();

    // Cari dan pilih santri di dalam modal (combobox ke-2 setelah tahun ajaran)
    const studentCombobox = discountModal.locator('button[role="combobox"]').nth(1);
    await studentCombobox.click();
    const searchInput = discountModal.getByPlaceholder(/ketik nama atau nis santri/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Santri');

    const firstStudentOption = discountModal.getByRole('option').first();
    await expect(firstStudentOption).toBeVisible({ timeout: 5000 });
    await firstStudentOption.click();

    // Isi nominal keringanan
    const amountInput = discountModal.getByPlaceholder(/contoh: 150,000/i);
    await amountInput.fill('125000');

    // Isi alasan keringanan
    const notesInput = discountModal.getByPlaceholder(/contoh: keringanan 50% yatim piatu/i);
    await notesInput.fill('Dispensasi anak yatim piatu rekomendasi pengasuh');

    // Submit form keringanan
    await discountModal.getByRole('button', { name: /simpan keringanan/i }).click();
    await expect(page.getByText(/keringanan tarif spp santri berhasil disimpan/i)).toBeVisible({ timeout: 10000 });

    // 6. Verifikasi santri muncul di tabel keringanan
    await expect(page.getByText(/125\.000/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/dispensasi anak yatim piatu/i).first()).toBeVisible();
  });
});
