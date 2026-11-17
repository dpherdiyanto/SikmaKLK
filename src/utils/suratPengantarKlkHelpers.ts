import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Mahasiswa, PengajuanKLK } from '../types/sikma';

export interface SuratPengantarKlkData {
  nomorSurat: string;
  lampiran: string;
  perihal: string;
  tanggalSurat: string;
  tujuanJabatan: string;
  namaMitra: string;
  alamatMitra: string;
  mahasiswaNama: string;
  nim: string;
  programStudi: string;
  semesterLabel: string;
  skema: string;
  sksDiakui: number;
  bidangPekerjaan: string;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  dosenPA: string;
  dosenPembimbingKLK?: string;
  kodePendaftaran: string;
  paragrafPembuka: string;
  paragrafPenutup: string;
  paragrafUcapan: string;
  tembusanText: string;
  qrDataUrl?: string;
}

const SURAT_PENGANTAR_STORAGE_KEY = 'sikma_surat_pengantar_klk_custom_v1';

const ANGKA_TERBILANG = [
  'nol',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh'
];

export function formatJumlahBerkasLampiran(jumlahBerkas: number): string {
  const count = Math.max(1, jumlahBerkas);
  const kata = ANGKA_TERBILANG[count] || String(count);
  return `${count} (${kata}) berkas`;
}

export function resolveDosenPAForKlk(
  klk: PengajuanKLK,
  mahasiswaList: Mahasiswa[]
): string {
  const cleanNim = (klk.nim || '').replace(/\D/g, '');
  const mhs = mahasiswaList.find(
    (m) =>
      m.id === klk.mahasiswaId ||
      (cleanNim && m.nim && m.nim.replace(/\D/g, '') === cleanNim)
  );
  return (
    mhs?.dosenPANama ||
    klk.dpaNama ||
    'Dr. Dra. Hermin Sulistyarti, M.Si'
  );
}

export function countAttachedBerkasForKlk(klk: PengajuanKLK): number {
  const attachedDocs = [
    klk.dokumenSuratLamaran,
    klk.dokumenProposal,
    klk.dokumenCV,
    klk.dokumenTranskrip,
    klk.dokumenLoA
  ].filter((doc) => Boolean(doc && doc.trim()));

  return attachedDocs.length > 0 ? attachedDocs.length : 4;
}

export function buildDefaultSuratPengantarData(
  klk: PengajuanKLK,
  mahasiswaList: Mahasiswa[]
): SuratPengantarKlkData {
  const jumlahBerkas = countAttachedBerkasForKlk(klk);
  const dosenPA = resolveDosenPAForKlk(klk, mahasiswaList);
  const tanggalSurat = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const cleanDpl =
    klk.dosenPembimbingKLK && !klk.dosenPembimbingKLK.includes('Belum Ditetapkan')
      ? klk.dosenPembimbingKLK
      : dosenPA;

  const lampiranLabel = formatJumlahBerkasLampiran(jumlahBerkas);

  return {
    nomorSurat: '', // Dikosongkan sesuai kebutuhan administrasi TU
    lampiran: lampiranLabel,
    perihal: 'Permohonan Izin Pelaksanaan Kuliah Lapangan Kimia (KLK)',
    tanggalSurat,
    tujuanJabatan: 'Pimpinan / Direktur / HRD',
    namaMitra: klk.namaMitra || '-',
    alamatMitra: klk.alamatMitra || 'Di Tempat',
    mahasiswaNama: klk.mahasiswaNama || '-',
    nim: klk.nim || '-',
    programStudi: 'Sarjana (S1) Kimia',
    semesterLabel: `Semester ${klk.semester || '-'}${klk.namaSemester ? ` (${klk.namaSemester})` : ''}`,
    skema: klk.skema || 'Magang Industri',
    sksDiakui: klk.sksDiakui || 7,
    bidangPekerjaan: klk.bidangPekerjaan || 'Analisis Kimia & Pengendalian Mutu (QC)',
    keperluan: `Permohonan izin pelaksanaan Kegiatan Mahasiswa di Luar Kampus / Kuliah Lapangan Kimia (KLK) skema ${klk.skema || 'Magang Industri'} (${klk.sksDiakui || 7} SKS) di bidang ${klk.bidangPekerjaan || 'Kimia Terapan & Laboratorium'}.`,
    tanggalMulai: klk.tanggalMulai || '-',
    tanggalSelesai: klk.tanggalSelesai || '-',
    dosenPA,
    dosenPembimbingKLK: cleanDpl,
    kodePendaftaran: klk.kodePendaftaran || klk.id,
    paragrafPembuka:
      'Sehubungan dengan pelaksanaan kurikulum Program Studi Sarjana (S1) Kimia Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya yang mewajibkan mahasiswa mengikuti Kegiatan Mahasiswa di Luar Kampus / Kuliah Lapangan Kimia (KLK) sebagai sarana penguasaan kompetensi riset dan aplikasi kimia pada dunia kerja, bersama ini kami mengajukan permohonan izin bagi mahasiswa kami:',
    paragrafPenutup: `Besar harapan kami Bapak/Ibu Pimpinan berkenan memberikan kesempatan kepada mahasiswa yang bersangkutan untuk melaksanakan kegiatan tersebut di instansi/perusahaan yang Bapak/Ibu pimpin. Sebagai kelengkapan administrasi, bersama ini kami sertakan ${lampiranLabel} dokumen pendukung.`,
    paragrafUcapan:
      'Demikian surat pengantar ini kami sampaikan. Atas perhatian, kesediaan, dan kerja sama yang baik, kami ucapkan terima kasih.',
    tembusanText: `1. Ketua Program Sarjana Kimia\n2. Dosen Pembimbing Akademik (${dosenPA})`
  };
}

