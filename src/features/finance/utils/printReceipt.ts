import { SppReceiptData } from '../types';
import { AnnualFeeReceiptData } from '../types/annual-fees';

export function numberToWordsIndonesian(num: number): string {
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  if (num === 0) return 'Nol';
  if (num < 12) return units[num];
  if (num < 20) return numberToWordsIndonesian(num - 10) + ' Belas';
  if (num < 100) return numberToWordsIndonesian(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + numberToWordsIndonesian(num % 10) : '');
  if (num < 200) return 'Seratus' + (num % 100 !== 0 ? ' ' + numberToWordsIndonesian(num % 100) : '');
  if (num < 1000) return numberToWordsIndonesian(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + numberToWordsIndonesian(num % 100) : '');
  if (num < 2000) return 'Seribu' + (num % 1000 !== 0 ? ' ' + numberToWordsIndonesian(num % 1000) : '');
  if (num < 1000000) return numberToWordsIndonesian(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + numberToWordsIndonesian(num % 1000) : '');
  if (num < 1000000000) return numberToWordsIndonesian(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + numberToWordsIndonesian(num % 1000000) : '');
  if (num < 1000000000000) return numberToWordsIndonesian(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + numberToWordsIndonesian(num % 1000000000) : '');
  
  return num.toString();
}

