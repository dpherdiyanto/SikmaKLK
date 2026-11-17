import { jsPDF } from 'jspdf';
import { PengajuanKLK } from '../types/sikma';

export interface StoredSuratBalasanFile {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  sizeBytes?: number;
  uploadedAt?: string;
}

const STORAGE_KEY = 'sikma_surat_balasan_mitra_files_v1';
const memoryCache = new Map<string, StoredSuratBalasanFile>();

function readStorageMap(): Record<string, StoredSuratBalasanFile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSuratBalasanFile(
  klkId: string,
  fileData: StoredSuratBalasanFile
): void {
  if (!klkId || !fileData?.dataUrl) return;
  memoryCache.set(klkId, fileData);
  try {
    const map = readStorageMap();
    map[klkId] = fileData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Jika melebihi kuota localStorage, hapus entri lama selain klkId aktif lalu simpan ulang
    try {
      const compactMap: Record<string, StoredSuratBalasanFile> = { [klkId]: fileData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compactMap));
    } catch {
      // Tetap tersimpan di memoryCache jika berkas terlalu besar untuk localStorage
    }
  }
}

export function getSuratBalasanFile(klkId?: string): StoredSuratBalasanFile | null {
  if (!klkId) return null;
  const cached = memoryCache.get(klkId);
  if (cached) return cached;
  const map = readStorageMap();
  const stored = map[klkId];
  if (stored && stored.dataUrl) {
    memoryCache.set(klkId, stored);
    return stored;
  }
  return null;
}

