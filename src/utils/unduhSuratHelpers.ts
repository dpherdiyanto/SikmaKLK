import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { Mahasiswa } from '../types/sikma';

// Helper function to draw official UB letterhead on jsPDF
function drawUbKopSurat(doc: jsPDF) {
  // Official Kop Surat Departemen Kimia Universitas Brawijaya
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', 105, 18, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('UNIVERSITAS BRAWIJAYA', 105, 24, { align: 'center' });
  doc.setFontSize(11);
  doc.text('FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA', 105, 30, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('DEPARTEMEN KIMIA', 105, 35, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text('Jalan Veteran, Malang 65145, Jawa Timur, Indonesia', 105, 40, { align: 'center' });
  doc.text('Telp. (0341) 554403, 575777 | Email: kimia@ub.ac.id | Web: https://kimia.ub.ac.id', 105, 44, { align: 'center' });

  // Double header separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(20, 47, 190, 47);
  doc.setLineWidth(0.2);
  doc.line(20, 48.5, 190, 48.5);
}

// Helper to trigger browser download of blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ============================================================================
// 1. KARTU FIDK (Formulir Isian Data Kelulusan) - FORMAT .PDF
// ============================================================================
export function generateKartuFIDKPdf(mhs: Mahasiswa) {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawUbKopSurat(doc);

  // Judul Dokumen
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('KARTU FORMULIR ISIAN DATA KELULUSAN (FIDK)', 105, 57, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Nomor Dokumen: FIDK/UB/FSTM/KIM/${mhs.angkatan}/${mhs.nim}`, 105, 62, { align: 'center' });

  // Bagian Identitas Mahasiswa
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('A. IDENTITAS MAHASISWA CALON LULUSAN', 20, 72);

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const fields = [
    ['Nama Lengkap', `: ${mhs.nama}`],
    ['Nomor Induk Mahasiswa (NIM)', `: ${mhs.nim}`],
    ['Program Studi / Jenjang', ': S1 Kimia / Sarjana (S-1)'],
    ['Tahun Masuk / Angkatan', `: ${mhs.angkatan} (Semester ${mhs.semester})`],
    ['Indeks Prestasi Kumulatif (IPK)', `: ${mhs.ipk.toFixed(2)}`],
    ['Dosen Pembimbing Akademik (PA)', `: ${mhs.dosenPANama || 'Dr. Sasangka Prasetyawan, M.S.'}`],
    ['Laboratorium Penelitian Riset', `: ${mhs.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam'}`],
    ['Judul Skripsi / Tugas Akhir', `: ${mhs.judulSkripsi || 'Isolasi, Karakterisasi, dan Uji Aktivitas Senyawa Bioaktif...'}`]
  ];

  let currentY = 78;
  fields.forEach(([label, val]) => {
    doc.setFont('times', 'normal');
    doc.text(label, 23, currentY);
    const splitVal = doc.splitTextToSize(val, 115);
    doc.text(splitVal, 75, currentY);
    currentY += Math.max(splitVal.length * 5, 6.5);
  });

  // Bagian Checklist Verifikasi Kelulusan
  currentY += 2;
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('B. VERIFIKASI PERSYARATAN YUDISIUM & BEBAS TANGGUNGAN', 20, currentY);

  currentY += 6;
  // Header Tabel Verifikasi
  doc.setFillColor(240, 243, 248);
  doc.rect(20, currentY, 170, 7, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('No', 24, currentY + 4.8);
  doc.text('Komponen Persyaratan Kelulusan', 35, currentY + 4.8);
  doc.text('Status Verifikasi', 130, currentY + 4.8);
  doc.text('Paraf Petugas', 165, currentY + 4.8);

  const checklistItems = [
    ['1', 'Penyelesaian Bebas Tanggungan Laboratorium Kimia (6 Lab)', 'TERPENUHI', '[ VALID ]'],
    ['2', 'Surat Bebas Pustaka Perpustakaan Pusat UB & Ruang Baca', 'TERPENUHI', '[ VALID ]'],
    ['3', 'Naskah Publikasi / Artikel Ilmiah Jurnal Terakreditasi', 'TERVERIFIKASI', '[ VALID ]'],
    ['4', 'Sertifikat Kemampuan Bahasa Inggris (UB-TEP >= 475)', 'MEMENUHI SYARAT', '[ VALID ]'],
    ['5', 'Bebas Tanggungan Keuangan / UKT Semester Akhir', 'LUNAS / BEBAS', '[ VALID ]']
  ];

  currentY += 7;
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  checklistItems.forEach(([no, item, status, paraf]) => {
    doc.rect(20, currentY, 170, 6.5);
    doc.text(no, 24, currentY + 4.3);
    doc.text(item, 35, currentY + 4.3);
    doc.setFont('times', 'bold');
    doc.setTextColor(5, 122, 85); // Emerald color
    doc.text(status, 130, currentY + 4.3);
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'normal');
    doc.text(paraf, 166, currentY + 4.3);
    currentY += 6.5;
  });

  // Catatan & Tanda Tangan
  currentY += 6;
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.text('Catatan: Kartu FIDK ini merupakan dokumen sah untuk pendaftaran Yudisium Sarjana Departemen Kimia UB.', 20, currentY);

  const sigY = currentY + 10;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Mahasiswa Bersangkutan,', 30, sigY);
  doc.text('Malang, 2026', 135, sigY);
  doc.text('Ketua Departemen Kimia UB,', 135, sigY + 5);

  // E-Sign badge
  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(135, sigY + 9, 48, 18, 2, 2, 'D');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text('TERVERIFIKASI SISTEM', 159, sigY + 15, { align: 'center' });
  doc.text('SIKMA DEPARTEMEN KIMIA', 159, sigY + 19, { align: 'center' });
  doc.text('UNIVERSITAS BRAWIJAYA', 159, sigY + 23, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text(mhs.nama, 30, sigY + 31);
  doc.setFont('times', 'normal');
  doc.text(`NIM. ${mhs.nim}`, 30, sigY + 35);

  doc.setFont('times', 'bold');
  doc.text('Masruri, S.Si., M.Si., Ph.D', 135, sigY + 31);
  doc.setFont('times', 'normal');
  doc.text('NIP. 197404122000031001', 135, sigY + 35);

  doc.save(`Kartu_FIDK_${mhs.nim}_${mhs.nama.replace(/\s+/g, '_')}.pdf`);
}

// ============================================================================
// 2. KARTU PESERTA SEMINAR - FORMAT .PDF
// ============================================================================
export function generateKartuPesertaSeminarPdf(mhs: Mahasiswa) {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawUbKopSurat(doc);

  // Judul
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('KARTU KEHADIRAN PESERTA SEMINAR MAHASISWA', 105, 57, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Seminar Proposal & Seminar Hasil Penelitian Skripsi Program Studi S1 Kimia', 105, 62, { align: 'center' });

  // Data Mahasiswa
  doc.setFontSize(9.5);
  const dataY = 70;
  doc.text('Nama Mahasiswa', 20, dataY);
  doc.text(`: ${mhs.nama}`, 60, dataY);
  doc.text('NIM / Program Studi', 20, dataY + 5.5);
  doc.text(`: ${mhs.nim} / S1 Kimia`, 60, dataY + 5.5);
  doc.text('Dosen Pembimbing Akademik', 20, dataY + 11);
  doc.text(`: ${mhs.dosenPANama || 'Dr. Sasangka Prasetyawan, M.S.'}`, 60, dataY + 11);

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('* Syarat pendaftaran ujian tugas akhir: menghadiri minimal 10 (sepuluh) kali seminar mahasiswa.', 20, dataY + 17);

  // Tabel Kehadiran Seminar
  let tableY = dataY + 22;
  doc.setFillColor(240, 243, 248);
  doc.rect(20, tableY, 170, 7, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('No', 22, tableY + 4.8);
  doc.text('Hari / Tanggal', 30, tableY + 4.8);
  doc.text('Nama Pemrasaran / NIM', 60, tableY + 4.8);
  doc.text('Judul Seminar Penelitian', 105, tableY + 4.8);
  doc.text('TTD Dosen/Mod', 162, tableY + 4.8);

  tableY += 7;
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);

  const seminarLogs = [
    ['1', 'Senin, 02 Feb 2026', 'Ahmad Dani (235090200111001)', 'Sintesis Nanopartikel Seng Oksida Green Route', 'Terparaf [OK]'],
    ['2', 'Rabu, 11 Feb 2026', 'Siti Rahma (235090200111005)', 'Analisis Logam Berat Cd & Pb pada Kerang Hijau', 'Terparaf [OK]'],
    ['3', 'Jumat, 27 Feb 2026', 'Budi Wijaya (225090200111012)', 'Optimasi Ekstraksi Flavonoid Daun Kelor', 'Terparaf [OK]'],
    ['4', 'Kamis, 05 Mar 2026', 'Dewi Lestari (225090200111018)', 'Kinetika Degradasi Zat Warna Metilen Biru', 'Terparaf [OK]'],
    ['5', 'Selasa, 17 Mar 2026', 'Fajar Ramadhan (225090200111025)', 'Enkapsulasi Minyak Atsiri Sereh Wangi', 'Terparaf [OK]'],
    ['6', 'Rabu, 01 Apr 2026', 'Nur Hidayah (235090200111030)', 'Sintesis Senyawa Kompleks Tembaga(II)-Basa Schiff', 'Terparaf [OK]'],
    ['7', 'Senin, 13 Apr 2026', 'Rizky Pratama (225090200111041)', 'Uji Sitotoksisitas Ekstrak Jamur Endofit', 'Terparaf [OK]'],
    ['8', 'Kamis, 23 Apr 2026', 'Maya Anggraini (235090200111048)', 'Biodegradasi Plastik Polietilena Menggunakan Bakteri', 'Terparaf [OK]'],
    ['9', 'Selasa, 05 Mei 2026', 'Yoga Saputra (225090200111055)', 'Adsorpsi Ion Tembaga Menggunakan Karbon Aktif', 'Terparaf [OK]'],
    ['10', 'Jumat, 15 Mei 2026', 'Putri Ayu (235090200111062)', 'Pengaruh Variasi pH pada Aktivitas Enzim Amilase', 'Terparaf [OK]']
  ];

  seminarLogs.forEach(([no, tgl, pemrasaran, judul, ttd]) => {
    doc.rect(20, tableY, 170, 9);
    doc.text(no, 23, tableY + 5.5);
    doc.text(tgl, 30, tableY + 5.5);
    const splitNama = doc.splitTextToSize(pemrasaran, 43);
    doc.text(splitNama, 60, tableY + 4);
    const splitJudul = doc.splitTextToSize(judul, 54);
    doc.text(splitJudul, 105, tableY + 4);
    doc.setFont('times', 'bold');
    doc.text(ttd, 163, tableY + 5.5);
    doc.setFont('times', 'normal');
    tableY += 9;
  });

  // Footer Pengesahan
  const sigY = tableY + 7;
  doc.setFontSize(9);
  doc.text('Mengetahui / Memverifikasi,', 130, sigY);
  doc.text('Koordinator Seminar & Tugas Akhir Kimia,', 130, sigY + 5);

  doc.setFont('times', 'bold');
  doc.text('Dr. Arie Srihardyastutie, S.Si., M.Kes.', 130, sigY + 28);
  doc.setFont('times', 'normal');
  doc.text('NIP. 197607152002122001', 130, sigY + 32);

  doc.save(`Kartu_Peserta_Seminar_${mhs.nim}_${mhs.nama.replace(/\s+/g, '_')}.pdf`);
}

// ============================================================================
// 3. BLANGKO BEBAS LAB (Surat Keterangan Bebas Lab) - FORMAT .PDF
// ============================================================================
export function generateBlangkoBebasLabPdf(mhs: Mahasiswa) {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawUbKopSurat(doc);

  // Judul
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('SURAT KETERANGAN BEBAS LABORATORIUM', 105, 57, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Nomor: 412/UN10.F09/AK.LAB/2026', 105, 62, { align: 'center' });

  // Body intro
  doc.setFontSize(10);
  const textIntro = 'Pengelola Laboratorium Departemen Kimia Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya menerangkan bahwa mahasiswa:';
  doc.text(doc.splitTextToSize(textIntro, 170), 20, 72);

  const startY = 82;
  doc.text('Nama Lengkap', 25, startY);
  doc.text(`: ${mhs.nama}`, 70, startY);
  doc.text('NIM', 25, startY + 6);
  doc.text(`: ${mhs.nim}`, 70, startY + 6);
  doc.text('Program Studi / Jurusan', 25, startY + 12);
  doc.text(': S1 Kimia / Departemen Kimia', 70, startY + 12);
  doc.text('Laboratorium Tempat Riset', 25, startY + 18);
  doc.text(`: ${mhs.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam'}`, 70, startY + 18);

  const descText = 'Telah menyelesaikan seluruh peminjaman alat laboratorium, glassware, bahan kimia, serta tidak memiliki tanggungan ganti rugi pada laboratorium-laboratorium di lingkungan Departemen Kimia FSTeM UB:';
  doc.text(doc.splitTextToSize(descText, 170), 20, startY + 28);

  // Tabel 6 Laboratorium
  let labY = startY + 38;
  doc.setFillColor(240, 243, 248);
  doc.rect(20, labY, 170, 7, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('No', 24, labY + 4.8);
  doc.text('Unit Laboratorium Departemen Kimia', 35, labY + 4.8);
  doc.text('Status Tanggungan', 125, labY + 4.8);
  doc.text('Paraf Laboran', 165, labY + 4.8);

  const labList = [
    ['1', 'Laboratorium Kimia Dasar', 'BEBAS TANGGUNGAN', '[ OK ]'],
    ['2', 'Laboratorium Kimia Analitik & Instrumen', 'BEBAS TANGGUNGAN', '[ OK ]'],
    ['3', 'Laboratorium Kimia Organik & Bahan Alam', 'BEBAS TANGGUNGAN', '[ OK ]'],
    ['4', 'Laboratorium Kimia Anorganik', 'BEBAS TANGGUNGAN', '[ OK ]'],
    ['5', 'Laboratorium Kimia Fisik', 'BEBAS TANGGUNGAN', '[ OK ]'],
    ['6', 'Laboratorium Biokimia', 'BEBAS TANGGUNGAN', '[ OK ]']
  ];

  labY += 7;
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  labList.forEach(([no, lab, status, paraf]) => {
    doc.rect(20, labY, 170, 7);
    doc.text(no, 24, labY + 4.5);
    doc.text(lab, 35, labY + 4.5);
    doc.setFont('times', 'bold');
    doc.setTextColor(5, 122, 85);
    doc.text(status, 125, labY + 4.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'normal');
    doc.text(paraf, 166, labY + 4.5);
    labY += 7;
  });

  const closingText = 'Surat keterangan ini diterbitkan sebagai salah satu syarat wajib pengajuan Bebas Jurusan, Ujian Tugas Akhir, dan Yudisium Sarjana S1 Kimia.';
  doc.text(doc.splitTextToSize(closingText, 170), 20, labY + 8);

  // Signature
  const sigY = labY + 22;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Malang, Jawa Timur', 130, sigY);
  doc.text('Kepala Laboratorium Sentral Kimia,', 130, sigY + 5);

  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(130, sigY + 9, 48, 18, 2, 2, 'D');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text('BEBAS LABORATORIUM', 154, sigY + 15, { align: 'center' });
  doc.text('LAB SENTRAL KIMIA UB', 154, sigY + 19, { align: 'center' });
  doc.text('TERVERIFIKASI SISTEM', 154, sigY + 23, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Anna Safitri, S.Si., M.Sc., Ph.D.', 130, sigY + 31);
  doc.setFont('times', 'normal');
  doc.text('NIP. 197808242005012002', 130, sigY + 35);

  doc.save(`Blangko_Bebas_Lab_${mhs.nim}_${mhs.nama.replace(/\s+/g, '_')}.pdf`);
}

// ============================================================================
// 4. SURAT ASISTEN PRAKTIKUM - FORMAT .PDF
// ============================================================================
export function generateSuratAsistenPraktikumPdf(mhs: Mahasiswa) {
  const doc = new jsPDF('p', 'mm', 'a4');
  drawUbKopSurat(doc);

  // Judul
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('SURAT KETERANGAN PENUGASAN ASISTEN PRAKTIKUM', 105, 57, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Nomor: 882/UN10.F09/AK.ASISTEN/2026', 105, 62, { align: 'center' });

  // Body
  doc.setFontSize(10);
  const textIntro = 'Ketua Departemen Kimia Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya menerangkan dengan sesungguhnya bahwa mahasiswa di bawah ini:';
  doc.text(doc.splitTextToSize(textIntro, 170), 20, 72);

  const startY = 82;
  doc.text('Nama Mahasiswa', 25, startY);
  doc.text(`: ${mhs.nama}`, 70, startY);
  doc.text('NIM', 25, startY + 6);
  doc.text(`: ${mhs.nim}`, 70, startY + 6);
  doc.text('Program Studi / Semester', 25, startY + 12);
  doc.text(`: S1 Kimia / Semester ${mhs.semester}`, 70, startY + 12);
  doc.text('Indeks Prestasi Kumulatif', 25, startY + 18);
  doc.text(`: ${mhs.ipk.toFixed(2)} (Sangat Memuaskan)`, 70, startY + 18);

  const assignText = 'Telah lolos seleksi dan secara resmi ditugaskan sebagai ASISTEN PRAKTIKUM LABORATORIUM Departemen Kimia Universitas Brawijaya untuk Tahun Akademik 2026/2027 dengan rincian penugasan:';
  doc.text(doc.splitTextToSize(assignText, 170), 20, startY + 28);

  const assignY = startY + 40;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, assignY, 170, 32, 2, 2, 'FD');
  doc.setFont('times', 'bold');
  doc.text('Mata Kuliah Praktikum', 25, assignY + 7);
  doc.setFont('times', 'normal');
  doc.text(': Praktikum Kimia Organik & Kimia Pemisahan (KIM-4102)', 75, assignY + 7);

  doc.setFont('times', 'bold');
  doc.text('Laboratorium', 25, assignY + 13);
  doc.setFont('times', 'normal');
  doc.text(`: ${mhs.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam'}`, 75, assignY + 13);

  doc.setFont('times', 'bold');
  doc.text('Dosen Pengampu Praktikum', 25, assignY + 19);
  doc.setFont('times', 'normal');
  doc.text(`: ${mhs.dosenPANama || 'Masruri, S.Si., M.Si., Ph.D'}`, 75, assignY + 19);

  doc.setFont('times', 'bold');
  doc.text('Tugas Pokok & Tanggung Jawab', 25, assignY + 25);
  doc.setFont('times', 'normal');
  doc.text(': Membimbing pretest, mendampingi eksperimen, mengawasi K3 Lab, dan koreksi laporan.', 75, assignY + 25);

  const closingText = 'Demikian Surat Keterangan Asisten Praktikum ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagai bukti rekam jejak akademik, portofolio SKPI, dan keperluan administrasi lainnya.';
  doc.text(doc.splitTextToSize(closingText, 170), 20, assignY + 40);

  // Tanda Tangan
  const sigY = assignY + 56;
  doc.text('Malang, 2026', 130, sigY);
  doc.text('Ketua Departemen Kimia,', 130, sigY + 5);

  doc.setDrawColor(30, 64, 175);
  doc.roundedRect(130, sigY + 9, 48, 18, 2, 2, 'D');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text('TERVALIDASI ASISTEN', 154, sigY + 15, { align: 'center' });
  doc.text('DEPARTEMEN KIMIA UB', 154, sigY + 19, { align: 'center' });
  doc.text('STATUS: RESMI & AKTIF', 154, sigY + 23, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Masruri, S.Si., M.Si., Ph.D', 130, sigY + 31);
  doc.setFont('times', 'normal');
  doc.text('NIP. 197404122000031001', 130, sigY + 35);

  doc.save(`Surat_Asisten_Praktikum_${mhs.nim}_${mhs.nama.replace(/\s+/g, '_')}.pdf`);
}

// ============================================================================
// 5. SKPI (Surat Keterangan Pendamping Ijazah) - FORMAT .DOCX
// ============================================================================
export async function generateSkpiDocx(mhs: Mahasiswa) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SIKMA UB • Surat Keterangan Pendamping Ijazah (SKPI)',
                    italics: true,
                    size: 16,
                    color: '666666'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Halaman ',
                    size: 16
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16
                  }),
                  new TextRun({
                    text: ' dari Departemen Kimia Universitas Brawijaya',
                    size: 16
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Header Judul Utama
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
                size: 20,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'UNIVERSITAS BRAWIJAYA - FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA',
                size: 22,
                bold: true,
                color: '002B49'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'DEPARTEMEN KIMIA - PROGRAM STUDI SARJANA KIMIA',
                size: 20,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Jalan Veteran, Malang 65145, Jawa Timur | Email: kimia@ub.ac.id | Web: https://kimia.ub.ac.id',
                size: 16,
                italics: true,
                color: '555555'
              })
            ]
          }),
          new Paragraph({
            text: '_________________________________________________________________________________',
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: '' }),

          // Judul SKPI
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'SURAT KETERANGAN PENDAMPING IJAZAH (SKPI)',
                bold: true,
                size: 26,
                color: '002B49'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'DIPLOMA SUPPLEMENT',
                italics: true,
                bold: true,
                size: 20,
                color: '333333'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Nomor SKPI: SKPI/UB/FSTM/KIM/${mhs.angkatan}/${mhs.nim}`,
                bold: true,
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // Penjelasan SKPI
          new Paragraph({
            children: [
              new TextRun({
                text: 'Surat Keterangan Pendamping Ijazah (SKPI) ini mengacu pada Kerangka Kualifikasi Nasional Indonesia (KKNI) Level 6 dan Standar Nasional Pendidikan Tinggi, yang menerangkan capaian pembelajaran, keahlian khusus, dan prestasi mahasiswa selama menempuh studi di Program Studi S1 Kimia Universitas Brawijaya.',
                size: 20
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // 1. INFORMASI IDENTITAS PEMEGANG SKPI
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '1. INFORMASI TENTANG IDENTITAS DIRI PEMEGANG SKPI',
                bold: true,
                size: 22,
                color: '002B49'
              })
            ]
          }),

          // Tabel Identitas
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Nama Lengkap / Full Name', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: mhs.nama, bold: true, size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Nomor Induk Mahasiswa (NIM)', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: mhs.nim, size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tahun Masuk / Graduation Year', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `${mhs.angkatan} / 2026`, size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Gelar Akademik / Title Conferred', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Sarjana Sains (S.Si.) / Bachelor of Science (B.Sc.)', size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Indeks Prestasi Kumulatif (IPK)', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `${mhs.ipk.toFixed(2)} (Sangat Memuaskan)`, bold: true, size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Judul Tugas Akhir / Undergraduate Thesis', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: mhs.judulSkripsi || 'Isolasi dan Karakterisasi Senyawa Bioaktif...', italics: true, size: 18 })] })]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // 2. INFORMASI TENTANG PENYELENGGARA PROGRAM
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '2. INFORMASI TENTANG PENYELENGGARA PROGRAM',
                bold: true,
                size: 22,
                color: '002B49'
              })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Perguruan Tinggi', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Universitas Brawijaya', size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Program Studi / Jenjang', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'S1 Kimia / Sarjana (Level 6 KKNI)', size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Status Akreditasi Program Studi', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Unggul (BAN-PT) & Terakreditasi Internasional ASIIN', bold: true, size: 18 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Bahasa Pengantar Kuliah', bold: true, size: 18 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Bahasa Indonesia dan Bahasa Inggris', size: 18 })] })]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // 3. CAPAIAN PEMBELAJARAN (LEARNING OUTCOMES)
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '3. CAPAIAN PEMBELAJARAN LULUSAN & KUALIFIKASI KEMAMPUAN',
                bold: true,
                size: 22,
                color: '002B49'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A. Kemampuan Bidang Kerja (Hard Skills & Laboratorium):',
                bold: true,
                size: 19
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Mampu mengoperasikan instrumen analisis kimia mutakhir: Spektrofotometer UV-Vis, FTIR, Spektrometri Serapan Atom (AAS), High Performance Liquid Chromatography (HPLC), dan Gas Chromatography - Mass Spectrometry (GC-MS).',
                size: 18
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Mampu merancang dan melakukan sintesis senyawa organik dan anorganik, isolasi bahan alam, serta karakterisasi struktur molekul.',
                size: 18
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Menerapkan kaidah Keselamatan dan Kesehatan Kerja (K3) Laboratorium Kimia dan Sistem Manajemen Mutu Laboratorium (ISO/IEC 17025).',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'B. Penguasaan Pengetahuan (Knowledge Competence):',
                bold: true,
                size: 19
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Menguasai konsep teoretis mendalam mengenai struktur molekul, dinamika kimia, termodinamika, kinetika reaksi, dan reaksi kimia bioaktif.',
                size: 18
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Mampu memecahkan masalah sains dan teknologi melalui metodologi penelitian kimia yang teruji dan berbasis bukti empiris.',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // 4. PRESTASI & PENGALAMAN ORGANISASI
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '4. REKAM JEJAK PRESTASI, SERTIFIKASI, DAN AKTIVITAS KEMAHASISWAAN',
                bold: true,
                size: 22,
                color: '002B49'
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Sertifikasi Kompetensi: Analis Kimia Madya Terverifikasi BNSP (Badan Nasional Sertifikasi Profesi).',
                size: 18
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `Pengalaman Laboratorium: Asisten Praktikum Kimia Resmi di ${mhs.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam'} UB.`,
                size: 18
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Aktivitas Organisasi: Pengurus Aktif Himpunan Mahasiswa Kimia (HIMAKI) FSTeM Universitas Brawijaya.',
                size: 18
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Kemampuan Bahasa Inggris: UB Test of English Proficiency (UB-TEP) dengan skor 520 (Kategori B2 / Independent User).',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // 5. PENGESAHAN DOKUMEN
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '5. PENGESAHAN DOKUMEN SKPI',
                bold: true,
                size: 22,
                color: '002B49'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Diterbitkan di Malang, Jawa Timur, Indonesia pada Tahun 2026.',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE }
                    },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Dekan Fakultas Sains, Teknologi, dan Matematika,', size: 18 })] }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ children: [new TextRun({ text: 'Prof. Drs. Adi Susilo, M.Si., Ph.D.', bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'NIP. 196404171989031002', size: 18 })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE }
                    },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Ketua Departemen Kimia Universitas Brawijaya,', size: 18 })] }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ children: [new TextRun({ text: 'Masruri, S.Si., M.Si., Ph.D.', bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'NIP. 197404122000031001', size: 18 })] })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `SKPI_${mhs.nim}_${mhs.nama.replace(/\s+/g, '_')}.docx`);
}
