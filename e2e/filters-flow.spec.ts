import { test, expect } from '@playwright/test';

test.describe('Pengujian Filter Kelas Santri & Rentang Waktu Transaksi', () => {
  test('Filter kelas pada data santri dan filter rentang waktu pada Top Up, Infaq, serta Pengeluaran berfungsi dengan baik', async ({ page }) => {
    // 1. Login Petugas Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Verifikasi Filter Kelas di Data Santri
    await page.goto('/master-data/students');
    await expect(page.getByRole('heading', { name: 'Master Data Santri' })).toBeVisible({ timeout: 10000 });

    // Cari combobox filter kelas di halaman
    const classFilter = page.locator('.glass-card').getByRole('combobox').filter({ hasText: /semua kelas/i });
    await expect(classFilter).toBeVisible();
    await classFilter.click();

    // Pilih salah satu kelas di dropdown
    const classOption = page.getByRole('option').nth(1); // Opsi kelas pertama setelah 'Semua Kelas'
    await classOption.click();
    await expect(page.locator('table')).toBeVisible();

    // Kembalikan ke Semua Kelas
    await page.locator('.glass-card').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Semua Kelas' }).click();
    await expect(page.locator('table')).toBeVisible();

    // 3. Verifikasi Filter Rentang Waktu di Top Up Saldo
    await page.goto('/finance/top-ups');
    await expect(page.getByRole('heading', { name: 'Persetujuan Top Up Dompet' })).toBeVisible({ timeout: 10000 });

    const topUpDateFilter = page.locator('.glass-card').getByRole('combobox').filter({ hasText: /semua waktu/i });
    await expect(topUpDateFilter).toBeVisible();
    await topUpDateFilter.click();

    // Pilih 'Hari Ini'
    await page.getByRole('option', { name: 'Hari Ini' }).click();
    await expect(page.locator('table')).toBeVisible();

    // Pilih '30 Hari Terakhir'
    await page.locator('.glass-card').getByRole('combobox').click();
    await page.getByRole('option', { name: '30 Hari Terakhir' }).click();
    await expect(page.locator('table')).toBeVisible();

    // Pilih 'Rentang Kustom...'
    await page.locator('.glass-card').getByRole('combobox').click();
    await page.getByRole('option', { name: /rentang kustom/i }).click();

    // Verifikasi input date muncul saat rentang kustom dipilih
    const customDateInputs = page.locator('input[type="date"]');
    await expect(customDateInputs.first()).toBeVisible();
    await expect(customDateInputs.nth(1)).toBeVisible();

    // Klik tombol Reset
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.locator('.glass-card').getByRole('combobox').filter({ hasText: /semua waktu/i })).toBeVisible();

    // 4. Verifikasi Filter Rentang Waktu di Pengeluaran Operasional
    await page.goto('/finance/expenses');
    await expect(page.getByRole('heading', { name: 'Pengeluaran Operasional', level: 1 })).toBeVisible({ timeout: 10000 });

    const expenseDateFilter = page.locator('.glass-card').getByRole('combobox').filter({ hasText: /semua waktu/i });
    await expect(expenseDateFilter).toBeVisible();
    await expenseDateFilter.click();
    await page.getByRole('option', { name: /rentang kustom/i }).click();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();

    // 5. Verifikasi Filter Rentang Waktu di Penerimaan Infaq
    await page.goto('/finance/infaq');
    await expect(page.getByRole('heading', { name: 'Penerimaan Infaq & Shadaqah', level: 1 })).toBeVisible({ timeout: 10000 });

    const infaqDateFilter = page.locator('.glass-card').getByRole('combobox').filter({ hasText: /semua waktu/i });
    await expect(infaqDateFilter).toBeVisible();
    await infaqDateFilter.click();
    await page.getByRole('option', { name: /rentang kustom/i }).click();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });
});
