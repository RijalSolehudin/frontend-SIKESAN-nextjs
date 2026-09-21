import { test, expect } from '@playwright/test';

test.describe('Alur Finansial Utama SIKESAN', () => {
  test('Bendahara dapat login, generate SPP, dan approve Top Up', async ({ page }) => {
    // 1. Login Petugas / Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Pastikan masuk ke dashboard
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Generate SPP
    await page.goto('/finance/spp');
    await expect(page.getByRole('heading', { name: /pengelolaan tagihan spp/i })).toBeVisible();

    const generateButton = page.getByRole('button', { name: /generate tagihan masal|generate spp/i });
    await expect(generateButton).toBeVisible();
    await generateButton.click();
    
    // Modal konfirmasi / generate
    const confirmGenerateButton = page.getByRole('button', { name: /generate tagihan|konfirmasi/i });
    await expect(confirmGenerateButton).toBeVisible();
    await confirmGenerateButton.click();
    
    // Verifikasi toast notifikasi sukses
    await expect(page.getByText(/spp berhasil digenerate|tagihan spp berhasil|berhasil di-generate/i)).toBeVisible({ timeout: 10000 });

    // 3. Top Up Flow
    // Rute /finance/top-up akan redirect secara otomatis ke /finance/top-ups
    await page.goto('/finance/top-up');
    await expect(page.getByRole('heading', { name: /persetujuan top up/i })).toBeVisible({ timeout: 10000 });

    // Cek apakah sudah ada tombol Setujui yang aktif di tabel
    let approveButton = page.getByRole('button', { name: /approve|setujui/i }).first();
    const hasApproveButton = await approveButton.isVisible().catch(() => false);

    if (!hasApproveButton) {
      // Klik Buat Permintaan Top-Up
      await page.getByRole('button', { name: /buat permintaan top-up/i }).click();
      
      // Pilih Santri
      const santriSelect = page.getByRole('combobox').first();
      await santriSelect.click();
      await page.getByRole('option').first().click();

      // Isi nominal
      const amountInput = page.getByPlaceholder(/contoh: 100,000/i);
      await amountInput.fill('50000');

      // Submit
      await page.getByRole('button', { name: /kirim permintaan/i }).click();
      await expect(page.getByText(/permintaan top-up berhasil dibuat/i)).toBeVisible({ timeout: 10000 });
    }
    
    // Cari dan klik tombol approve / setujui
    approveButton = page.getByRole('button', { name: /approve|setujui/i }).first();
    await expect(approveButton).toBeVisible({ timeout: 10000 });
    await approveButton.click();
    
    // Konfirmasi approval di dialog
    const confirmButton = page.getByRole('button', { name: 'Ya, Setujui' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Verifikasi toast notifikasi sukses
    await expect(page.getByText(/permintaan top-up berhasil disetujui|top up request approved/i)).toBeVisible({ timeout: 10000 });
  });
});
