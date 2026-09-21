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

  test('Bendahara dapat membuat Top-Up dengan mengunggah bukti pembayaran dan melihat preview bukti di tabel', async ({ page }) => {
    // 1. Login Petugas / Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Pastikan masuk ke dashboard
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Navigasi ke Halaman Top-Up
    await page.goto('/finance/top-up');
    await expect(page.getByRole('heading', { name: /persetujuan top up/i })).toBeVisible({ timeout: 10000 });

    // 3. Buka Modal Buat Permintaan Top-Up
    await page.getByRole('button', { name: /buat permintaan top-up/i }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Pilih Santri
    const santriSelect = modal.locator('button[role="combobox"]').first();
    await santriSelect.click();
    await page.getByRole('option').first().click();

    // Isi nominal
    const amountInput = modal.getByPlaceholder(/contoh: 100,000/i);
    await amountInput.fill('75000');

    // Upload Bukti Pembayaran / Nota (file buffer)
    const fileInput = modal.locator('#topup-proof-input');
    await fileInput.setInputFiles({
      name: 'bukti_transfer_sample.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      ),
    });

    // Verifikasi preview file muncul di modal
    await expect(modal.getByText('bukti_transfer_sample.png')).toBeVisible();

    // Submit
    await modal.getByRole('button', { name: /kirim permintaan/i }).click();
    await expect(page.getByText(/permintaan top-up berhasil dibuat/i)).toBeVisible({ timeout: 10000 });

    // 4. Verifikasi Kolom Bukti Pembayaran di Tabel
    await expect(page.getByRole('columnheader', { name: /bukti pembayaran/i })).toBeVisible();

    // Cari tombol preview bukti pembayaran di tabel
    const proofButton = page.getByRole('button', { name: /lihat bukti pembayaran/i }).first();
    await expect(proofButton).toBeVisible({ timeout: 5000 });
    await proofButton.click();

    // 5. Verifikasi Modal Preview Bukti Pembayaran
    const proofModal = page.getByRole('dialog');
    await expect(proofModal).toBeVisible();
    await expect(proofModal.getByText(/bukti pembayaran \/ nota top-up/i)).toBeVisible();
    await expect(proofModal.getByText(/rp 75\.000|75,000/i)).toBeVisible();

    // Tutup modal
    await proofModal.getByRole('button', { name: /tutup/i }).click();
    await expect(proofModal).not.toBeVisible();
  });

  test('Bendahara dapat mencari santri secara spesifik menggunakan fitur search pada modal Top Up', async ({ page }) => {
    // 1. Login Petugas / Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Buka Halaman Top Up & Modal
    await page.goto('/finance/top-up');
    await page.getByRole('button', { name: /buat permintaan top-up/i }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // 3. Klik Combobox Santri untuk membuka popup pencarian
    const comboboxBtn = modal.locator('button[role="combobox"]').first();
    await comboboxBtn.click();

    // 4. Input Pencarian Santri
    const searchInput = modal.getByPlaceholder(/ketik nama atau nis santri/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Santri');

    // 5. Pilih salah satu santri hasil pencarian
    const firstOption = modal.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    const studentText = await firstOption.textContent();
    await firstOption.click();

    // 6. Verifikasi santri terpilih ditampilkan pada tombol combobox
    await expect(comboboxBtn).not.toHaveText(/cari nama atau nis santri/i);

    // 7. Batalkan modal
    await modal.getByRole('button', { name: 'Batal', exact: true }).click();
    await expect(modal).not.toBeVisible();
  });
});
