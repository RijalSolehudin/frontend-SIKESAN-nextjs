import { test, expect } from '@playwright/test';

test.describe('Fitur Verifikasi Pembayaran SPP Online', () => {
  test('Alur verifikasi pembayaran SPP online: pengajuan dengan bukti, preview bukti, approval, dan rejection', async ({ page }) => {
    // 1. Login sebagai Super Admin
    await page.goto('/login');
    await page.getByLabel('Username').fill('superadmin');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /masuk ke dasbor|login/i }).click();
    await expect(page.getByRole('heading', { name: /dashboard bendahara/i })).toBeVisible({ timeout: 10000 });

    // 2. Akses halaman SPP
    await page.goto('/finance/spp');
    await expect(page.getByRole('heading', { name: 'Pengelolaan Tagihan SPP', level: 1 })).toBeVisible({ timeout: 10000 });

    // 3. Verifikasi Tab Navigasi "Tagihan Santri" dan "Verifikasi Pembayaran Online"
    const billsTab = page.getByRole('button', { name: /tagihan santri/i });
    const verificationsTab = page.getByRole('button', { name: /verifikasi pembayaran online/i });
    await expect(billsTab).toBeVisible();
    await expect(verificationsTab).toBeVisible();

    // 4. Simulasi submit pembayaran online via API
    // Dapatkan tagihan UNPAID
    const billsResponse = await page.request.get('/api/proxy/students/2/bills');
    const billsData = await billsResponse.json();
    const unpaidBill = billsData.data.find((b: any) => b.status === 'UNPAID');

    if (unpaidBill) {
      // Submit pembayaran SPP online dengan lampiran bukti transfer dummy
      const submitRes = await page.request.post('/api/proxy/spp/submit-payment', {
        multipart: {
          student_id: '2',
          'bill_ids[]': unpaidBill.id,
          total_amount: unpaidBill.amount_billed.toString(),
          sender_bank_name: 'Bank BSI',
          sender_account_holder: 'Wali Zaid bin Tsabit',
          notes: 'Pembayaran SPP via Mobile App',
          proof: {
            name: 'bukti_transfer.png',
            mimeType: 'image/png',
            buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
          },
        },
      });
      expect(submitRes.status()).toBe(201);

      // Refresh halaman SPP untuk memuat state terbaru
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Pengelolaan Tagihan SPP', level: 1 })).toBeVisible();

      // 5. Verifikasi di Tab "Tagihan Santri":
      // Tagihan santri Zaid bin Tsabit sekarang menampilkan tag (Menunggu)
      const zaidRow = page.locator('tr').filter({ hasText: 'Zaid bin Tsabit' }).first();
      await expect(zaidRow).toBeVisible();
      await expect(zaidRow.getByText(/menunggu/i).first()).toBeVisible();

      // Verifikasi badge notifikasi jumlah antrean pada tombol tab Verifikasi
      await expect(verificationsTab.getByText(/menunggu/i)).toBeVisible();

      // 6. Beralih ke Tab "Verifikasi Pembayaran Online"
      await verificationsTab.click();

      // Verifikasi pengajuan Zaid bin Tsabit muncul di tabel verifikasi
      const verificationRow = page.locator('tr').filter({ hasText: 'Zaid bin Tsabit' }).first();
      await expect(verificationRow).toBeVisible({ timeout: 10000 });
      await expect(verificationRow.getByText('Wali Zaid bin Tsabit')).toBeVisible();
      await expect(verificationRow.getByText('Bank BSI')).toBeVisible();
      await expect(verificationRow.getByText(/menunggu/i)).toBeVisible();

      // 7. Uji tombol "Lihat Struk" (Preview Modal)
      const seeProofBtn = verificationRow.getByRole('button', { name: /lihat struk/i });
      await expect(seeProofBtn).toBeVisible();
      await seeProofBtn.click();

      // Pastikan modal preview terbuka
      const previewModal = page.getByRole('dialog');
      await expect(previewModal).toBeVisible();
      await expect(previewModal.getByText(/bukti transfer pembayaran spp/i)).toBeVisible();
      await expect(previewModal.getByText('Wali Zaid bin Tsabit')).toBeVisible();

      // Tutup modal
      await previewModal.getByRole('button', { name: /tutup/i }).click();
      await expect(previewModal).not.toBeVisible();

      // 8. Setujui (Approve) Pembayaran
      const approveBtn = verificationRow.getByRole('button', { name: /setujui/i });
      await expect(approveBtn).toBeVisible();
      await approveBtn.click();

      // Pastikan toast sukses muncul
      await expect(page.getByText(/berhasil disetujui/i)).toBeVisible({ timeout: 5000 });

      // Klik filter pill "Disetujui" untuk melihat data yang baru saja disetujui
      await page.getByRole('button', { name: 'Disetujui' }).click();
      const approvedRow = page.locator('tr').filter({ hasText: 'Zaid bin Tsabit' }).first();
      await expect(approvedRow.getByText(/disetujui/i)).toBeVisible({ timeout: 5000 });

      // 9. Verifikasi di tab Tagihan Santri
      await billsTab.click();
      const updatedZaidRow = page.locator('tr').filter({ hasText: 'Zaid bin Tsabit' }).first();
      await expect(updatedZaidRow).toBeVisible();

      // 10. Pengujian Penolakan (Reject) Pembayaran
      const nextUnpaidBill = billsData.data.find((b: any) => b.status === 'UNPAID' && b.id !== unpaidBill.id);
      if (nextUnpaidBill) {
        await page.request.post('/api/proxy/spp/submit-payment', {
          multipart: {
            student_id: '2',
            'bill_ids[]': nextUnpaidBill.id,
            total_amount: nextUnpaidBill.amount_billed.toString(),
            sender_bank_name: 'Bank Mandiri',
            sender_account_holder: 'Wali Zaid bin Tsabit',
            proof: {
              name: 'bukti_transfer.png',
              mimeType: 'image/png',
              buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
            },
          },
        });

        await page.reload();
        await verificationsTab.click();
        const pendingRow = page.locator('tr').filter({ hasText: 'Bank Mandiri' }).first();
        await expect(pendingRow).toBeVisible({ timeout: 10000 });

        // Klik tombol Tolak
        const rejectBtn = pendingRow.getByRole('button', { name: /tolak/i });
        await rejectBtn.click();

        // Modal input alasan penolakan terbuka
        const rejectModal = page.getByRole('dialog');
        await expect(rejectModal.getByText(/tolak pembayaran spp/i)).toBeVisible();

        // Isi alasan penolakan
        await rejectModal.locator('textarea').fill('Nomor mutasi tidak ditemukan pada rekening pondok');
        await rejectModal.getByRole('button', { name: /tolak pembayaran/i }).click();

        // Pastikan modal penolakan tertutup
        await expect(rejectModal).not.toBeVisible({ timeout: 5000 });

        // Verifikasi pada filter Ditolak
        await page.getByRole('button', { name: 'Ditolak' }).click();
        const rejectedRow = page.locator('tr').filter({ hasText: 'Bank Mandiri' }).first();
        await expect(rejectedRow).toBeVisible({ timeout: 5000 });
        await expect(rejectedRow.getByText(/ditolak/i)).toBeVisible();
      }
    }
  });
});
