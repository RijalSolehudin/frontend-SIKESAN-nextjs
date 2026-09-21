import { test, expect } from '@playwright/test';

test.describe('Alur Kwitansi & Struk Pembayaran SPP SIKESAN', () => {
  test('Bendahara dapat melihat Kwitansi resmi, mencetak, dan mengirim bukti via WhatsApp', async ({ page }) => {
    // 1. Login Petugas / Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();

    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Buka Halaman SPP
    await page.goto('/finance/spp');
    await expect(page.getByRole('heading', { name: /pengelolaan tagihan spp/i, level: 1 })).toBeVisible({ timeout: 10000 });

    // Spy window.open untuk memverifikasi URL redirect WhatsApp
    await page.evaluate(() => {
      (window as any).lastOpenedUrl = null;
      window.open = (url: any) => {
        (window as any).lastOpenedUrl = url;
        return null;
      };
    });

    // 3. Uji Kwitansi pada Tab Verifikasi Pembayaran Online
    const verifTab = page.getByRole('button', { name: /verifikasi pembayaran online/i });
    await verifTab.click();

    // Filter status ke tombol "Disetujui"
    const approvedFilterBtn = page.getByRole('button', { name: /disetujui/i });
    await approvedFilterBtn.click();

    // Pastikan tombol Kwitansi tampil pada transaksi yang sudah disetujui
    const kwitansiBtn = page.getByRole('button', { name: /kwitansi/i }).first();
    await expect(kwitansiBtn).toBeVisible({ timeout: 10000 });
    await kwitansiBtn.click();

    // 4. Verifikasi Tampilan Pop-up Kwitansi Resmi
    await expect(page.getByText('Kwitansi Resmi Pembayaran SPP')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('PONDOK PESANTREN SIKESAN')).toBeVisible();
    await expect(page.getByText(/KW-SPP-/).first()).toBeVisible();
    await expect(page.getByText('LUNAS', { exact: true })).toBeVisible();
    await expect(page.getByText(/terbilang:/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /cetak kwitansi/i })).toBeVisible();

    // 5. Verifikasi Aksi Kirim via WhatsApp
    const sendWaBtn = page.getByRole('button', { name: /kirim via whatsapp/i });
    await expect(sendWaBtn).toBeVisible();
    await sendWaBtn.click();

    const openedUrl = await page.evaluate(() => (window as any).lastOpenedUrl);
    expect(openedUrl).toBeTruthy();
    expect(openedUrl).toContain('wa.me');
    expect(openedUrl).toContain(encodeURIComponent('BUKTI KWITANSI PEMBAYARAN SPP'));

    // Tutup Modal Kwitansi
    await page.getByRole('button', { name: 'Tutup' }).click();
    await expect(page.getByText('Kwitansi Resmi Pembayaran SPP')).not.toBeVisible();

    // 6. Uji Alur Pembayaran Tunai Kasir -> Pop-up Kwitansi Otomatis Muncul
    const billsTab = page.getByRole('button', { name: /tagihan santri/i });
    await billsTab.click();

    // Cari santri yang memiliki tombol bayar aktif
    const payBtn = page.getByRole('button', { name: /bayar spp/i }).first();
    const hasUnpaidStudent = await payBtn.isVisible();

    if (hasUnpaidStudent) {
      await payBtn.click();
      await expect(page.getByRole('heading', { name: /catat pembayaran spp \(manual\)/i })).toBeVisible();

      // Pilih tagihan pertama
      await page.locator('div.cursor-pointer').filter({ hasText: /Bulan/i }).first().click();

      // Simpan Pembayaran
      await page.getByRole('button', { name: /catat pembayaran/i }).click();

      // Modal Kwitansi harus otomatis muncul setelah sukses
      await expect(page.getByText('Kwitansi Resmi Pembayaran SPP')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('LUNAS', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /kirim via whatsapp/i })).toBeVisible();

      await page.getByRole('button', { name: 'Tutup' }).click();
    }
  });
});
