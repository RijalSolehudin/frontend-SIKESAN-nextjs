import { LedgerTransaction } from '../types';
import { numberToWordsIndonesian } from './printReceipt';

export interface PrintLedgerOptions {
  transactions: LedgerTransaction[];
  periodMonth: number | 'all';
  periodYear: number | 'all';
  totalIn: number;
  totalOut: number;
  netFlow: number;
  officerName?: string;
}

const MONTH_NAMES: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
};

export function printLedgerReport(options: PrintLedgerOptions) {
  const {
    transactions,
    periodMonth,
    periodYear,
    totalIn,
    totalOut,
    netFlow,
    officerName = 'Bendahara Keuangan',
  } = options;

  const printFrame = document.createElement('iframe');
  printFrame.setAttribute(
    'style',
    'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; border: 0; opacity: 0;'
  );
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) return;

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  // Resolve Period Text
  let periodText = 'Seluruh Periode (All Time)';
  if (periodMonth !== 'all' && periodYear !== 'all') {
    periodText = `${MONTH_NAMES[Number(periodMonth)] || `Bulan ${periodMonth}`} ${periodYear}`;
  } else if (periodMonth === 'all' && periodYear !== 'all') {
    periodText = `Tahun ${periodYear} (Semua Bulan)`;
  } else if (periodMonth !== 'all' && periodYear === 'all') {
    periodText = `Bulan ${MONTH_NAMES[Number(periodMonth)] || `Bulan ${periodMonth}`} (Semua Tahun)`;
  }

  const currentDate = new Date();
  const printDateStr = currentDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const printTimeStr = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const docNumber = `BK-LGD/${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate Running Balance for table display
  // Sorting chronologically for calculation (oldest to newest), but usually printed in chronological order
  const chronological = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningBalance = 0;
  const rowsWithBalance = chronological.map((trx, idx) => {
    if (trx.is_debit) {
      runningBalance += trx.amount;
    } else {
      runningBalance -= trx.amount;
    }

    const typeBadge =
      trx.type === 'SPP_PAYMENT'
        ? 'SPP'
        : trx.type === 'INFAQ'
        ? 'Infaq'
        : trx.type === 'EXPENSE'
        ? 'Beban'
        : trx.type === 'TOP_UP'
        ? 'Top Up'
        : trx.type;

    const formattedDate = new Date(trx.date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <tr>
        <td style="text-align: center; padding: 6px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10px;">${idx + 1}</td>
        <td style="text-align: center; padding: 6px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px; white-space: nowrap;">${formattedDate}</td>
        <td style="text-align: center; padding: 6px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">${trx.reference_id ? trx.reference_id.slice(-8) : '-'}</td>
        <td style="text-align: center; padding: 6px 6px; border: 1px solid #cbd5e1; font-size: 9.5px; font-weight: 600;">${typeBadge}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px;">${trx.description || '-'}</td>
        <td style="text-align: right; padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #047857; font-size: 10px;">
          ${trx.is_debit ? formatRupiah(trx.amount) : '-'}
        </td>
        <td style="text-align: right; padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #b91c1c; font-size: 10px;">
          ${!trx.is_debit ? formatRupiah(trx.amount) : '-'}
        </td>
        <td style="text-align: right; padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a; font-size: 10px;">
          ${formatRupiah(runningBalance)}
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Buku Besar - ${periodText}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
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
          font-size: 10.5px;
          line-height: 1.35;
        }
        .report-wrapper {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 4px;
        }
        /* Kop Surat Resmi Pesantren */
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
          font-size: 9px;
          color: #64748b;
          margin: 0;
        }
        /* Header Dokumen */
        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #cbd5e1;
        }
        .doc-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          margin: 0 0 3px 0;
          letter-spacing: 0.5px;
        }
        .doc-subtitle {
          font-size: 10.5px;
          color: #047857;
          font-weight: 700;
          margin: 0;
        }
        .doc-meta {
          text-align: right;
          font-size: 9.5px;
          color: #475569;
          line-height: 1.4;
        }
        /* Ringkasan Finansial Card */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .summary-box {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 7px 10px;
          background: #f8fafc;
        }
        .summary-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .summary-val {
          font-size: 13px;
          font-weight: 800;
          font-family: monospace;
        }
        /* Tabel Jurnal */
        table.ledger-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        table.ledger-table th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
          font-size: 9.5px;
          text-transform: uppercase;
          padding: 6px 6px;
          border: 1px solid #cbd5e1;
          letter-spacing: 0.3px;
        }
        table.ledger-table td {
          border: 1px solid #cbd5e1;
        }
        .table-footer td {
          background: #f8fafc;
          font-weight: 800;
          padding: 8px 8px;
          border: 1px solid #94a3b8;
        }
        /* Terbilang Note */
        .terbilang-box {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          padding: 6px 10px;
          border-radius: 5px;
          font-size: 9.5px;
          color: #334155;
          margin-bottom: 16px;
        }
        /* Tanda Tangan */
        .signature-section {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature-box {
          width: 220px;
          text-align: center;
          font-size: 10px;
        }
        .signature-space {
          height: 52px;
        }
        .signature-name {
          font-weight: 800;
          border-bottom: 1px solid #0f172a;
          padding-bottom: 2px;
          display: inline-block;
          min-width: 160px;
        }
        .signature-role {
          font-size: 9px;
          color: #475569;
          margin-top: 3px;
        }
      </style>
    </head>
    <body>
      <div class="report-wrapper">
        <!-- Kop Lembaga -->
        <div class="kop-container">
          <div class="kop-title">PONDOK PESANTREN SIKESAN</div>
          <div class="kop-sub">Sistem Informasi Keuangan & Santri (SIKESAN)</div>
          <div class="kop-contact">
            Jl. Pesantren Luhur No. 1, Jawa Barat, Indonesia • Telp: +62 812-9876-5432 • Email: keuangan@sikesan.ac.id
          </div>
        </div>

        <!-- Header Dokumen -->
        <div class="doc-header">
          <div>
            <h1 class="doc-title">Laporan Buku Besar Kas (General Ledger)</h1>
            <p class="doc-subtitle">Periode: ${periodText}</p>
          </div>
          <div class="doc-meta">
            <div><strong>No. Dokumen:</strong> ${docNumber}</div>
            <div><strong>Tanggal Cetak:</strong> ${printDateStr} (${printTimeStr} WIB)</div>
            <div><strong>Petugas:</strong> ${officerName}</div>
          </div>
        </div>

        <!-- Ringkasan Finansial -->
        <div class="summary-grid">
          <div class="summary-box">
            <div class="summary-label">Total Debet (Pemasukan)</div>
            <div class="summary-val" style="color: #047857;">${formatRupiah(totalIn)}</div>
          </div>
          <div class="summary-box">
            <div class="summary-label">Total Kredit (Pengeluaran)</div>
            <div class="summary-val" style="color: #b91c1c;">${formatRupiah(totalOut)}</div>
          </div>
          <div class="summary-box">
            <div class="summary-label">Saldo Bersih / Net Flow</div>
            <div class="summary-val" style="color: ${netFlow >= 0 ? '#047857' : '#b91c1c'};">
              ${formatRupiah(netFlow)}
              <span style="font-size: 9px; font-weight: 700; text-transform: uppercase;">
                (${netFlow >= 0 ? 'Surplus' : 'Defisit'})
              </span>
            </div>
          </div>
        </div>

        <!-- Tabel Jurnal Mutasi -->
        <table class="ledger-table">
          <thead>
            <tr>
              <th style="width: 28px;">No</th>
              <th style="width: 95px;">Waktu</th>
              <th style="width: 65px;">No. Ref</th>
              <th style="width: 55px;">Jenis</th>
              <th>Uraian / Keterangan Transaksi</th>
              <th style="width: 85px; text-align: right;">Debet (Rp)</th>
              <th style="width: 85px; text-align: right;">Kredit (Rp)</th>
              <th style="width: 90px; text-align: right;">Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${
              rowsWithBalance ||
              '<tr><td colspan="8" style="text-align: center; padding: 16px; color: #94a3b8;">Tidak ada transaksi mutasi pada periode ini.</td></tr>'
            }
          </tbody>
          <tfoot>
            <tr class="table-footer">
              <td colspan="5" style="text-align: right; padding-right: 12px; font-weight: 800;">
                TOTAL MUTASI & SALDO AKHIR:
              </td>
              <td style="text-align: right; color: #047857; font-size: 10.5px;">${formatRupiah(totalIn)}</td>
              <td style="text-align: right; color: #b91c1c; font-size: 10.5px;">${formatRupiah(totalOut)}</td>
              <td style="text-align: right; font-size: 10.5px; color: #0f172a;">${formatRupiah(netFlow)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Terbilang Saldo Bersih -->
        <div class="terbilang-box">
          <strong>Terbilang Saldo Kas:</strong> <em>${numberToWordsIndonesian(Math.abs(netFlow))} Rupiah ${netFlow < 0 ? '(Defisit)' : ''}</em>
        </div>

        <!-- Tanda Tangan & Pengesahan -->
        <div class="signature-section">
          <div class="signature-box">
            <div>Dibuat oleh,</div>
            <div class="signature-role">Bendahara / Kasir Keuangan</div>
            <div class="signature-space"></div>
            <div class="signature-name">${officerName}</div>
            <div class="signature-role">Pengurus Keuangan Pesantren</div>
          </div>

          <div class="signature-box">
            <div>Jawa Barat, ${printDateStr}</div>
            <div class="signature-role">Mengetahui & Mengesahkan,</div>
            <div class="signature-space"></div>
            <div class="signature-name">K.H. Ahmad Dahlan, Lc., M.A.</div>
            <div class="signature-role">Mudir / Pimpinan Pondok Pesantren</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1500);
  }, 350);
}
