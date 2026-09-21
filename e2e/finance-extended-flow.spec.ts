import { test, expect } from '@playwright/test';

test.describe('Alur Keuangan Lengkap SIKESAN', () => {
  test('Bendahara dapat mencatat Infaq, mencatat Pengeluaran, dan memeriksa Buku Besar', async ({ page }) => {
    // 1. Login Petugas / Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Pastikan masuk ke dashboard
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Pencatatan Infaq
    await page.goto('/finance/infaq');
    await expect(page.getByRole('heading', { name: 'Penerimaan Infaq & Shadaqah', level: 1 })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /catat infaq/i }).click();

    // Pilih Kategori Infaq di dalam Modal
    const infaqDialog = page.getByRole('dialog');
    const infaqCategorySelect = infaqDialog.locator('button[role="combobox"]').nth(1);
    await infaqCategorySelect.click();
    await page.getByRole('option').first().click();

    // Isi Nominal
    const infaqAmountInput = page.getByPlaceholder(/contoh: 50,000/i);
    await infaqAmountInput.fill('75000');

    // Isi Catatan
    const infaqNote = `Infaq Pembangunan ${Date.now().toString().slice(-4)}`;
    await page.getByPlaceholder(/contoh: untuk pembangunan/i).fill(infaqNote);

    // Simpan Infaq
    await page.getByRole('button', { name: /simpan infaq/i }).click();
    await expect(page.getByText(/penerimaan infaq berhasil dicatat/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: 'Rp 75.000' }).first()).toBeVisible();

    // 3. Pencatatan Pengeluaran
    await page.goto('/finance/expenses');
    await expect(page.getByRole('heading', { name: 'Pengeluaran Operasional', level: 1 })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /catat pengeluaran/i }).click();

    // Pilih Kategori Pengeluaran di dalam Modal
    const expenseDialog = page.getByRole('dialog');
    const expenseCategorySelect = expenseDialog.locator('button[role="combobox"]').first();
    await expenseCategorySelect.click();
    await page.getByRole('option').first().click();

    // Isi Nominal
    const expenseAmountInput = page.getByPlaceholder(/contoh: 150,000/i);
    await expenseAmountInput.fill('45000');

    // Isi Keterangan
    const expenseDesc = `Operasional Kantor ${Date.now().toString().slice(-4)}`;
    await page.getByPlaceholder(/contoh: pembelian token/i).fill(expenseDesc);

    // Simpan Pengeluaran
    await page.getByRole('button', { name: /simpan pengeluaran/i }).click();
    await expect(page.getByText(/pengeluaran berhasil dicatat/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(expenseDesc)).toBeVisible();

    // 4. Pemeriksaan Buku Besar (Ledger)
    await page.goto('/finance/ledger');
    await expect(page.getByRole('heading', { name: /buku besar/i, level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Daftar Jurnal Mutasi Finansial' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });
});