export function clearSuratBalasanFile(klkId?: string): void {
  if (!klkId) return;
  memoryCache.delete(klkId);
  try {
    const map = readStorageMap();
    if (map[klkId]) {
      delete map[klkId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}

export function isImageFile(
  stored?: StoredSuratBalasanFile | null,
  fallbackFileName?: string
): boolean {
  if (!stored?.dataUrl) return false;
  const mime = (stored.mimeType || '').toLowerCase();
  const name = (stored.fileName || fallbackFileName || '').toLowerCase();
  return (
    mime.startsWith('image/') ||
    stored.dataUrl.startsWith('data:image/') ||
    /\.(png|jpe?g|webp|gif|bmp)$/.test(name)
  );
}

export function isPdfFile(
  stored?: StoredSuratBalasanFile | null,
  fallbackFileName?: string
): boolean {
  if (!stored?.dataUrl) return false;
  const mime = (stored.mimeType || '').toLowerCase();
  const name = (stored.fileName || fallbackFileName || '').toLowerCase();
  return (
    mime === 'application/pdf' ||
    mime.includes('pdf') ||
    stored.dataUrl.startsWith('data:application/pdf') ||
    name.endsWith('.pdf')
  );
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array | null {
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const base64 = dataUrl.slice(commaIdx + 1).replace(/\s/g, '');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveDosenPembimbingName(klk: PengajuanKLK): string {
  if (
    klk.dosenPembimbingKLK &&
    !klk.dosenPembimbingKLK.includes('Belum Ditetapkan')
  ) {
    return klk.dosenPembimbingKLK;
  }
  return klk.dpaNama || 'Dosen Pembimbing KLK';
}

export function downloadSuratBalasanMitra(
  klk: PengajuanKLK,
  overrideFile?: StoredSuratBalasanFile | null
): void {
  const stored = overrideFile || getSuratBalasanFile(klk.id);
  const defaultFileName =
    klk.dokumenSuratBalasanMitra ||
    `Surat_Penerimaan_Mitra_${(klk.nim || 'Mahasiswa').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;

  if (stored && stored.dataUrl) {
    const link = document.createElement('a');
    link.href = stored.dataUrl;
    link.download = stored.fileName || defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback: generate official PDF representation of the acceptance letter
  const doc = new jsPDF('p', 'mm', 'a4');
  const dosenName = resolveDosenPembimbingName(klk);

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text((klk.namaMitra || 'INSTANSI / PERUSAHAAN MITRA').toUpperCase(), 105, 22, {
    align: 'center'
  });
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text(klk.alamatMitra || 'Alamat Instansi / Perusahaan Mitra', 105, 28, {
    align: 'center'
  });
  doc.setLineWidth(0.8);
  doc.line(20, 33, 190, 33);
  doc.setLineWidth(0.25);
  doc.line(20, 34.5, 190, 34.5);

  let y = 45;
  doc.setFontSize(10.5);
  doc.text('SURAT KONFIRMASI / PENERIMAAN KLK', 105, y, { align: 'center' });
  y += 10;

  doc.text('Nomor Surat', 20, y);
  doc.text(':', 55, y);
  doc.text(klk.nomorSuratBalasanMitra || '-', 58, y);
  y += 6;

  doc.text('Tanggal Surat', 20, y);
  doc.text(':', 55, y);
  doc.text(klk.tanggalSuratBalasanMitra || '-', 58, y);
  y += 6;

  doc.text('Perihal', 20, y);
  doc.text(':', 55, y);
  doc.setFont('times', 'bold');
  doc.text('Persetujuan Penerimaan Mahasiswa KLK Departemen Kimia UB', 58, y);
  y += 10;

  doc.setFont('times', 'normal');
  doc.text('Kepada Yth.', 20, y);
  y += 5.5;
  doc.setFont('times', 'bold');
  doc.text('Dosen Pembimbing KLK / Koordinator Akademik', 20, y);
  y += 5.5;
  doc.text(dosenName, 20, y);
  y += 5.5;
  doc.setFont('times', 'normal');
  doc.text('Departemen Kimia FSTeM Universitas Brawijaya', 20, y);
  y += 10;

  const intro = `Dengan hormat, bersama surat ini kami menyampaikan bahwa mahasiswa Departemen Kimia Universitas Brawijaya berikut ini telah resmi DITERIMA untuk melaksanakan Kegiatan Mahasiswa di Luar Kampus / Kuliah Lapangan Kimia (KLK) di ${klk.namaMitra || 'instansi kami'}:`;
  const introLines = doc.splitTextToSize(intro, 170);
  doc.text(introLines, 20, y);
  y += introLines.length * 5.2 + 5;

  const rows: Array<[string, string]> = [
    ['Nama Mahasiswa', klk.mahasiswaNama || '-'],
    ['NIM', klk.nim || '-'],
    ['Kode Pendaftaran KLK', klk.kodePendaftaran || klk.id],
    ['Skema / Beban SKS', `${klk.skema || '-'} (${klk.sksDiakui || 7} SKS)`],
    ['Bidang Pekerjaan', klk.bidangPekerjaan || '-'],
    ['Periode Pelaksanaan', `${klk.tanggalMulai || '-'} s.d. ${klk.tanggalSelesai || '-'}`],
    ['Pembimbing Lapangan', klk.mentorIndustri || '-'],
    ['Nama Berkas Terlampir', defaultFileName]
  ];

  rows.forEach(([label, val]) => {
    doc.setFont('times', 'normal');
    doc.text(label, 24, y);
    doc.text(':', 70, y);
    doc.setFont('times', label === 'Nama Mahasiswa' || label === 'NIM' ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(val, 115);
    doc.text(lines, 74, y);
    y += Math.max(lines.length * 5, 5.5);
  });

  if (klk.catatanSuratBalasanMitra) {
    y += 5;
    doc.setFont('times', 'bold');
    doc.text('Catatan Pengantar Mahasiswa:', 20, y);
    y += 5;
    doc.setFont('times', 'italic');
    const noteLines = doc.splitTextToSize(`"${klk.catatanSuratBalasanMitra}"`, 170);
    doc.text(noteLines, 20, y);
    y += noteLines.length * 5;
  }

  y += 12;
  doc.setFont('times', 'normal');
  doc.text(`Diunggah & dikirim ke Dosen Pembimbing pada: ${klk.waktuKirimSuratBalasanMitra || '-'}`, 20, y);

  const safePdfName = defaultFileName.toLowerCase().endsWith('.pdf')
    ? defaultFileName
    : `${defaultFileName.replace(/\.[^.]+$/, '')}.pdf`;
  doc.save(safePdfName);
}

export function printSuratBalasanMitra(
  klk: PengajuanKLK,
  overrideFile?: StoredSuratBalasanFile | null
): void {
  const stored = overrideFile || getSuratBalasanFile(klk.id);
  const dosenName = resolveDosenPembimbingName(klk);
  const fileName =
    stored?.fileName ||
    klk.dokumenSuratBalasanMitra ||
    `Surat_Penerimaan_Mitra_${klk.nim}.pdf`;
  const isImage = Boolean(stored?.mimeType?.startsWith('image/'));

  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc || !printFrame.contentWindow) {
    document.body.removeChild(printFrame);
    return;
  }

  const html = isImage && stored?.dataUrl
    ? `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Surat Penerimaan Mitra - ${escapeHtml(klk.mahasiswaNama)}</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 0; }
      .meta { border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; font-size: 10pt; }
      .img-wrap { text-align: center; }
      img { max-width: 100%; max-height: 245mm; object-fit: contain; border: 1px solid #cbd5e1; }
    </style>
  </head>
  <body>
    <div class="meta">
      <strong>Surat Penerimaan Perusahaan / Mitra: ${escapeHtml(klk.namaMitra)}</strong><br />
      Mahasiswa: ${escapeHtml(klk.mahasiswaNama)} (${escapeHtml(klk.nim)}) &bull; Nomor Surat: ${escapeHtml(klk.nomorSuratBalasanMitra || '-')} &bull; Ditujukan ke: ${escapeHtml(dosenName)}
    </div>
    <div class="img-wrap">
      <img id="surat-img" src="${stored.dataUrl}" alt="${escapeHtml(fileName)}" />
    </div>
  </body>
</html>`
    : `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Surat Penerimaan Mitra - ${escapeHtml(klk.mahasiswaNama)}</title>
    <style>
      @page { size: A4 portrait; margin: 18mm 20mm; }
      * { box-sizing: border-box; }
      body { font-family: "Times New Roman", Times, serif; color: #111827; font-size: 11pt; line-height: 1.5; margin: 0; padding: 0; }
      .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 18px; }
      .kop h1 { font-size: 13pt; margin: 0; text-transform: uppercase; }
      .kop p { font-size: 9.5pt; margin: 2px 0 0 0; color: #334155; }
      .title { text-align: center; font-weight: bold; font-size: 12pt; text-decoration: underline; margin-bottom: 16px; }
      table { border-collapse: collapse; width: 100%; margin: 10px 0 14px 0; }
      td { padding: 3px 4px; vertical-align: top; }
      .label { width: 175px; }
      .colon { width: 12px; }
      .note { border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px; border-radius: 4px; margin-top: 12px; font-style: italic; font-size: 10pt; }
      .footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; color: #475569; }
    </style>
  </head>
  <body>
    <div class="kop">
      <h1>${escapeHtml(klk.namaMitra || 'INSTANSI / PERUSAHAAN MITRA')}</h1>
      <p>${escapeHtml(klk.alamatMitra || 'Alamat Instansi / Perusahaan Mitra')}</p>
    </div>
    <div class="title">SURAT BALASAN / PENERIMAAN KLK MAHASISWA</div>
    <table>
      <tr><td class="label">Nomor Surat</td><td class="colon">:</td><td><strong>${escapeHtml(klk.nomorSuratBalasanMitra || '-')}</strong></td></tr>
      <tr><td class="label">Tanggal Surat</td><td class="colon">:</td><td>${escapeHtml(klk.tanggalSuratBalasanMitra || '-')}</td></tr>
      <tr><td class="label">Ditujukan Kepada</td><td class="colon">:</td><td><strong>${escapeHtml(dosenName)}</strong> (Dosen Pembimbing KLK Dept. Kimia UB)</td></tr>
    </table>
    <p>Dengan hormat, melalui surat ini kami menerangkan bahwa mahasiswa Program Studi Sarjana (S1) Kimia Universitas Brawijaya berikut telah resmi <strong>DITERIMA</strong> untuk melaksanakan kegiatan KLK:</p>
    <table>
      <tr><td class="label">Nama Mahasiswa</td><td class="colon">:</td><td><strong>${escapeHtml(klk.mahasiswaNama)}</strong></td></tr>
      <tr><td class="label">NIM</td><td class="colon">:</td><td><strong>${escapeHtml(klk.nim)}</strong></td></tr>
      <tr><td class="label">Kode Pendaftaran</td><td class="colon">:</td><td>${escapeHtml(klk.kodePendaftaran || klk.id)}</td></tr>
      <tr><td class="label">Skema &amp; SKS</td><td class="colon">:</td><td>${escapeHtml(klk.skema)} (${klk.sksDiakui || 7} SKS)</td></tr>
      <tr><td class="label">Bidang Pekerjaan</td><td class="colon">:</td><td>${escapeHtml(klk.bidangPekerjaan)}</td></tr>
      <tr><td class="label">Periode Pelaksanaan</td><td class="colon">:</td><td>${escapeHtml(klk.tanggalMulai)} s.d. ${escapeHtml(klk.tanggalSelesai)}</td></tr>
      <tr><td class="label">Nama Berkas Unggahan</td><td class="colon">:</td><td>${escapeHtml(fileName)}</td></tr>
    </table>
    ${klk.catatanSuratBalasanMitra ? `<div class="note"><strong>Catatan Pengantar Mahasiswa:</strong><br/>&ldquo;${escapeHtml(klk.catatanSuratBalasanMitra)}&rdquo;</div>` : ''}
    <div class="footer">
      Diunggah melalui Portal SIKMA Kimia UB pada: ${escapeHtml(klk.waktuKirimSuratBalasanMitra || '-')} &bull; Status Verifikasi Dosen: ${escapeHtml(klk.statusVerifikasiSuratMitraDosen || 'Terkirim ke Dosen Pembimbing KLK')}
    </div>
  </body>
</html>`;

  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      }, 1500);
    }
  };

  const img = doc.getElementById('surat-img') as HTMLImageElement | null;
  if (img && !img.complete) {
    img.onload = triggerPrint;
    img.onerror = triggerPrint;
  } else {
    setTimeout(triggerPrint, 120);
  }
}