export function printSppReceipt(receipt: SppReceiptData) {
  const printFrame = document.createElement('iframe');
  printFrame.setAttribute('style', 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; border: 0; opacity: 0;');
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) return;

  const formattedDate = new Date(receipt.payment_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const billRows = receipt.bills.map((b, idx) => `
    <tr>
      <td style="text-align: center; padding: 7px 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0;">Iuran SPP Santri - <strong>${receipt.student?.name || '-'}</strong></td>
      <td style="text-align: center; padding: 7px 8px; border-bottom: 1px solid #e2e8f0; color: #334155;">${b.month_name} ${b.period_year}</td>
      <td style="text-align: right; padding: 7px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">${formatRupiah(b.allocated_amount)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Kwitansi SPP - ${receipt.receipt_number}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #0f172a;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.35;
        }
        .receipt-wrapper {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 10px 14px;
        }
        /* Kop Surat Resmi */
        .kop-container {
          text-align: center;
          border-bottom: 3px double #0f172a;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .kop-title {
          font-size: 17px;
          font-weight: 900;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 2px 0;
        }
        .kop-sub {
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          margin: 0 0 3px 0;
          text-transform: uppercase;
        }
        .kop-contact {
          font-size: 9.5px;
          color: #64748b;
          margin: 0;
        }
        /* Judul Kwitansi */
        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
        }
        .doc-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          margin: 0 0 3px 0;
          letter-spacing: 0.5px;
        }
        .doc-no {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #047857;
        }
        .doc-date {
          text-align: right;
          font-size: 10.5px;
          color: #475569;
        }
        /* Info Grid 2 Kolom */
        .info-grid {
          display: table;
          width: 100%;
          margin-bottom: 12px;
        }
        .info-col {
          display: table-cell;
          width: 50%;
          vertical-align: top;
        }
        .info-table {
          width: 100%;
          font-size: 10.5px;
        }
        .info-table td {
          padding: 2px 4px;
        }
        .info-table td.label {
          width: 85px;
          color: #64748b;
          font-weight: 500;
        }
        .info-table td.colon {
          width: 8px;
          color: #64748b;
        }
        .info-table td.val {
          color: #0f172a;
          font-weight: 700;
        }
        /* Table Breakdown */
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          font-size: 10.5px;
        }
        .table-data th {
          background-color: #f1f5f9;
          color: #334155;
          text-transform: uppercase;
          font-size: 9.5px;
          font-weight: 700;
          padding: 7px 8px;
          border-top: 1px solid #cbd5e1;
          border-bottom: 1px solid #cbd5e1;
        }
        .total-row td {
          border-top: 2px solid #0f172a;
          font-weight: 800;
          font-size: 12px;
          padding: 8px;
        }
        /* Terbilang Box */
        .terbilang-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 10.5px;
          margin-bottom: 14px;
        }
        .terbilang-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .terbilang-text {
          font-style: italic;
          font-weight: 700;
          color: #1e293b;
        }
        /* Footer & Tanda Tangan */
        .footer-grid {
          display: table;
          width: 100%;
          margin-top: 12px;
        }
        .footer-col-left {
          display: table-cell;
          width: 55%;
          vertical-align: bottom;
          font-size: 9.5px;
          color: #64748b;
          line-height: 1.4;
        }
        .footer-col-right {
          display: table-cell;
          width: 45%;
          text-align: center;
          vertical-align: top;
        }
        .stamp-lunas {
          display: inline-block;
          border: 2px solid #059669;
          color: #059669;
          font-size: 13px;
          font-weight: 900;
          padding: 2px 10px;
          border-radius: 5px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transform: rotate(-5deg);
          margin-bottom: 6px;
        }
        .signature-line {
          margin-top: 36px;
          border-top: 1px solid #0f172a;
          display: inline-block;
          min-width: 160px;
          padding-top: 4px;
          font-weight: 700;
          font-size: 10.5px;
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        <div class="kop-container">
          <h1 class="kop-title">${receipt.institution.name}</h1>
          <div class="kop-sub">${receipt.institution.sub_name}</div>
          <div class="kop-contact">${receipt.institution.address} • Telp: ${receipt.institution.phone} • Email: ${receipt.institution.email}</div>
        </div>

        <div class="doc-header">
          <div>
            <div class="doc-title">Kwitansi Bukti Pembayaran SPP</div>
            <div class="doc-no">No: ${receipt.receipt_number}</div>
          </div>
          <div class="doc-date">
            <div>Tanggal: <strong>${formattedDate}</strong></div>
            <div style="font-size: 9.5px; color: #64748b;">Pukul: ${receipt.payment_time} WIB</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-col">
            <table class="info-table">
              <tr>
                <td class="label">Nama Santri</td>
                <td class="colon">:</td>
                <td class="val">${receipt.student?.name || '-'}</td>
              </tr>
              <tr>
                <td class="label">NIS</td>
                <td class="colon">:</td>
                <td class="val" style="font-family: monospace;">${receipt.student?.nis || '-'}</td>
              </tr>
              <tr>
                <td class="label">Kelas</td>
                <td class="colon">:</td>
                <td class="val">${receipt.student?.classroom || '-'}</td>
              </tr>
              <tr>
                <td class="label">Asrama</td>
                <td class="colon">:</td>
                <td class="val">${receipt.student?.dormitory || '-'}</td>
              </tr>
            </table>
          </div>
          <div class="info-col">
            <table class="info-table">
              <tr>
                <td class="label">Wali Santri</td>
                <td class="colon">:</td>
                <td class="val">${receipt.guardian?.name || 'Wali Santri'}</td>
              </tr>
              <tr>
                <td class="label">No. Telepon</td>
                <td class="colon">:</td>
                <td class="val" style="font-family: monospace;">${receipt.guardian?.phone || '-'}</td>
              </tr>
              <tr>
                <td class="label">Metode Bayar</td>
                <td class="colon">:</td>
                <td class="val">${receipt.payment_method}</td>
              </tr>
              <tr>
                <td class="label">Status</td>
                <td class="colon">:</td>
                <td class="val" style="color: #059669;">LUNAS / SAH DITERIMA</td>
              </tr>
            </table>
          </div>
        </div>

        <table class="table-data">
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">No.</th>
              <th style="text-align: left;">Keterangan Pos Pembayaran</th>
              <th style="width: 125px; text-align: center;">Periode Tagihan</th>
              <th style="width: 135px; text-align: right;">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${billRows}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; text-transform: uppercase; font-size: 10.5px; padding-right: 10px;">Total Pembayaran:</td>
              <td style="text-align: right; color: #047857; font-size: 13px;">${formatRupiah(receipt.total_paid_amount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="terbilang-box">
          <div class="terbilang-label">Terbilang:</div>
          <div class="terbilang-text">"${numberToWordsIndonesian(receipt.total_paid_amount)} Rupiah"</div>
        </div>

        <div class="footer-grid">
          <div class="footer-col-left">
            <p style="margin: 0 0 2px 0;">• Dokumen ini merupakan bukti pembayaran resmi yang sah dari Sistem Keuangan SIKESAN.</p>
            <p style="margin: 0 0 2px 0;">• Simpan kwitansi ini sebagai bukti pelunasan administrasi pondok pesantren.</p>
            <p style="margin: 0; font-family: monospace; font-size: 9px; color: #94a3b8;">Ref ID: ${receipt.payment_id}</p>
          </div>
          <div class="footer-col-right">
            <div class="stamp-lunas">LUNAS</div>
            <div style="font-size: 9.5px; color: #64748b; margin-bottom: 2px;">Petugas Keuangan / Bendahara</div>
            <div class="signature-line">
              ${receipt.verifier?.name || receipt.creator?.name || 'Bendahara Pondok'}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  printFrame.contentWindow?.focus();
  setTimeout(() => {
    printFrame.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 2000);
  }, 250);
}

export function printAnnualFeeReceipt(receipt: AnnualFeeReceiptData) {
  const printFrame = document.createElement('iframe');
  printFrame.setAttribute('style', 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; border: 0; opacity: 0;');
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) return;

  const formattedDate = new Date(receipt.payment.payment_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const isLunas = receipt.remaining_balance <= 0;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Kwitansi Biaya Tahunan - ${receipt.payment.id}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
          background: #fff;
          font-size: 11px;
          line-height: 1.4;
        }
        .receipt-card {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          border: 1.5px solid #047857;
          border-radius: 8px;
          padding: 20px 24px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #047857;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .inst-title {
          font-size: 16px;
          font-weight: 800;
          color: #065f46;
          text-transform: uppercase;
        }
        .inst-sub {
          font-size: 10px;
          color: #475569;
        }
        .receipt-title-box {
          text-align: right;
        }
        .receipt-title {
          font-size: 16px;
          font-weight: 800;
          color: #047857;
          letter-spacing: 0.5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .info-row {
          display: flex;
          margin-bottom: 4px;
        }
        .info-label {
          width: 120px;
          font-size: 10.5px;
          color: #64748b;
          font-weight: 500;
        }
        .info-val {
          font-size: 11px;
          font-weight: 600;
          color: #0f172a;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .table-data th {
          background: #065f46;
          color: #fff;
          font-size: 10.5px;
          padding: 7px 10px;
          text-transform: uppercase;
        }
        .table-data td {
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .terbilang-box {
          background: #f0fdf4;
          border: 1px dashed #10b981;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 18px;
        }
        .terbilang-text {
          font-weight: 700;
          color: #065f46;
          font-style: italic;
        }
        .footer-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 20px;
        }
        .stamp-lunas {
          display: inline-block;
          border: 2px solid ${isLunas ? '#047857' : '#d97706'};
          color: ${isLunas ? '#047857' : '#d97706'};
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 8px;
          transform: rotate(-3deg);
        }
        .signature-line {
          margin-top: 45px;
          border-top: 1px solid #0f172a;
          padding-top: 3px;
          font-weight: 700;
          text-align: center;
          width: 160px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div>
            <div class="inst-title">PESANTREN SIKESAN</div>
            <div class="inst-sub">Sistem Informasi Keuangan Santri Terintegrasi</div>
          </div>
          <div class="receipt-title-box">
            <div class="receipt-title">KWITANSI PEMBAYARAN</div>
            <div style="font-size: 9.5px; color: #64748b;">No: KWT-BT-${receipt.payment.id.slice(0, 10).toUpperCase()}</div>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-row"><span class="info-label">Nama Santri:</span><span class="info-val">${receipt.student?.name || '-'}</span></div>
            <div class="info-row"><span class="info-label">NIS:</span><span class="info-val">${receipt.student?.nis || '-'}</span></div>
            <div class="info-row"><span class="info-label">Kelas / Jenjang:</span><span class="info-val">${receipt.student?.classroom?.name || '-'} (${receipt.student?.classroom?.education_level || '-'})</span></div>
          </div>
          <div>
            <div class="info-row"><span class="info-label">Tahun Ajaran:</span><span class="info-val">${receipt.bill?.academic_year?.name || '-'}</span></div>
            <div class="info-row"><span class="info-label">Tanggal Bayar:</span><span class="info-val">${formattedDate}</span></div>
            <div class="info-row"><span class="info-label">Metode:</span><span class="info-val">${receipt.payment.payment_method}</span></div>
          </div>
        </div>

        <table class="table-data">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">No.</th>
              <th style="text-align: left;">Keterangan Pembayaran</th>
              <th style="width: 140px; text-align: center;">Kategori Santri</th>
              <th style="width: 140px; text-align: right;">Jumlah Dibayar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td>
                <strong>Cicilan Biaya Tahunan (Uang Pangkal) Ke-${receipt.installment_number}</strong>
                ${receipt.payment.notes ? `<div style="font-size: 10px; color: #64748b;">Catatan: ${receipt.payment.notes}</div>` : ''}
              </td>
              <td style="text-align: center;">${receipt.bill.student_type === 'NEW' ? 'Santri Baru (Tahun ke-1)' : 'Santri Lama (Lanjutan)'}</td>
              <td style="text-align: right; font-weight: 700; color: #047857;">${formatRupiah(receipt.payment.amount)}</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 600;">
              <td colspan="3" style="text-align: right;">Total Biaya Tahunan:</td>
              <td style="text-align: right;">${formatRupiah(receipt.total_billed)}</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 600;">
              <td colspan="3" style="text-align: right;">Total Sudah Terbayar:</td>
              <td style="text-align: right; color: #047857;">${formatRupiah(receipt.total_paid)}</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 700;">
              <td colspan="3" style="text-align: right;">Sisa Tagihan:</td>
              <td style="text-align: right; color: ${isLunas ? '#047857' : '#dc2626'};">${formatRupiah(receipt.remaining_balance)}</td>
            </tr>
          </tbody>
        </table>

        <div class="terbilang-box">
          <div style="font-size: 10px; color: #047857; margin-bottom: 2px;">Jumlah yang dibayarkan saat ini:</div>
          <div class="terbilang-text">"${numberToWordsIndonesian(receipt.payment.amount)} Rupiah"</div>
        </div>

        <div class="footer-grid">
          <div>
            <p style="margin: 0 0 2px 0;">• Dokumen ini merupakan bukti cicilan sah dari Sistem Keuangan SIKESAN.</p>
            <p style="margin: 0; font-family: monospace; font-size: 9px; color: #94a3b8;">ID Pembayaran: ${receipt.payment.id}</p>
          </div>
          <div style="text-align: center;">
            <div class="stamp-lunas">${isLunas ? 'LUNAS' : 'CICILAN'}</div>
            <div style="font-size: 9.5px; color: #64748b;">Petugas Kasir / Bendahara</div>
            <div class="signature-line">
              ${receipt.payment.creator?.name || 'Bendahara Pondok'}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  printFrame.contentWindow?.focus();
  setTimeout(() => {
    printFrame.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 2000);
  }, 250);
}

