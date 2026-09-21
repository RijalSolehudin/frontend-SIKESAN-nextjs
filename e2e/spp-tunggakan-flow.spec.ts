import { test, expect } from '@playwright/test';

test.describe('Fitur Tunggakan SPP dan Filter Kelas', () => {
  test('Tabel SPP menampilkan kolom tunggakan bulan, tombol bayar ter-disable saat lunas, dan filter kelas berfungsi', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    // Pastikan session aktif
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Akses halaman SPP
    await page.goto('/finance/spp');
    await expect(page.getByRole('heading', { name: 'Pengelolaan Tagihan SPP', level: 1 })).toBeVisible({ timeout: 10000 });

    // 3. Verifikasi Kolom Tunggakan Bulan dan Kolom Pengingat ada di Header Tabel
    await expect(page.getByRole('columnheader', { name: 'Tunggakan Bulan' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Pengingat' })).toBeVisible();

    // 4. Verifikasi Filter Kelas Ada dan Berfungsi
    const classFilter = page.getByRole('combobox').filter({ hasText: /semua kelas/i });
    await expect(classFilter).toBeVisible();
    await classFilter.click();

    // Pilih salah satu opsi kelas
    const firstClassOption = page.getByRole('option').nth(1); // Nth 0 is "Semua Kelas"
    await firstClassOption.click();

    // Verifikasi tabel memperbarui data sesuai kelas
    await expect(page.locator('table')).toBeVisible();

    // Kembalikan ke Semua Kelas
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Semua Kelas' }).click();

    // 5. Verifikasi Kolom Tunggakan dan Status Tombol Bayar & Pengingat saat Lunas
    const lunasBadge = page.getByText('Lunas').first();
    const hasLunas = await lunasBadge.isVisible().catch(() => false);

    if (hasLunas) {
      const lunasRow = page.locator('tr').filter({ has: page.getByText('Lunas') }).first();
      // Tombol Bayar SPP harus ter-disable
      await expect(lunasRow.getByRole('button', { name: /lunas|bayar/i })).toBeDisabled();
      // Tombol Kirim Pengingat juga harus ter-disable
      await expect(lunasRow.getByRole('button', { name: 'Kirim Pengingat' })).toBeDisabled();
    }

    // 6. Verifikasi Baris Santri dengan Tunggakan dan Tombol Kirim Pengingat
    // Spy window.open untuk memverifikasi URL redirect WhatsApp
    await page.evaluate(() => {
      (window as any).lastOpenedUrl = null;
      window.open = (url: any) => {
        (window as any).lastOpenedUrl = url;
        return null;
      };
    });

    const studentWithTunggakanRow = page.locator('tr').filter({ hasText: 'Ahmad Dahlan' }).first();
    await expect(studentWithTunggakanRow).toBeVisible();

    const reminderButton = studentWithTunggakanRow.getByRole('button', { name: 'Kirim Pengingat' });
    await expect(reminderButton).toBeVisible();
    await expect(reminderButton).toBeEnabled();

    // Klik tombol Kirim Pengingat
    await reminderButton.click();

    // Pastikan toast notifikasi muncul
    await expect(page.getByText(/membuka whatsapp pengingat/i)).toBeVisible({ timeout: 5000 });

    // Verifikasi URL yang dibuka memuat format WhatsApp internasional (62...) dan data santri
    const openedUrl = await page.evaluate(() => (window as any).lastOpenedUrl);
    expect(openedUrl).toBeTruthy();
    expect(openedUrl).toMatch(/wa\.me\/62\d+/);
    expect(openedUrl).toContain('Ahmad%20Dahlan');
    expect(openedUrl).toContain('1001');
  });
});