export function getSuratPengantarDataForKlk(
  klk: PengajuanKLK,
  mahasiswaList: Mahasiswa[]
): SuratPengantarKlkData {
  const defaults = buildDefaultSuratPengantarData(klk, mahasiswaList);
  try {
    const raw = localStorage.getItem(SURAT_PENGANTAR_STORAGE_KEY);
    if (!raw) return defaults;
    const map = JSON.parse(raw) as Record<string, Partial<SuratPengantarKlkData>>;
    const saved = map?.[klk.id];
    if (!saved) return defaults;
    return {
      ...defaults,
      ...saved
    };
  } catch {
    return defaults;
  }
}

export function saveCustomSuratPengantarForKlk(
  klkId: string,
  data: SuratPengantarKlkData
): void {
  try {
    const raw = localStorage.getItem(SURAT_PENGANTAR_STORAGE_KEY);
    const map: Record<string, Partial<SuratPengantarKlkData>> = raw ? JSON.parse(raw) : {};
    const { qrDataUrl: _omitQr, ...serializable } = data;
    map[klkId] = serializable;
    localStorage.setItem(SURAT_PENGANTAR_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function resetCustomSuratPengantarForKlk(klkId: string): void {
  try {
    const raw = localStorage.getItem(SURAT_PENGANTAR_STORAGE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, Partial<SuratPengantarKlkData>>;
    if (map && map[klkId]) {
      delete map[klkId];
      localStorage.setItem(SURAT_PENGANTAR_STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}

export async function generateSuratPengantarQrDataUrl(
  data: SuratPengantarKlkData
): Promise<string> {
  const payload = [
    'TANDA TANGAN ELEKTRONIK SAH',
    'Kepala Departemen Kimia FSTeM UB',
    'Nama: Prof. Anna Safitri, S.Si., M.Sc., Ph.D',
    'NIP: 198008132005022008',
    `Perihal: ${data.perihal}`,
    `Tujuan: ${data.namaMitra}`,
    `Mahasiswa: ${data.mahasiswaNama} (${data.nim})`,
    `Kode KLK: ${data.kodePendaftaran}`,
    `Tanggal: ${data.tanggalSurat}`
  ].join('\n');

  return QRCode.toDataURL(payload, {
    width: 180,
    margin: 1,
    color: {
      dark: '#002B49',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function downloadSuratPengantarPerusahaanPdf(
  data: SuratPengantarKlkData
): Promise<void> {
  const qrDataUrl = data.qrDataUrl || (await generateSuratPengantarQrDataUrl(data));
  const doc = new jsPDF('p', 'mm', 'a4');

  // Kop Surat Resmi Departemen Kimia UB
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', 105, 16, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('UNIVERSITAS BRAWIJAYA', 105, 22, { align: 'center' });
  doc.setFontSize(11);
  doc.text('FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA', 105, 27.5, { align: 'center' });
  doc.text('DEPARTEMEN KIMIA', 105, 33, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('Jalan Veteran, Malang 65145, Jawa Timur, Indonesia', 105, 38, { align: 'center' });
  doc.text('Telp. (0341) 554403, 575838 | Email: kimia@ub.ac.id | Web: https://kimia.ub.ac.id', 105, 42, { align: 'center' });

  // Garis Kop Ganda
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.9);
  doc.line(20, 45.5, 190, 45.5);
  doc.setLineWidth(0.25);
  doc.line(20, 47, 190, 47);

  // Header Nomor, Lampiran, Perihal & Tanggal
  let y = 55;
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);

  doc.text(`Malang, ${data.tanggalSurat}`, 190, y, { align: 'right' });

  doc.text('Nomor', 20, y);
  doc.text(':', 42, y);
  if (data.nomorSurat.trim()) {
    doc.text(data.nomorSurat.trim(), 45, y);
  }

  y += 5.5;
  doc.text('Lampiran', 20, y);
  doc.text(':', 42, y);
  doc.text(data.lampiran, 45, y);

  y += 5.5;
  doc.text('Perihal', 20, y);
  doc.text(':', 42, y);
  doc.setFont('times', 'bold');
  const perihalLines = doc.splitTextToSize(data.perihal, 110);
  doc.text(perihalLines, 45, y);
  y += Math.max(perihalLines.length * 5, 5.5) + 5;

  // Tujuan Surat
  doc.setFont('times', 'normal');
  doc.text('Kepada Yth.', 20, y);
  y += 5.2;
  doc.setFont('times', 'bold');
  doc.text(data.tujuanJabatan, 20, y);
  y += 5.2;
  doc.text(data.namaMitra, 20, y);
  y += 5.2;
  doc.setFont('times', 'normal');
  const alamatLines = doc.splitTextToSize(data.alamatMitra || 'Di Tempat', 130);
  doc.text(alamatLines, 20, y);
  y += Math.max(alamatLines.length * 5, 5) + 6;

  // Paragraf Pembuka
  doc.text('Dengan hormat,', 20, y);
  y += 6;
  const introText = data.paragrafPembuka || '';
  if (introText.trim()) {
    const introLines = doc.splitTextToSize(introText, 170);
    doc.text(introLines, 20, y);
    y += introLines.length * 5 + 4;
  }

  // Identitas Mahasiswa & Keperluan
  const infoRows: Array<[string, string]> = [
    ['Nama Mahasiswa', data.mahasiswaNama],
    ['NIM', data.nim],
    ['Program Studi', data.programStudi],
    ['Semester', data.semesterLabel],
    ['Skema Kegiatan', `${data.skema} (${data.sksDiakui} SKS)`],
    ['Bidang Pekerjaan / Topik', data.bidangPekerjaan],
    ['Rencana Pelaksanaan', `${data.tanggalMulai} s.d. ${data.tanggalSelesai}`],
    ['Keperluan', data.keperluan]
  ];

  infoRows.forEach(([label, value]) => {
    doc.setFont('times', 'normal');
    doc.text(label, 25, y);
    doc.text(':', 70, y);
    doc.setFont('times', label === 'Nama Mahasiswa' || label === 'NIM' ? 'bold' : 'normal');
    const valLines = doc.splitTextToSize(value, 115);
    doc.text(valLines, 74, y);
    y += Math.max(valLines.length * 5, 5.5);
  });

  y += 4;
  doc.setFont('times', 'normal');
  const closingText = data.paragrafPenutup || '';
  if (closingText.trim()) {
    const closingLines = doc.splitTextToSize(closingText, 170);
    doc.text(closingLines, 20, y);
    y += closingLines.length * 5 + 4;
  }

  const thanksText = data.paragrafUcapan || '';
  if (thanksText.trim()) {
    const thanksLines = doc.splitTextToSize(thanksText, 170);
    doc.text(thanksLines, 20, y);
    y += thanksLines.length * 5 + 8;
  }

  // Tanda Tangan Elektronik Kepala Departemen Kimia (kanan)
  const sigX = 118;
  const sigStartY = Math.min(y, 224);
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.text(`Malang, ${data.tanggalSurat}`, sigX, sigStartY);
  doc.text('Kepala Departemen Kimia,', sigX, sigStartY + 5);

  // Kotak QR Tanda Tangan Elektronik
  doc.addImage(qrDataUrl, 'PNG', sigX, sigStartY + 8, 22, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 43, 73);
  doc.text('Ditandatangani secara elektronik oleh:', sigX + 24, sigStartY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Departemen Kimia UB', sigX + 24, sigStartY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 122, 85);
  doc.text('Terverifikasi Digital (SIKMA-UB)', sigX + 24, sigStartY + 21);

  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('Prof. Anna Safitri, S.Si., M.Sc., Ph.D', sigX, sigStartY + 35);
  doc.setLineWidth(0.3);
  doc.line(sigX, sigStartY + 36, sigX + 66, sigStartY + 36);
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('NIP. 198008132005022008', sigX, sigStartY + 40.5);

  // Tembusan (kiri bawah)
  const tembusanY = sigStartY + 44;
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Tembusan:', 20, tembusanY);
  doc.setFont('times', 'normal');
  const tembusanLines = (data.tembusanText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  tembusanLines.forEach((line, idx) => {
    doc.text(line, 20, tembusanY + 4.8 * (idx + 1));
  });

  const safeMitra = (data.namaMitra || 'Mitra')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  doc.save(`Surat_Pengantar_KLK_${data.nim}_${safeMitra}.pdf`);
}

export async function printSuratPengantarPerusahaan(
  data: SuratPengantarKlkData
): Promise<void> {
  const qrDataUrl = data.qrDataUrl || (await generateSuratPengantarQrDataUrl(data));

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

  const html = `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Surat Pengantar KLK - ${escapeHtml(data.mahasiswaNama)} (${escapeHtml(data.nim)})</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 16mm 20mm 16mm 20mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        font-family: "Times New Roman", Times, serif;
        color: #111827;
        font-size: 11pt;
        line-height: 1.45;
        margin: 0;
        padding: 0;
      }
      .kop {
        text-align: center;
        border-bottom: 3px double #000000;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .kop .kementerian {
        font-size: 9.5pt;
        letter-spacing: 0.4px;
      }
      .kop .ub {
        font-size: 13pt;
        font-weight: bold;
        letter-spacing: 0.5px;
      }
      .kop .fakultas, .kop .dept {
        font-size: 11pt;
        font-weight: bold;
      }
      .kop .alamat {
        font-size: 8.5pt;
        margin-top: 2px;
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .meta-table {
        border-collapse: collapse;
      }
      .meta-table td {
        padding: 1.5px 4px 1.5px 0;
        vertical-align: top;
      }
      .meta-label {
        width: 78px;
      }
      .meta-colon {
        width: 12px;
      }
      .tujuan {
        margin-bottom: 16px;
      }
      .body-p {
        text-align: justify;
        margin: 0 0 10px 0;
      }
      .identitas-table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0 14px 18px;
      }
      .identitas-table td {
        padding: 2.5px 4px 2.5px 0;
        vertical-align: top;
      }
      .id-label {
        width: 175px;
      }
      .id-colon {
        width: 12px;
      }
      .ttd-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-top: 22px;
      }
      .ttd-box {
        width: 280px;
      }
      .qr-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 8px 0;
      }
      .qr-row img {
        width: 74px;
        height: 74px;
        border: 1px solid #cbd5e1;
        padding: 2px;
      }
      .qr-note {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 7.5pt;
        line-height: 1.35;
        color: #1e293b;
      }
      .qr-note .verified {
        color: #047857;
        font-weight: bold;
      }
      .pejabat-nama {
        font-weight: bold;
        text-decoration: underline;
      }
      .tembusan {
        margin-top: 18px;
        font-size: 10pt;
      }
      .tembusan ol {
        margin: 3px 0 0 18px;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div class="kop">
      <div class="kementerian">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
      <div class="ub">UNIVERSITAS BRAWIJAYA</div>
      <div class="fakultas">FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA</div>
      <div class="dept">DEPARTEMEN KIMIA</div>
      <div class="alamat">
        Jalan Veteran, Malang 65145, Jawa Timur, Indonesia<br />
        Telp. (0341) 554403, 575838 | Email: kimia@ub.ac.id | Web: https://kimia.ub.ac.id
      </div>
    </div>

    <div class="meta-row">
      <table class="meta-table">
        <tr>
          <td class="meta-label">Nomor</td>
          <td class="meta-colon">:</td>
          <td>${escapeHtml(data.nomorSurat)}</td>
        </tr>
        <tr>
          <td class="meta-label">Lampiran</td>
          <td class="meta-colon">:</td>
          <td>${escapeHtml(data.lampiran)}</td>
        </tr>
        <tr>
          <td class="meta-label">Perihal</td>
          <td class="meta-colon">:</td>
          <td><strong>${escapeHtml(data.perihal)}</strong></td>
        </tr>
      </table>
      <div>Malang, ${escapeHtml(data.tanggalSurat)}</div>
    </div>

    <div class="tujuan">
      <div>Kepada Yth.</div>
      <div><strong>${escapeHtml(data.tujuanJabatan)}</strong></div>
      <div><strong>${escapeHtml(data.namaMitra)}</strong></div>
      <div>${escapeHtml(data.alamatMitra || 'Di Tempat')}</div>
    </div>

    <p class="body-p">Dengan hormat,</p>
    <p class="body-p">${escapeHtml(data.paragrafPembuka)}</p>

    <table class="identitas-table">
      <tr>
        <td class="id-label">Nama Mahasiswa</td>
        <td class="id-colon">:</td>
        <td><strong>${escapeHtml(data.mahasiswaNama)}</strong></td>
      </tr>
      <tr>
        <td class="id-label">NIM</td>
        <td class="id-colon">:</td>
        <td><strong>${escapeHtml(data.nim)}</strong></td>
      </tr>
      <tr>
        <td class="id-label">Program Studi</td>
        <td class="id-colon">:</td>
        <td>${escapeHtml(data.programStudi)}</td>
      </tr>
      <tr>
        <td class="id-label">Semester</td>
        <td class="id-colon">:</td>
        <td>${escapeHtml(data.semesterLabel)}</td>
      </tr>
      <tr>
        <td class="id-label">Skema Kegiatan</td>
        <td class="id-colon">:</td>
        <td>${escapeHtml(data.skema)} (${data.sksDiakui} SKS)</td>
      </tr>
      <tr>
        <td class="id-label">Bidang Pekerjaan / Topik</td>
        <td class="id-colon">:</td>
        <td>${escapeHtml(data.bidangPekerjaan)}</td>
      </tr>
      <tr>
        <td class="id-label">Rencana Pelaksanaan</td>
        <td class="id-colon">:</td>
        <td>${escapeHtml(data.tanggalMulai)} s.d. ${escapeHtml(data.tanggalSelesai)}</td>
      </tr>
      <tr>
        <td class="id-label">Keperluan</td>
        <td class="id-colon">:</td>
        <td>${escapeHtml(data.keperluan)}</td>
      </tr>
    </table>

    <p class="body-p">${escapeHtml(data.paragrafPenutup)}</p>
    <p class="body-p">${escapeHtml(data.paragrafUcapan)}</p>

    <div class="ttd-wrapper">
      <div class="ttd-box">
        <div>Malang, ${escapeHtml(data.tanggalSurat)}</div>
        <div>Kepala Departemen Kimia,</div>
        <div class="qr-row">
          <img id="qr-tte-img" src="${qrDataUrl}" alt="QR Tanda Tangan Elektronik" />
          <div class="qr-note">
            <div>Ditandatangani secara elektronik oleh:</div>
            <div><strong>Kepala Departemen Kimia UB</strong></div>
            <div class="verified">Terverifikasi Digital (SIKMA-UB)</div>
          </div>
        </div>
        <div class="pejabat-nama">Prof. Anna Safitri, S.Si., M.Sc., Ph.D</div>
        <div>NIP. 198008132005022008</div>
      </div>
    </div>

    <div class="tembusan">
      <div><strong>Tembusan:</strong></div>
      <div>${(data.tembusanText || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `<div>${escapeHtml(l)}</div>`)
        .join('')}</div>
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

  const qrImg = doc.getElementById('qr-tte-img') as HTMLImageElement | null;
  if (qrImg && !qrImg.complete) {
    qrImg.onload = triggerPrint;
    qrImg.onerror = triggerPrint;
  } else {
    setTimeout(triggerPrint, 120);
  }
}
