import { test, expect } from '@playwright/test';

test.describe('Modul Manajemen Pengguna (User Management) SIKESAN', () => {
  test('Admin dapat membuat akun baru, mengedit profil, reset password, dan user baru dapat login', async ({ page }) => {
    // 1. Login sebagai Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Pastikan masuk dashboard
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Navigasi ke halaman Manajemen User
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Manajemen Pengguna & Akun', level: 1 })).toBeVisible({ timeout: 10000 });

    // 3. Buka Modal Tambah User Baru
    await page.getByRole('button', { name: /tambah user baru/i }).click();

    const uniqueId = Date.now().toString().slice(-4);
    const uniqueUsername = `wali_${uniqueId}`;
    const initialPassword = 'Password123!';
    const fullName = `Bapak Ridwan Kamil ${uniqueId}`;

    await page.getByPlaceholder(/contoh: ahmad_fauzi/i).fill(uniqueUsername);
    await page.getByPlaceholder(/minimal 6 karakter/i).fill(initialPassword);
    await page.getByPlaceholder(/contoh: h. ahmad fauzi/i).fill(fullName);
    await page.getByPlaceholder('081234567890').fill('081298765432');
    await page.getByPlaceholder(/contoh: bsi \/ bca/i).fill('Bank Syariah Indonesia (BSI)');
    await page.getByPlaceholder(/contoh: 7123456789/i).fill('7123456780');
    await page.getByPlaceholder(/contoh: ahmad fauzi/i).fill(fullName);

    // Simpan & Buat Akun
    await page.getByRole('button', { name: /simpan & buat akun/i }).click();

    // 4. Verifikasi Pop-up Sukses Pembuatan Akun & Kredensial
    await expect(page.getByRole('heading', { name: 'Akun Berhasil Dibuat!' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('dialog').getByText(uniqueUsername)).toBeVisible();
    await expect(page.getByRole('dialog').getByText(initialPassword)).toBeVisible();

    // Tutup dialog sukses
    await page.getByRole('button', { name: 'Selesai' }).click();

    // 5. Verifikasi Data Pengguna Muncul di Tabel
    const userRow = page.locator('tr').filter({ hasText: uniqueUsername });
    await expect(userRow.getByText(fullName, { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(userRow.getByText(`@${uniqueUsername}`)).toBeVisible();
    await expect(userRow.getByText('7123456780')).toBeVisible();

    // 6. Edit Profil & Reset Password
    await userRow.getByRole('button', { name: /edit/i }).click();

    const updatedFullName = `${fullName}, M.M.`;
    const newPassword = 'NewSecretPassword88!';

    await page.getByPlaceholder('Nama Lengkap').fill(updatedFullName);
    await page.getByPlaceholder(/kosongkan jika tidak ingin mengubah password/i).fill(newPassword);

    await page.getByRole('button', { name: /simpan perubahan/i }).click();

    // Verifikasi Pop-up Password Berhasil Di-Reset
    await expect(page.getByRole('heading', { name: 'Password Berhasil Di-Reset!' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('dialog').getByText(newPassword)).toBeVisible();
    await page.getByRole('button', { name: 'Tutup' }).click();

    // Verifikasi nama ter-update di tabel
    await expect(page.getByText(updatedFullName, { exact: true })).toBeVisible({ timeout: 10000 });

    // 7. Logout via Header Dropdown
    await page.locator('header button').last().click();
    await page.getByText(/keluar aplikasi/i).click();
    await expect(page).toHaveURL(/\/login$/);

    // 8. Coba login dengan akun baru & kata sandi baru
    await page.getByLabel('Username').fill(uniqueUsername);
    await page.getByLabel('Password').fill(newPassword);
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Verifikasi berhasil login masuk sistem (keluar dari rute /login)
    await expect(page).not.toHaveURL(/\/login$/);
  });
});
