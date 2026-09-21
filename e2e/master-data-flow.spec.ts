import { test, expect } from '@playwright/test';

test.describe('Alur Master Data SIKESAN', () => {
  test('Super Admin dapat mendaftarkan santri Non-Mukim dan Tahun Ajaran dengan rentang tanggal', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Pastikan masuk ke dashboard sebelum navigasi berikutnya
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Data Santri: Tambah Santri Non-Mukim
    await page.goto('/master-data/students');
    await expect(page.getByRole('heading', { name: 'Master Data Santri' })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /tambah santri/i }).click();

    const uniqueNis = `NM-${Date.now().toString().slice(-4)}`;
    await page.getByPlaceholder(/contoh: 2024001/i).fill(uniqueNis);
    await page.getByPlaceholder(/contoh: Muhammad Fatih/i).fill(`Santri Non-Mukim ${uniqueNis}`);

    const studentDialog = page.getByRole('dialog');

    // Pilih Kelas (combobox ke-1 di dalam modal)
    const classSelect = studentDialog.locator('button[role="combobox"]').nth(1);
    await classSelect.click();
    await page.getByRole('option').first().click();

    // Pastikan default Asrama adalah 'Non-Mukim (Pulang-Pergi)' atau pilih Non-Mukim (combobox ke-2 di dalam modal)
    const dormSelect = studentDialog.locator('button[role="combobox"]').nth(2);
    await dormSelect.click();
    await page.getByRole('option', { name: /non-mukim/i }).click();

    // Simpan Data Santri
    await page.getByRole('button', { name: /simpan data santri/i }).click();
    await expect(page.getByText(/santri berhasil ditambahkan/i)).toBeVisible({ timeout: 10000 });

    // Verifikasi badge Non-Mukim terlihat pada santri baru
    await expect(page.getByRole('cell', { name: uniqueNis, exact: true })).toBeVisible();
    await expect(page.getByText('Non-Mukim').first()).toBeVisible();

    // 3. Data Tahun Ajaran: Tambah Tahun Ajaran dengan Tanggal Mulai dan Selesai
    await page.goto('/master-data/academic-years');
    await expect(page.getByRole('heading', { name: 'Tahun Ajaran', level: 1 })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /tambah tahun ajaran/i }).click();

    const taName = `TA ${Date.now().toString().slice(-4)}/2027`;
    await page.getByPlaceholder(/contoh: 2025\/2026/i).fill(taName);
    
    // Input tanggal mulai & selesai
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2026-07-01');
    await dateInputs.nth(1).fill('2026-12-31');

    await page.getByRole('button', { name: /simpan/i }).click();
    await expect(page.getByText(/tahun ajaran berhasil ditambahkan/i)).toBeVisible({ timeout: 10000 });

    // Verifikasi tahun ajaran baru muncul di tabel
    await expect(page.getByRole('cell', { name: taName })).toBeVisible();
  });
});
