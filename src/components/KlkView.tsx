import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  AlignmentType
} from 'docx';
import {
  PengajuanKLK,
  SkemaKLK,
  LogbookMingguanKLK,
  MitraIndustriKLK,
  DokumenPanduanKLK,
  Mahasiswa,
  UserRole,
  Dosen,
  SemesterItem,
  StatusKLK,
  RuanganItem,
  AuthUser
} from '../types/sikma';
import { INITIAL_SEMESTER_LIST } from '../data/semesterList';
import { INITIAL_RUANGAN_LIST } from '../data/ruanganList';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  PlusCircle,
  Printer,
  Search,
  Send,
  ShieldCheck,
  User,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Layers,
  MapPin,
  Check,
  X,
  Sparkles,
  DoorOpen,
  Eye,
  Edit3,
  Upload,
  FolderOpen,
  File,
  Link2,
  UserCheck,
  Copy,
  GitMerge,
  ListOrdered,
  Save,
  Megaphone,
  Bell,
  Pencil,
  Trash2,
  XCircle,
  QrCode,
  Scan,
  Lock,
  Unlock,
  Timer
} from 'lucide-react';
import {
  QrSosialisasiKLK,
  INITIAL_QR_LIST,
  QrManagerModal,
  QrProjectorModal,
  QrScanGate,
  VerifiedStudentRecord
} from './KlkQrSosialisasi';

export const SKS_MK_DATA: {
  [key: number]: {
    label: string;
    kategori: string;
    mkList: { kode: string; nama: string; sks: number }[];
  };
} = {
  3: {
    label: '3 SKS',
    kategori: 'Skema Reguler / Praktik Kerja Lapang',
    mkList: [
      { kode: 'KMK-4101', nama: 'Kuliah Lapangan Kimia (KLK)', sks: 3 }
    ]
  },
  7: {
    label: '7 SKS',
    kategori: 'Skema Magang Industri & Lab Terapan',
    mkList: [
      { kode: 'KMK-4101', nama: 'Kuliah Lapangan Kimia (KLK)', sks: 3 },
      { kode: 'KMK-4211', nama: 'Analisis Instrumental Terapan', sks: 2 },
      { kode: 'KMK-4212', nama: 'Manajemen Laboratorium & Mutu Kimia', sks: 2 }
    ]
  },
  10: {
    label: '10 SKS',
    kategori: 'Skema Riset Terapan & Penjaminan Mutu',
    mkList: [
      { kode: 'KMK-4101', nama: 'Kuliah Lapangan Kimia (KLK)', sks: 3 },
      { kode: 'KMK-4301', nama: 'Kimia Industri & Produk Bahan Alam', sks: 3 },
      { kode: 'KMK-4302', nama: 'Metodologi Penelitian Terapan Kimia', sks: 2 },
      { kode: 'KMK-4303', nama: 'Penjaminan Mutu & Standar ISO Kimia', sks: 2 }
    ]
  },
  13: {
    label: '13 SKS',
    kategori: 'Skema Riset Kimia & K3 Lab',
    mkList: [
      { kode: 'KMK-4101', nama: 'Kuliah Lapangan Kimia (KLK)', sks: 3 },
      { kode: 'KMK-4401', nama: 'Pengujian Bahan & Polutan Kimia Lanjut', sks: 4 },
      { kode: 'KMK-4402', nama: 'K3 & Manajemen Limbah B3 Kimia', sks: 3 },
      { kode: 'KMK-4403', nama: 'Kapita Selekta Kimia Industri Terapan', sks: 3 }
    ]
  },
  16: {
    label: '16 SKS',
    kategori: 'Skema Penuh Magang & Riset Industri',
    mkList: [
      { kode: 'KMK-4101', nama: 'Kuliah Lapangan Kimia (KLK)', sks: 3 },
      { kode: 'KMK-4501', nama: 'Proyek Riset Terapan di Lembaga Mitra', sks: 5 },
      { kode: 'KMK-4502', nama: 'Analisis Spektroskopi & Kromatografi Lanjut', sks: 4 },
      { kode: 'KMK-4503', nama: 'K3 & Analisis Risiko Laboratorium Kimia', sks: 2 },
      { kode: 'KMK-4504', nama: 'Etika Profesi Kimia & Komunikasi Ilmiah', sks: 2 }
    ]
  }
};

export const OPSI_JENIS_REKAP = [
  'KLK',
  'Sumber Daya Alam',
  'Keselamatan dan Lingkungan',
  'Metode dan Terapan',
  'Analisis Penilaian Tindakan',
  'Kemandirian Pengayaan Pengetahuan',
  'Semua (KLK dan MK Konversi)'
] as const;

export interface PertanyaanPenilaianLaporan {
  id: number;
  pertanyaan: string;
}

export const DAFTAR_PERTANYAAN_LAPORAN: PertanyaanPenilaianLaporan[] = [
  { id: 1, pertanyaan: 'Ketepatan dan kejujuran' },
  { id: 2, pertanyaan: 'Pelaporan Akurat' },
  { id: 3, pertanyaan: 'Kerjasama dan Kontribusi' },
  {
    id: 4,
    pertanyaan:
      'Memahami protokol keselamatan laboratorium yang melibatkan penggunaan alat pelindung diri (APD), penanganan bahan kimia berbahaya, serta tindakan darurat dalam kasus insiden'
  },
  {
    id: 5,
    pertanyaan:
      'Memahami bagaimana mengelola, menyimpan, dan membuang bahan kimia berbahaya dengan aman dan sesuai dengan peraturan'
  },
  {
    id: 6,
    pertanyaan:
      'Mahir dalam penggunaan peralatan dan instrumen laboratorium yang umum digunakan dalam penelitian kimia'
  },
  {
    id: 7,
    pertanyaan:
      'Membuat keputusan berdasarkan pertimbangan etika, mematuhi peraturan dan regulasi yang berlaku, serta menjaga integritas dan kerahasiaan data'
  },
  {
    id: 8,
    pertanyaan:
      'Dapat menyampaikan informasi tentang prinsip-prinsip etika dan standar-standar kimia kepada rekan kerja, masyarakat, dan pemangku kepentingan lainnya dengan bahasa yang mudah dipahami'
  },
  {
    id: 9,
    pertanyaan:
      'Mematuhi dan melaksanakan peraturan dan tata tertib di lingkungan kerja industri atau akademik'
  },
  {
    id: 10,
    pertanyaan:
      'Menerapkan pengetahuan dan keterampilan yang mahasiswa peroleh dari perkuliahan dalam konteks kerja nyata'
  },
  {
    id: 11,
    pertanyaan:
      'Berkomunikasi dengan rekan kerja, klien, atau sesama akademisi dengan jelas dan efektif'
  },
  {
    id: 12,
    pertanyaan:
      'Beradaptasi dengan perubahan dan tantangan dalam lingkungan kerja industri atau akademik'
  },
  {
    id: 13,
    pertanyaan:
      'Bersikap profesional, memiliki integritas, menghormati etika kerja, dan bekerjasama dalam lingkungan kerja'
  }
];

export const OPSI_BOBOT_JAWABAN = [
  { label: 'Tidak Tampak', bobot: 1, skor: 20 },
  { label: 'Kurang', bobot: 2, skor: 40 },
  { label: 'Cukup', bobot: 3, skor: 60 },
  { label: 'Baik', bobot: 4, skor: 80 },
  { label: 'Sangat Baik', bobot: 5, skor: 100 }
];

export interface PertanyaanKemandirianMK1 {
  id: number;
  pertanyaan: string;
}

export const DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1: PertanyaanKemandirianMK1[] = [
  {
    id: 1,
    pertanyaan:
      'Mampu menyusun dan melaksanakan rencana penelitian atau proyek mandiri dengan menggunakan metode ilmiah yang tepat'
  },
  {
    id: 2,
    pertanyaan:
      'Mampu mengidentifikasi dan memanfaatkan berbagai sumber informasi untuk mendukung penelitian atau kajian ilmiah secara mandiri'
  },
  {
    id: 3,
    pertanyaan:
      'Mampu melakukan analisis kritis terhadap berbagai sumber literatur dan data yang relevan'
  }
];

export const calculateTotalSkorLaporan = (answers: Record<number, number>) => {
  let sum = 0;
  for (let i = 1; i <= 13; i++) {
    const val = answers[i] ?? 4;
    sum += val * 20;
  }
  return Math.round((sum / 13) * 10) / 10;
};

export const calculateTotalSkorKemandirian = (answers: Record<number, number>) => {
  let sum = 0;
  for (let i = 1; i <= 3; i++) {
    const val = answers[i] ?? 4;
    sum += val * 20;
  }
  return Math.round((sum / 3) * 10) / 10;
};

export const getGradeHuruf = (skor: number) => {
  if (skor >= 80) return 'A';
  if (skor >= 75) return 'B+';
  if (skor >= 70) return 'B';
  if (skor >= 60) return 'C+';
  if (skor >= 55) return 'C';
  return 'D';
};

export const DAFTAR_MATA_KULIAH_KONVERSI_KLK = [
  'UBU60002 - Praktek Kerja Lapang - 4 SKS - CPL 8',
  'UBU60012 - Magang Industri I - 6 SKS - CPL 8',
  'UBU60013 - Magang Industri II - 6 SKS - CPL 8',
  'UBU60014 - Magang Penelitian I - 6 SKS - CPL 4',
  'UBU60015 - Magang Penelitian II - 6 SKS - CPL 4',
  'UBU60022 - Proyek Independen I - 6 SKS - CPL 4',
  'UBU60023 - Proyek Independen II - 6 SKS - CPL 4',
  'UBU60024 - Proyek Penelitian I - 6 SKS - CPL 4',
  'UBU60025 - Proyek Penelitian II - 6 SKS - CPL 4',
  'UBU60008 - Diseminasi Merdeka Belajar - 1 SKS - CPL 5',
  'UBU60009 - Keterampilan Manajerial dan Komunikasi - 3 SKS - CPL 5 dan 6',
  'UBU60010 - Kreativitas dan Inovasi - 2 SKS - CPL 7',
  'UBU60011 - Kepemimpinan dan Kerjasama Tim - 2 SKS - CPL 6',
  'MBK60010 - Sumber Daya Alam I - 3 SKS - CPL 7',
  'MBK60011 - Sumber Daya Alam II - 3 SKS - CPL 7',
  'MBK60014 - Keselamatan dan Lingkungan I - 3 SKS - CPL 8',
  'MBK60015 - Keselamatan dan Lingkungan II - 2 SKS - CPL 8',
  'MBK60016 - Metodologi dan Terapan I - 3 SKS - CPL 4',
  'MBK60017 - Metodologi dan Terapan II - 3 SKS - CPL 4',
  'MBK60019 - Analisis, Penilaian, dan Tindakan I - 3 SKS - CPL 4',
  'MBK60020 - Analisis, Penilaian, dan Tindakan II - 2 SKS - CPL 4',
  'MBK60021 - Kemandirian Pengayaan Pengetahuan I - 3 SKS - CPL 4',
  'MBK60022 - Kemandirian'
];

export const extractSksFromMkKonversi = (mkString: string): number => {
  const match = mkString.match(/(\d+)\s*SKS/i);
  if (match) return parseInt(match[1], 10);
  if (mkString.includes('MBK60022')) return 2;
  return 4;
};

export const TARGET_KOMBINASI_SKS_KLK = [4, 7, 10, 13, 16] as const;

export interface InfoMataKuliahKonversi {
  kode: string;
  nama: string;
  sks: number;
  cpl: string;
  fullString: string;
}

export const parseMkKonversiString = (str: string): InfoMataKuliahKonversi => {
  const parts = str.split(' - ');
  const kode = parts[0]?.trim() || '';
  const nama = parts[1]?.trim() || '';
  const sksMatch = str.match(/(\d+)\s*SKS/i);
  let sks = 4;
  if (sksMatch) {
    sks = parseInt(sksMatch[1], 10);
  } else if (kode === 'MBK60022') {
    sks = 2;
  }
  const cplPart = parts.find((p) => p.trim().startsWith('CPL')) || (kode === 'MBK60022' ? 'CPL 4' : 'CPL 8');
  return {
    kode,
    nama,
    sks,
    cpl: cplPart.trim(),
    fullString: str
  };
};

export const REKOMENDASI_PAKET_SKS_KLK: Record<number, { label: string; mkList: string[] }> = {
  4: {
    label: 'Paket 4 SKS (Praktek Kerja Lapang)',
    mkList: ['UBU60002 - Praktek Kerja Lapang - 4 SKS - CPL 8']
  },
  7: {
    label: 'Paket 7 SKS (PKL 4 SKS + Sumber Daya Alam 3 SKS)',
    mkList: [
      'UBU60002 - Praktek Kerja Lapang - 4 SKS - CPL 8',
      'MBK60010 - Sumber Daya Alam I - 3 SKS - CPL 7'
    ]
  },
  10: {
    label: 'Paket 10 SKS (PKL 4 SKS + 2 MK Terapan 6 SKS)',
    mkList: [
      'UBU60002 - Praktek Kerja Lapang - 4 SKS - CPL 8',
      'MBK60010 - Sumber Daya Alam I - 3 SKS - CPL 7',
      'MBK60014 - Keselamatan dan Lingkungan I - 3 SKS - CPL 8'
    ]
  },
  13: {
    label: 'Paket 13 SKS (Magang Industri 6 SKS + PKL 4 SKS + MK Terapan 3 SKS)',
    mkList: [
      'UBU60012 - Magang Industri I - 6 SKS - CPL 8',
      'UBU60002 - Praktek Kerja Lapang - 4 SKS - CPL 8',
      'MBK60010 - Sumber Daya Alam I - 3 SKS - CPL 7'
    ]
  },
  16: {
    label: 'Paket 16 SKS (Magang Industri I 6 SKS + Magang Penelitian I 6 SKS + PKL 4 SKS)',
    mkList: [
      'UBU60012 - Magang Industri I - 6 SKS - CPL 8',
      'UBU60014 - Magang Penelitian I - 6 SKS - CPL 4',
      'UBU60002 - Praktek Kerja Lapang - 4 SKS - CPL 8'
    ]
  }
};

export const PASANGAN_MK_BERSERI: [string, string][] = [
  [
    'UBU60012 - Magang Industri I - 6 SKS - CPL 8',
    'UBU60013 - Magang Industri II - 6 SKS - CPL 8'
  ],
  [
    'UBU60014 - Magang Penelitian I - 6 SKS - CPL 4',
    'UBU60015 - Magang Penelitian II - 6 SKS - CPL 4'
  ],
  [
    'UBU60022 - Proyek Independen I - 6 SKS - CPL 4',
    'UBU60023 - Proyek Independen II - 6 SKS - CPL 4'
  ],
  [
    'UBU60024 - Proyek Penelitian I - 6 SKS - CPL 4',
    'UBU60025 - Proyek Penelitian II - 6 SKS - CPL 4'
  ],
  [
    'MBK60010 - Sumber Daya Alam I - 3 SKS - CPL 7',
    'MBK60011 - Sumber Daya Alam II - 3 SKS - CPL 7'
  ],
  [
    'MBK60014 - Keselamatan dan Lingkungan I - 3 SKS - CPL 8',
    'MBK60015 - Keselamatan dan Lingkungan II - 2 SKS - CPL 8'
  ],
  [
    'MBK60016 - Metodologi dan Terapan I - 3 SKS - CPL 4',
    'MBK60017 - Metodologi dan Terapan II - 3 SKS - CPL 4'
  ],
  [
    'MBK60019 - Analisis, Penilaian, dan Tindakan I - 3 SKS - CPL 4',
    'MBK60020 - Analisis, Penilaian, dan Tindakan II - 2 SKS - CPL 4'
  ],
  [
    'MBK60021 - Kemandirian Pengayaan Pengetahuan I - 3 SKS - CPL 4',
    'MBK60022 - Kemandirian'
  ]
];

export const getSerialConflictWith = (targetMk: string, selectedList: string[]): string | null => {
  for (const [mkA, mkB] of PASANGAN_MK_BERSERI) {
    if (targetMk === mkA && selectedList.includes(mkB)) {
      return mkB;
    }
    if (targetMk === mkB && selectedList.includes(mkA)) {
      return mkA;
    }
  }
  return null;
};

export const checkAllSerialConflicts = (
  selectedList: string[]
): { mk1: string; mk2: string; pairName: string }[] => {
  const conflicts: { mk1: string; mk2: string; pairName: string }[] = [];
  for (const [mkA, mkB] of PASANGAN_MK_BERSERI) {
    if (selectedList.includes(mkA) && selectedList.includes(mkB)) {
      const nameA = parseMkKonversiString(mkA).nama;
      const nameB = parseMkKonversiString(mkB).nama;
      conflicts.push({
        mk1: mkA,
        mk2: mkB,
        pairName: `${nameA} & ${nameB}`
      });
    }
  }
  return conflicts;
};

export interface ItemAlurKLK {
  no: number;
  deskripsi: string;
  pelaksana: 'Mahasiswa' | 'Admin' | 'Dosen';
  tahap: 'Sosialisasi & Pendaftaran' | 'Verifikasi Berkas & Surat Pengantar' | 'Pelaksanaan & Bimbingan' | 'Ujian & Administrasi Akhir';
  keterangan?: string;
}

export const DAFTAR_ALUR_KLK: ItemAlurKLK[] = [
  {
    no: 1,
    deskripsi: 'Mahasiswa mengikuti Pelatihan/Pembimbingan/Sosialisasi Kuliah Luar Kampus',
    pelaksana: 'Mahasiswa',
    tahap: 'Sosialisasi & Pendaftaran',
    keterangan: 'Sosialisasi pengenalan kebijakan dan persiapan program KLK oleh Departemen Kimia FSTeM UB',
  },
  {
    no: 2,
    deskripsi: 'Mahasiswa menscan QR setelah mengikuti Sosialisasi Kuliah Luar Kampus',
    pelaksana: 'Mahasiswa',
    tahap: 'Sosialisasi & Pendaftaran',
    keterangan: 'Presensi digital resmi kehadiran kegiatan sosialisasi untuk membuka akses pendaftaran KLK',
  },
  {
    no: 3,
    deskripsi: 'Mahasiswa mendaftarkan diri',
    pelaksana: 'Mahasiswa',
    tahap: 'Sosialisasi & Pendaftaran',
    keterangan: 'Pengisian data diri dan pemilihan instansi mitra laboratorium/industri di sistem SIKMA',
  },
  {
    no: 4,
    deskripsi: 'Mahasiswa melengkapi Berkas pendaftaran KLK',
    pelaksana: 'Mahasiswa',
    tahap: 'Sosialisasi & Pendaftaran',
    keterangan: 'Unggah berkas prasyarat pendaftaran: KHS, KRS, Proposal Singkat, CV, dan formulir permohonan',
  },
  {
    no: 5,
    deskripsi: 'Mahasiswa melakukan konfirmasi ke Admin untuk kebutuhan Surat Pengantar',
    pelaksana: 'Mahasiswa',
    tahap: 'Sosialisasi & Pendaftaran',
    keterangan: 'Menghubungi Admin TU Departemen Kimia untuk verifikasi berkas dan penerbitan surat pengantar',
  },
  {
    no: 6,
    deskripsi: 'Admin mencheck berkas mahasiswa yang telah terunggah',
    pelaksana: 'Admin',
    tahap: 'Verifikasi Berkas & Surat Pengantar',
    keterangan: 'Pemeriksaan validitas berkas, prasyarat kelayakan SKS tempuh, dan proposal kegiatan',
  },
  {
    no: 7,
    deskripsi: 'Admin membuatkan surat pengantar',
    pelaksana: 'Admin',
    tahap: 'Verifikasi Berkas & Surat Pengantar',
    keterangan: 'Pembuatan surat pengantar resmi bernomor dinas dari Departemen Kimia FSTeM Universitas Brawijaya',
  },
  {
    no: 8,
    deskripsi: 'Admin mengunggah surat pengantar',
    pelaksana: 'Admin',
    tahap: 'Verifikasi Berkas & Surat Pengantar',
    keterangan: 'Unggah dokumen surat pengantar ber-barcode/stempel resmi ke akun mahasiswa di SIKMA',
  },
  {
    no: 9,
    deskripsi: 'Mahasiswa melakukan konfirmasi ke Admin terkait surat keterangan diterima oleh instansi',
    pelaksana: 'Mahasiswa',
    tahap: 'Verifikasi Berkas & Surat Pengantar',
    keterangan: 'Menyerahkan/mengunggah Letter of Acceptance (LoA) atau surat balasan penerimaan dari instansi mitra',
  },
  {
    no: 10,
    deskripsi: 'Admin mengubah status pendaftaran menjadi "diterima" dan memperbaharui dosen pembimbing KLK',
    pelaksana: 'Admin',
    tahap: 'Verifikasi Berkas & Surat Pengantar',
    keterangan: 'Update status kegiatan menjadi Disetujui/Sedang Berjalan dan penetapan Dosen Pembimbing KLK',
  },
  {
    no: 11,
    deskripsi: 'Mahasiswa melakukan konsultasi dan bimbingan pada Dosen Pembimbing',
    pelaksana: 'Mahasiswa',
    tahap: 'Pelaksanaan & Bimbingan',
    keterangan: 'Konsultasi berkala terkait topik penelitian lapangan, etika lab, dan penyusunan draf laporan',
  },
  {
    no: 12,
    deskripsi: 'Mahasiswa menginputkan Bimbingan dengan Dosen Minimal 6 Kali',
    pelaksana: 'Mahasiswa',
    tahap: 'Pelaksanaan & Bimbingan',
    keterangan: 'Pengisian logbook bimbingan resmi dan pengesahan sesi pembimbingan (minimal 6 kali)',
  },
  {
    no: 13,
    deskripsi: 'Mahasiswa memilih Jumlah SKS dan Mata Kuliah Konversi',
    pelaksana: 'Mahasiswa',
    tahap: 'Pelaksanaan & Bimbingan',
    keterangan: 'Pemilihan paket bobot SKS (7 - 20 SKS) serta penyesuaian mata kuliah ekuivalensi kurikulum kimia',
  },
  {
    no: 14,
    deskripsi: 'Mahasiswa mengunggah nilai pembimbing Lapang',
    pelaksana: 'Mahasiswa',
    tahap: 'Pelaksanaan & Bimbingan',
    keterangan: 'Unggah scan lembar evaluasi dan lembar penilaian kinerja dari mentor instansi/industri',
  },
  {
    no: 15,
    deskripsi: 'Mahasiswa melakukan konfirmasi ke Admin bahwa telah mengunggah Nilai Pembimbing Lapang',
    pelaksana: 'Mahasiswa',
    tahap: 'Pelaksanaan & Bimbingan',
    keterangan: 'Pemberitahuan kepada admin bahwa dokumen evaluasi pembimbing lapangan telah lengkap terunggah',
  },
  {
    no: 16,
    deskripsi: 'Mahasiswa melengkapi Berkas Ujian KLK',
    pelaksana: 'Mahasiswa',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Mengunggah draf Laporan Akhir Program, logbook kegiatan lengkap, dan lembar persetujuan ujian',
  },
  {
    no: 17,
    deskripsi: 'Admin memasukkan Nilai Pembimbing Lapang',
    pelaksana: 'Admin',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Validasi dan penginputan angka nilai pembimbing lapangan ke dalam rekapitulasi penilaian',
  },
  {
    no: 18,
    deskripsi: 'Mahasiswa mendaftar Ujian KLK Maksimal 6 Minggu setelah tanggal selesai KLK',
    pelaksana: 'Mahasiswa',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Registrasi jadwal ujian seminar KLK dengan batas toleransi maksimal 6 minggu pasca penutupan kegiatan',
  },
  {
    no: 19,
    deskripsi: 'Mahasiswa mengunduh dan mencetak berita acara ujian KLK',
    pelaksana: 'Mahasiswa',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Unduh dan cetak formulir Berita Acara Ujian serta form rubrik penilaian untuk dosen penguji',
  },
  {
    no: 20,
    deskripsi: 'Mahasiswa melaksanakan Ujian KLK',
    pelaksana: 'Mahasiswa',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Presentasi hasil kegiatan KLK dan tanya jawab di hadapan dosen penguji & dosen pembimbing',
  },
  {
    no: 21,
    deskripsi: 'Dosen memasukkan Nilai Ujian KLK',
    pelaksana: 'Dosen',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Input nilai Laporan Akhir Program dan Kemandirian Pengayaan Pengetahuan di sistem SIKMA',
  },
  {
    no: 22,
    deskripsi: 'Mahasiswa menyerahkan Berita Acara ke Admin TU',
    pelaksana: 'Mahasiswa',
    tahap: 'Ujian & Administrasi Akhir',
    keterangan: 'Penyerahan fisik berkas Berita Acara bertanda tangan lengkap ke Admin TU untuk penetapan nilai akhir di SIAKAD',
  },
];

export type KlkSubTab =
  | 'pengajuan-list'
  | 'form-baru'
  | 'form-klk-cetak'
  | 'logbook-mingguan'
  | 'penilaian-seminar'
  | 'direktori-mitra'
  | 'unduhan-panduan';

interface KlkViewProps {
  currentRole: UserRole;
  currentUser?: AuthUser | null;
  student: Mahasiswa;
  mahasiswaList?: Mahasiswa[];
  dosenList: Dosen[];
  klkList: PengajuanKLK[];
  mitraList: MitraIndustriKLK[];
  dokumenList: DokumenPanduanKLK[];
  initialSubTab?: KlkSubTab;
  onAddPengajuan: (newPengajuan: PengajuanKLK) => void;
  onUpdateStatus: (
    id: string,
    status: PengajuanKLK['status'],
    nomorSurat?: string
  ) => void;
  onUpdateUjian?: (
    id: string,
    tanggalUjian: string,
    pukulUjian: string,
    ruangUjian: string
  ) => void;
  onAddLogbook: (klkId: string, logbook: LogbookMingguanKLK) => void;
  onVerifyLogbook: (
    klkId: string,
    logbookId: string,
    status: LogbookMingguanKLK['statusVerifikasi'],
    catatan: string
  ) => void;
  onSimpanNilai: (
    klkId: string,
    nilaiIndustri: number,
    nilaiDosen: number,
    nilaiHuruf: 'A' | 'B+' | 'B' | 'C+' | 'C'
  ) => void;
  onUpdateKLK?: (updatedKlk: PengajuanKLK) => void;
}

export const KlkView: React.FC<KlkViewProps> = ({
  currentRole,
  currentUser,
  student,
  mahasiswaList = [],
  dosenList,
  klkList,
  mitraList,
  dokumenList,
  initialSubTab = 'form-baru',
  onAddPengajuan,
  onUpdateStatus,
  onUpdateUjian,
  onAddLogbook,
  onVerifyLogbook,
  onSimpanNilai,
  onUpdateKLK
}) => {
  // Ambil data user aktif (dari prop currentUser atau fallback localStorage)
  const effectiveUser = useMemo(() => {
    if (currentUser) return currentUser;
    try {
      const saved = localStorage.getItem('sikma_auth_user');
      if (saved) return JSON.parse(saved) as AuthUser;
    } catch {}
    return null;
  }, [currentUser]);

  const isMahasiswa = currentRole === 'mahasiswa';
  // Hak akses pengelolaan Status KLK: Hanya Super Admin dan Admin yang dapat mengakses & mengubah status
  const canManageStatus = currentRole === 'super_admin' || currentRole === 'admin';

  // State sinkronisasi pemilihan mahasiswa pada Form Pendaftaran Baru (khusus Admin & Dosen)
  const [formSelectedMhsId, setFormSelectedMhsId] = useState<string>('');
  const [mhsSearchQuery, setMhsSearchQuery] = useState<string>('');
  const [isMhsDropdownOpen, setIsMhsDropdownOpen] = useState<boolean>(false);
  const mhsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mhsDropdownRef.current && !mhsDropdownRef.current.contains(event.target as Node)) {
        setIsMhsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMhsPemohon = useMemo(() => {
    const q = mhsSearchQuery.toLowerCase().trim();
    if (!q) return mahasiswaList;
    return mahasiswaList.filter(
      (m) =>
        m.nama.toLowerCase().includes(q) ||
        m.nim.toLowerCase().includes(q) ||
        String(m.angkatan).includes(q) ||
        String(m.semester).includes(q) ||
        (m.dosenPANama && m.dosenPANama.toLowerCase().includes(q))
    );
  }, [mahasiswaList, mhsSearchQuery]);

  // Data mahasiswa aktif yang sinkron dengan master data Mahasiswa
  const currentStudentData = useMemo(() => {
    if (isMahasiswa) {
      const cleanEffectiveNim = (effectiveUser?.identifier || student.nim).replace(/\D/g, '');
      const cleanEffectiveNama = (effectiveUser?.nama || student.nama).trim().toLowerCase();
      const matched = mahasiswaList.find(
        (m) =>
          m.id === effectiveUser?.id ||
          (cleanEffectiveNim && m.nim.replace(/\D/g, '') === cleanEffectiveNim) ||
          (cleanEffectiveNama && m.nama.trim().toLowerCase() === cleanEffectiveNama)
      );
      return matched || student;
    }
    if (formSelectedMhsId) {
      const found = mahasiswaList.find((m) => m.id === formSelectedMhsId);
      if (found) return found;
    }
    return mahasiswaList[0] || student;
  }, [isMahasiswa, effectiveUser, student, mahasiswaList, formSelectedMhsId]);

  // State QR Sosialisasi & Otorisasi Buka Blokir
  const [qrSosialisasiList, setQrSosialisasiList] = useState<QrSosialisasiKLK[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_klk_qr_list');
      return saved ? JSON.parse(saved) : INITIAL_QR_LIST;
    } catch {
      return INITIAL_QR_LIST;
    }
  });

  const [unblockedNims, setUnblockedNims] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_klk_unblocked_nims');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [verifiedStudents, setVerifiedStudents] = useState<VerifiedStudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_klk_verified_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isQrManagerModalOpen, setIsQrManagerModalOpen] = useState(false);
  const [projectorQrItem, setProjectorQrItem] = useState<QrSosialisasiKLK | null>(null);

  const handleSaveQrList = (newList: QrSosialisasiKLK[]) => {
    setQrSosialisasiList(newList);
    try {
      localStorage.setItem('sikma_klk_qr_list', JSON.stringify(newList));
    } catch {}
  };

  const handleSaveUnblockedNims = (newNims: string[]) => {
    setUnblockedNims(newNims);
    try {
      localStorage.setItem('sikma_klk_unblocked_nims', JSON.stringify(newNims));
    } catch {}
  };

  const handleVerifyStudentSuccess = (kode: string) => {
    const studentNim = (effectiveUser?.identifier || student.nim).replace(/\D/g, '');
    const studentNama = effectiveUser?.nama || student.nama;
    const newRecord: VerifiedStudentRecord = {
      nim: studentNim,
      nama: studentNama,
      kodeQr: kode,
      waktuVerifikasi: Date.now()
    };
    const updated = [newRecord, ...verifiedStudents.filter((v) => v.nim.replace(/\D/g, '') !== studentNim)];
    setVerifiedStudents(updated);
    try {
      localStorage.setItem('sikma_klk_verified_students', JSON.stringify(updated));
    } catch {}
  };

  const activeStudentNimClean = (effectiveUser?.identifier || student.nim).replace(/\D/g, '');
  const activeStudentNama = effectiveUser?.nama || student.nama;
  const isStudentUnblocked = unblockedNims.includes(activeStudentNimClean);
  const isStudentVerified = verifiedStudents.some((v) => v.nim.replace(/\D/g, '') === activeStudentNimClean);
  // Form baru terbuka jika: bukan mahasiswa (admin/dosen bypass), atau mahasiswa telah dibuka blokirnya oleh admin, atau telah verifikasi scan QR aktif
  const isFormBaruUnlocked = !isMahasiswa || isStudentUnblocked || isStudentVerified;

  // Helper pencocokan kepemilikan data pengajuan KLK dengan mahasiswa yang login
  const isKlkBelongsToCurrentStudent = (item: PengajuanKLK): boolean => {
    if (!isMahasiswa) return true;

    const currentNama = (effectiveUser?.nama || student?.nama || '').trim().toLowerCase();
    const currentNim = (effectiveUser?.identifier || student?.nim || '').replace(/\D/g, '');
    const currentUserId = (effectiveUser?.id || student?.id || '').trim().toLowerCase();

    const itemNama = (item.mahasiswaNama || '').trim().toLowerCase();
    const itemNim = (item.nim || '').replace(/\D/g, '');
    const itemMhsId = (item.mahasiswaId || '').trim().toLowerCase();

    // 1. Cocokkan ID mahasiswa jika ada
    if (currentUserId && itemMhsId && currentUserId === itemMhsId) {
      return true;
    }

    // 2. Cocokkan NIM mahasiswa jika valid (>= 6 digit)
    if (currentNim && itemNim && currentNim.length >= 6 && itemNim.length >= 6) {
      if (currentNim === itemNim) {
        return true;
      }
    }

    // 3. Cocokkan Nama Lengkap (persis)
    if (currentNama && itemNama) {
      if (currentNama === itemNama) {
        return true;
      }
    }

    return false;
  };

  // Batasi daftar KLK: jika peran mahasiswa, hanya tampilkan aktivitas mahasiswa yang sedang login
  const roleScopedKlkList = useMemo(() => {
    if (!isMahasiswa) return klkList;
    return klkList.filter(isKlkBelongsToCurrentStudent);
  }, [klkList, isMahasiswa, effectiveUser, student]);

  const [subTab, setSubTab] = useState<KlkSubTab>(initialSubTab);
  const [selectedKlkId, setSelectedKlkId] = useState<string>(
    klkList.length > 0 ? klkList[0].id : ''
  );

  // Sinkronkan selectedKlkId saat peran mahasiswa aktif agar merujuk ke data miliknya sendiri
  useEffect(() => {
    if (isMahasiswa && roleScopedKlkList.length > 0) {
      const exists = roleScopedKlkList.some((k) => k.id === selectedKlkId);
      if (!exists) {
        setSelectedKlkId(roleScopedKlkList[0].id);
      }
    }
  }, [isMahasiswa, roleScopedKlkList, selectedKlkId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkema, setFilterSkema] = useState<string>('Semua');
  const [filterSemester, setFilterSemester] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // List master data semester (disinkronkan dari localStorage atau INITIAL_SEMESTER_LIST)
  const [semesterOptions] = useState<SemesterItem[]>(() => {
    const saved = localStorage.getItem('sikma_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTER_LIST;
  });

  // List master data ruangan (disinkronkan dari localStorage atau INITIAL_RUANGAN_LIST)
  const [ruanganOptions] = useState<RuanganItem[]>(() => {
    const saved = localStorage.getItem('sikma_ruangan_list');
    return saved ? JSON.parse(saved) : INITIAL_RUANGAN_LIST;
  });

  const defaultActiveSemester =
    semesterOptions.find((s) => s.status === 'Aktif')?.namaSemester ||
    semesterOptions[0]?.namaSemester ||
    'Ganjil 2026 / 2027';

  // Form Pengajuan Baru State (dengan pilihan Semester dari data Semester dan Status: Diproses, Disetujui, Ditolak)
  const [formSemester, setFormSemester] = useState<string>(defaultActiveSemester);
  const [formStatus, setFormStatus] = useState<StatusKLK>('Diproses');
  const [formSkema, setFormSkema] = useState<SkemaKLK>('PKL');
  const [formMitra, setFormMitra] = useState('');
  const [formAlamatMitra, setFormAlamatMitra] = useState('');
  const [formBidangPekerjaan, setFormBidangPekerjaan] = useState('');
  const [formMentor, setFormMentor] = useState('');
  const [formKontakMentor, setFormKontakMentor] = useState('');
  const [formHpPembimbing, setFormHpPembimbing] = useState('');
  const [formEmailPembimbing, setFormEmailPembimbing] = useState('');
  const [formDosenKLK, setFormDosenKLK] = useState(
    dosenList.length > 0 ? `${dosenList[0].nama}, ${dosenList[0].gelar}` : ''
  );
  const [formTglMulai, setFormTglMulai] = useState('');
  const [formTglSelesai, setFormTglSelesai] = useState('');
  const [formTglUjian, setFormTglUjian] = useState('');
  const [formPukulUjian, setFormPukulUjian] = useState('');
  const [formMkKonversiList, setFormMkKonversiList] = useState<string[]>([
    DAFTAR_MATA_KULIAH_KONVERSI_KLK[0]
  ]);
  const [searchMkKonversi, setSearchMkKonversi] = useState<string>('');

  const [conflictWarningToast, setConflictWarningToast] = useState<string | null>(null);

  const formSerialConflicts = useMemo(() => {
    return checkAllSerialConflicts(formMkKonversiList);
  }, [formMkKonversiList]);

  const hasSerialConflict = formSerialConflicts.length > 0;

  const formTotalSks = useMemo(() => {
    return formMkKonversiList.reduce((acc, mk) => acc + extractSksFromMkKonversi(mk), 0);
  }, [formMkKonversiList]);

  const isFormKombinasiSksValid =
    TARGET_KOMBINASI_SKS_KLK.includes(formTotalSks as any) && !hasSerialConflict;

  // Backward compatibility aliases
  const formMkKonversi = formMkKonversiList.join('; ');
  const formSks = formTotalSks;

  const handleToggleMkKonversi = (mkStr: string) => {
    if (formMkKonversiList.includes(mkStr)) {
      setFormMkKonversiList((prev) => prev.filter((item) => item !== mkStr));
      setConflictWarningToast(null);
      return;
    }

    // Periksa apakah ada konflik dengan mata kuliah berseri/berurutan yang telah dipilih
    const conflictMk = getSerialConflictWith(mkStr, formMkKonversiList);
    if (conflictMk) {
      const targetInfo = parseMkKonversiString(mkStr);
      const conflictInfo = parseMkKonversiString(conflictMk);
      const msg = `Mata kuliah "${targetInfo.nama}" tidak dapat dipilih bersamaan dengan "${conflictInfo.nama}". Sesuai ketentuan kurikulum KLK, mata kuliah berseri/berurutan (seperti Seri I dan Seri II) tidak boleh diambil berpasangan dalam satu usulan KLK.`;
      setConflictWarningToast(msg);
      setTimeout(() => setConflictWarningToast(null), 7000);
      return;
    }

    // Periksa apakah penambahan mata kuliah ini menyebabkan total akumulasi melebihi 16 SKS
    const additionalSks = extractSksFromMkKonversi(mkStr);
    const projectedTotalSks = formTotalSks + additionalSks;
    if (projectedTotalSks > 16) {
      const targetInfo = parseMkKonversiString(mkStr);
      const msg = `Tidak dapat menambahkan "${targetInfo.nama}" (${additionalSks} SKS). Total beban SKS yang sudah Anda pilih saat ini adalah ${formTotalSks} SKS. Jika ditambahkan, totalnya menjadi ${projectedTotalSks} SKS yang melebihi batas maksimal 16 SKS. Silakan kurangi pilihan mata kuliah lainnya terlebih dahulu.`;
      setConflictWarningToast(msg);
      setTimeout(() => setConflictWarningToast(null), 7000);
      return;
    }

    setConflictWarningToast(null);
    setFormMkKonversiList((prev) => [...prev, mkStr]);
  };

  const handleSelectRadioTargetSks = (targetSks: number) => {
    const paket = REKOMENDASI_PAKET_SKS_KLK[targetSks];
    if (paket) {
      setConflictWarningToast(null);
      setFormMkKonversiList(paket.mkList);
    }
  };

  const filteredMkKonversiList = useMemo(() => {
    const q = searchMkKonversi.toLowerCase().trim();
    if (!q) return DAFTAR_MATA_KULIAH_KONVERSI_KLK;
    return DAFTAR_MATA_KULIAH_KONVERSI_KLK.filter((mk) => mk.toLowerCase().includes(q));
  }, [searchMkKonversi]);

  const [formLoAName, setFormLoAName] = useState('');
  const [formSubmittedSuccess, setFormSubmittedSuccess] = useState(false);

  // States for Upload Berkas Pengajuan KLK (Surat Lamaran KLK, Proposal PKL atau Magang, CV, Transkrip Nilai)
  interface BerkasPengajuanBaruItem {
    file: File | null;
    fileName: string;
    fileSize: string;
    uploadedAt: string;
  }

  // States for Upload Berkas Pengajuan KLK (Browse, Submit, Preview)
  interface BerkasPengajuanBaruItem {
    id: 'surat_lamaran' | 'proposal' | 'cv_mahasiswa' | 'transkrip_akademik';
    label: string;
    description: string;
    file: File | null;
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    status: 'empty' | 'selected' | 'uploaded';
  }

  const [formBerkasBaruMap, setFormBerkasBaruMap] = useState<{
    surat_lamaran: BerkasPengajuanBaruItem;
    proposal: BerkasPengajuanBaruItem;
    cv_mahasiswa: BerkasPengajuanBaruItem;
    transkrip_akademik: BerkasPengajuanBaruItem;
  }>({
    surat_lamaran: {
      id: 'surat_lamaran',
      label: 'Surat Lamaran KLK',
      description: 'Surat permohonan magang / kegiatan KLK resmi ke pimpinan instansi mitra',
      file: null,
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'empty'
    },
    proposal: {
      id: 'proposal',
      label: 'Proposal PKL atau Magang',
      description: 'Proposal rencana kerja, sasaran kompetensi & metodologi kegiatan di mitra',
      file: null,
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'empty'
    },
    cv_mahasiswa: {
      id: 'cv_mahasiswa',
      label: 'CV (Curriculum Vitae)',
      description: 'Curriculum Vitae terbaru memuat riwayat studi, instrumen kimia & keahlian',
      file: null,
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'empty'
    },
    transkrip_akademik: {
      id: 'transkrip_akademik',
      label: 'Transkrip Nilai',
      description: 'Transkrip nilai akademik kumulatif lengkap semester berjalan yang sah',
      file: null,
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'empty'
    }
  });

  const handleBrowseBerkasBaru = (
    key: 'surat_lamaran' | 'proposal' | 'cv_mahasiswa' | 'transkrip_akademik',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setFormBerkasBaruMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        file,
        fileName: file.name,
        fileSize: sizeStr,
        status: 'selected'
      }
    }));
    e.target.value = '';
  };

  const handleSubmitBerkasBaru = (
    key: 'surat_lamaran' | 'proposal' | 'cv_mahasiswa' | 'transkrip_akademik'
  ) => {
    const item = formBerkasBaruMap[key];
    if (!item.fileName) {
      alert(`Silakan pilih berkas terlebih dahulu menggunakan tombol "Browse" untuk ${item.label}.`);
      return;
    }

    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setFormBerkasBaruMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'uploaded',
        uploadedAt: dateStr
      }
    }));

    setBerkasPendaftaranMap((prev) => ({
      ...prev,
      [key]: {
        id: key,
        label: item.label,
        description: item.description,
        fileName: item.fileName,
        fileSize: item.fileSize,
        uploadedAt: dateStr,
        status: 'uploaded',
        allowPreview: true
      }
    }));

    alert(`Berkas "${item.label}" (${item.fileName}) berhasil disubmit (status: Terunggah)!`);
  };

  const handlePreviewBerkasBaru = (
    key: 'surat_lamaran' | 'proposal' | 'cv_mahasiswa' | 'transkrip_akademik'
  ) => {
    const item = formBerkasBaruMap[key];
    if (!item.fileName) {
      alert(`Belum ada berkas untuk ${item.label}. Silakan gunakan tombol "Browse" untuk memilih berkas terlebih dahulu.`);
      return;
    }

    setPreviewDocData({
      label: item.label,
      fileName: item.fileName,
      description: item.description,
      uploadedAt: item.uploadedAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      fileSize: item.fileSize || '500 KB',
      category: 'Berkas Pendaftaran KLK'
    });
  };

  // State Modal Detail KLK
  const [detailModalKlk, setDetailModalKlk] = useState<PengajuanKLK | null>(null);
  const [isEditingUjianInModal, setIsEditingUjianInModal] = useState(false);
  const [modalTglUjian, setModalTglUjian] = useState('');
  const [modalPukulUjian, setModalPukulUjian] = useState('');
  const [modalRuangUjian, setModalRuangUjian] = useState('');
  const [modalSaveSuccess, setModalSaveSuccess] = useState(false);
  const [modalSaveMessage, setModalSaveMessage] = useState('Jadwal Ujian (Tanggal, Pukul, dan Ruang Ujian) berhasil diperbarui dan disimpan!');

  // States for Top Box 1 (Pengumuman) & Box 2 (Button Bimbingan & Edit KLK)
  const [modalBimbinganKlkOpen, setModalBimbinganKlkOpen] = useState(false);
  const [modalEditKlkOpen, setModalEditKlkOpen] = useState(false);

  // Form State for Edit KLK
  const [editKlkForm, setEditKlkForm] = useState<{
    namaMitra: string;
    alamatMitra: string;
    bidangPekerjaan: string;
    skema: SkemaKLK;
    sksDiakui: number;
    tanggalMulai: string;
    tanggalSelesai: string;
    dosenPembimbingKLK: string;
    mentorIndustri: string;
    kontakMentor: string;
    semester: number;
    status: 'Diproses' | 'Disetujui' | 'Ditolak';
  }>({
    namaMitra: '',
    alamatMitra: '',
    bidangPekerjaan: '',
    skema: 'Magang Industri Kimia' as SkemaKLK,
    sksDiakui: 7,
    tanggalMulai: '',
    tanggalSelesai: '',
    dosenPembimbingKLK: '',
    mentorIndustri: '',
    kontakMentor: '',
    semester: 6,
    status: 'Diproses'
  });

  // State for Sesi Bimbingan KLK Mahasiswa (Min. 6 Sesi)
  interface SesiBimbinganItem {
    id: number;
    tanggal: string;
    pokokBahasan: string;
    catatanDosen: string;
    linkGoogleDrive?: string;
    parafDosen: boolean;
    tanggalParaf?: string;
    status: 'Diproses' | 'Disetujui' | 'Ditolak';
  }

  // Form State for Kartu Bimbingan (Tanggal, Detail Bimbingan, Link Folder Google Drive, Status)
  const [formKartuBimbingan, setFormKartuBimbingan] = useState({
    tanggalBimbingan: '2026-03-18',
    detailBimbingan: '',
    linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026-Berkas?usp=sharing',
    status: 'Diproses' as 'Diproses' | 'Disetujui' | 'Ditolak'
  });
  const [bimbinganSavedSuccess, setBimbinganSavedSuccess] = useState(false);
  const [bimbinganSavedMessage, setBimbinganSavedMessage] = useState('');
  const [deletingBimbinganId, setDeletingBimbinganId] = useState<number | null>(null);

  const [bimbinganSesiList, setBimbinganSesiList] = useState<SesiBimbinganItem[]>([
    {
      id: 1,
      tanggal: '10 Februari 2026',
      pokokBahasan: 'Pengarahan awal, orientasi instansi mitra, etika laboratorium industri kimia, dan penyusunan proposal rencana kerja KLK',
      catatanDosen: 'Pelajari SOP instansi mitra dan pastikan K3 laboratorium kimia dipatuhi dengan ketat.',
      linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026?usp=sharing',
      parafDosen: true,
      tanggalParaf: '10 Feb 2026',
      status: 'Disetujui'
    },
    {
      id: 2,
      tanggal: '24 Februari 2026',
      pokokBahasan: 'Progres pengoperasian instrumen analisis (AAS, HPLC, GC-MS) dan persiapan pengambilan data eksperimental',
      catatanDosen: 'Lakukan kalibrasi instrumen dengan larutan standar tersertifikasi. Catat deviasi standar secara berkala.',
      linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026?usp=sharing',
      parafDosen: true,
      tanggalParaf: '24 Feb 2026',
      status: 'Disetujui'
    },
    {
      id: 3,
      tanggal: '10 Maret 2026',
      pokokBahasan: 'Validasi metode analisis kimia dan penanganan interferensi matriks sampel lingkungan / industri',
      catatanDosen: 'Metode analisis sudah baik. Diskusikan dengan pembimbing lapangan mengenai limit deteksi (LOD & LOQ).',
      linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026?usp=sharing',
      parafDosen: true,
      tanggalParaf: '10 Mar 2026',
      status: 'Disetujui'
    },
    {
      id: 4,
      tanggal: '28 Maret 2026',
      pokokBahasan: 'Evaluasi data primer logbook lapangan mingguan dan penyusunan bab metodologi penelitian KLK',
      catatanDosen: 'Logbook mingguan sedang dalam penelaahan berkas oleh tim dosen pembimbing.',
      linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026?usp=sharing',
      parafDosen: true,
      tanggalParaf: '28 Mar 2026',
      status: 'Diproses'
    },
    {
      id: 5,
      tanggal: '15 April 2026',
      pokokBahasan: 'Review draf Bab III & Bab IV laporan KLK (Hasil dan Pembahasan kimia analitik/organik terapan)',
      catatanDosen: 'Penjelasan mekanisme reaksi dan batas deteksi belum lengkap. Mohon perbaiki dan ajukan ulang.',
      linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026?usp=sharing',
      parafDosen: true,
      tanggalParaf: '15 Apr 2026',
      status: 'Ditolak'
    },
    {
      id: 6,
      tanggal: '02 Mei 2026',
      pokokBahasan: 'Finalisasi draf laporan lengkap KLK, verifikasi lembar nilai pembimbing lapangan, dan rekomendasi pendaftaran seminar ujian',
      catatanDosen: 'Draf laporan disetujui untuk maju seminar ujian KLK. Segera lengkapi berkas pendaftaran seminar.',
      linkGoogleDrive: 'https://drive.google.com/drive/folders/1Kimia-UB-KLK2026?usp=sharing',
      parafDosen: true,
      tanggalParaf: '02 Mei 2026',
      status: 'Disetujui'
    }
  ]);

  // Handler Aksi Button Status (Diproses - Kuning, Disetujui - Hijau, Ditolak - Merah) & Button Hapus (Merah Tua)
  const handleSetStatusBimbingan = (id: number, status: 'Diproses' | 'Disetujui' | 'Ditolak') => {
    setBimbinganSesiList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setBimbinganSavedSuccess(true);
    setBimbinganSavedMessage(`Status sesi bimbingan #${id} diubah menjadi "${status}"!`);
    setTimeout(() => setBimbinganSavedSuccess(false), 3500);
  };

  const handleDeleteBimbingan = (id: number) => {
    setBimbinganSesiList((prev) => prev.filter((item) => item.id !== id));
    setDeletingBimbinganId(null);
    setBimbinganSavedSuccess(true);
    setBimbinganSavedMessage(`Sesi bimbingan #${id} berhasil dihapus dari daftar.`);
    setTimeout(() => setBimbinganSavedSuccess(false), 3500);
  };

  // Handler Simpan Input Kartu Bimbingan Baru
  const handleSaveKartuBimbingan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKartuBimbingan.tanggalBimbingan || !formKartuBimbingan.detailBimbingan.trim() || !formKartuBimbingan.linkGoogleDrive.trim()) {
      return;
    }

    let formattedDate = formKartuBimbingan.tanggalBimbingan;
    try {
      const parts = formKartuBimbingan.tanggalBimbingan.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        if (monthIndex >= 0 && monthIndex < 12) {
          formattedDate = `${day < 10 ? '0' + day : day} ${months[monthIndex]} ${year}`;
        }
      }
    } catch {
      // fallback to original date string
    }

    const newId = bimbinganSesiList.length > 0 ? Math.max(...bimbinganSesiList.map(s => s.id)) + 1 : 1;
    const newEntry: SesiBimbinganItem = {
      id: newId,
      tanggal: formattedDate,
      pokokBahasan: formKartuBimbingan.detailBimbingan.trim(),
      catatanDosen: 'Catatan hasil bimbingan telah tercatat secara resmi pada Kartu Bimbingan KLK.',
      linkGoogleDrive: formKartuBimbingan.linkGoogleDrive.trim(),
      parafDosen: true,
      tanggalParaf: formattedDate,
      status: formKartuBimbingan.status
    };

    setBimbinganSesiList([newEntry, ...bimbinganSesiList]);
    setBimbinganSavedSuccess(true);
    setBimbinganSavedMessage(`Sesi Bimbingan (${formattedDate}) berhasil disimpan ke dalam Kartu Bimbingan dengan status "${formKartuBimbingan.status}"!`);
    setFormKartuBimbingan({
      tanggalBimbingan: new Date().toISOString().split('T')[0],
      detailBimbingan: '',
      linkGoogleDrive: formKartuBimbingan.linkGoogleDrive,
      status: 'Diproses'
    });

    setTimeout(() => {
      setBimbinganSavedSuccess(false);
    }, 4500);
  };

  // States for Box 1 (Berkas), Box 2 (SKS), Box 3 (Nilai) in Modal Detail
  const [isSksMenuOpen, setIsSksMenuOpen] = useState(false);
  const [selectedSksChoice, setSelectedSksChoice] = useState<number>(7);
  const [isEditingNilaiInModal, setIsEditingNilaiInModal] = useState(false);
  const [modalNilaiIndustri, setModalNilaiIndustri] = useState<number>(85);
  const [modalNilaiDosen, setModalNilaiDosen] = useState<number>(88);
  const [modalNilaiHuruf, setModalNilaiHuruf] = useState<'A' | 'B+' | 'B' | 'C+' | 'C'>('A');

  // States & Data for Unggah Berkas in Box 1 (Berkas KLK)
  const [activeUnggahCategory, setActiveUnggahCategory] = useState<'pendaftaran' | 'ujian' | null>('pendaftaran');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [downloadingDocType, setDownloadingDocType] = useState<string | null>(null);

  interface BerkasUploadItem {
    id: string;
    label: string;
    description: string;
    fileName: string;
    status: 'empty' | 'selected' | 'uploaded';
    fileSize?: string;
    uploadedAt?: string;
    allowPreview?: boolean;
  }

  const [berkasPendaftaranMap, setBerkasPendaftaranMap] = useState<{ [key: string]: BerkasUploadItem }>({
    surat_pengantar: {
      id: 'surat_pengantar',
      label: 'Surat Pengantar',
      description: 'Surat pengantar resmi Departemen Kimia FSTeM UB untuk pimpinan instansi mitra',
      fileName: 'Surat_Pengantar_KLK_Kimia_UB.pdf',
      status: 'uploaded',
      fileSize: '480 KB',
      uploadedAt: '12 Feb 2026',
      allowPreview: true
    },
    persetujuan_dpa: {
      id: 'persetujuan_dpa',
      label: 'Form Persetujuan DPA',
      description: 'Persetujuan dosen penasihat akademik bertanda tangan',
      fileName: 'Form_Persetujuan_DPA_Kimia.pdf',
      status: 'uploaded',
      fileSize: '420 KB',
      uploadedAt: '12 Feb 2026',
      allowPreview: true
    },
    surat_instansi: {
      id: 'surat_instansi',
      label: 'Surat Instansi',
      description: 'Surat balasan / konfirmasi persetujuan resmi dari instansi mitra',
      fileName: 'Surat_Penerimaan_Instansi_Mitra.pdf',
      status: 'uploaded',
      fileSize: '890 KB',
      uploadedAt: '15 Feb 2026',
      allowPreview: true
    },
    surat_lamaran: {
      id: 'surat_lamaran',
      label: 'Surat Lamaran',
      description: 'Surat permohonan magang KLK ke pimpinan instansi mitra',
      fileName: '',
      status: 'empty',
      allowPreview: true
    },
    proposal: {
      id: 'proposal',
      label: 'Proposal',
      description: 'Proposal rencana kerja & metodologi riset / laboratorium kimia',
      fileName: 'Proposal_KLK_Analisis_Kimia.pdf',
      status: 'uploaded',
      fileSize: '1.2 MB',
      uploadedAt: '14 Feb 2026',
      allowPreview: true
    },
    cv_mahasiswa: {
      id: 'cv_mahasiswa',
      label: 'CV Mahasiswa',
      description: 'Curriculum Vitae terbaru memuat riwayat studi dan keahlian instrumen',
      fileName: 'CV_Mahasiswa_Kimia_2026.pdf',
      status: 'uploaded',
      fileSize: '310 KB',
      uploadedAt: '10 Feb 2026',
      allowPreview: true
    },
    transkrip_akademik: {
      id: 'transkrip_akademik',
      label: 'Transkrip Akademik',
      description: 'Transkrip nilai akademik kumulatif lengkap yang telah disahkan DPA/KPS',
      fileName: 'Transkrip_Akademik_Kumulatif.pdf',
      status: 'uploaded',
      fileSize: '650 KB',
      uploadedAt: '14 Feb 2026',
      allowPreview: true
    },
    perpanjangan_klk: {
      id: 'perpanjangan_klk',
      label: 'Perpanjangan Durasi KLK',
      description: 'Surat permohonan / persetujuan perpanjangan masa pelaksanaan kegiatan KLK di mitra',
      fileName: '',
      status: 'empty',
      allowPreview: true
    }
  });

  const [berkasUjianMap, setBerkasUjianMap] = useState<{ [key: string]: BerkasUploadItem }>({
    daftar_hadir: {
      id: 'daftar_hadir',
      label: 'Daftar Hadir',
      description: 'Daftar hadir pelaksanaan kegiatan / ujian seminar KLK',
      fileName: 'Daftar_Hadir_Ujian_KLK.pdf',
      status: 'uploaded',
      fileSize: '520 KB',
      uploadedAt: '12 Mar 2026',
      allowPreview: true
    },
    lembar_pengesahan: {
      id: 'lembar_pengesahan',
      label: 'Lembar Pengesahan',
      description: 'Lembar pengesahan pembimbing instansi & dosen pembimbing KLK',
      fileName: 'Lembar_Pengesahan_KLK.pdf',
      status: 'uploaded',
      fileSize: '680 KB',
      uploadedAt: '11 Mar 2026',
      allowPreview: true
    },
    presentasi: {
      id: 'presentasi',
      label: 'Presentasi',
      description: 'Slide materi presentasi seminar / ujian KLK (PPTX / PDF)',
      fileName: 'Slide_Presentasi_KLK.pptx',
      status: 'uploaded',
      fileSize: '4.5 MB',
      uploadedAt: '12 Mar 2026',
      allowPreview: false
    },
    laporan_pkl: {
      id: 'laporan_pkl',
      label: 'Laporan Akhir KLK',
      description: 'Naskah laporan akhir Kuliah Lapangan Kimia (KLK) UB',
      fileName: 'Laporan_Akhir_KLK_Kimia_UB.pdf',
      status: 'uploaded',
      fileSize: '3.2 MB',
      uploadedAt: '10 Mar 2026',
      allowPreview: true
    },
    berita_acara: {
      id: 'berita_acara',
      label: 'Berita Acara Ujian KLK',
      description: 'Formulir berita acara pelaksanaan ujian seminar KLK bertanda tangan',
      fileName: 'Berita_Acara_Ujian_KLK.pdf',
      status: 'uploaded',
      fileSize: '450 KB',
      uploadedAt: '13 Mar 2026',
      allowPreview: false
    }
  });

  const [previewDocData, setPreviewDocData] = useState<{
    label: string;
    fileName: string;
    description: string;
    uploadedAt?: string;
    fileSize?: string;
    category: string;
  } | null>(null);

  // State Modal Generate Surat Pengantar & Lampiran
  const [modalSuratPengantarOpen, setModalSuratPengantarOpen] = useState(false);
  const [modalLampiranSuratOpen, setModalLampiranSuratOpen] = useState(false);

  // State Modal Penilai & Generate Link Pembimbing Lapangan
  const [modalDetailPenilai, setModalDetailPenilai] = useState<{
    type: 'dosen' | 'lapangan';
    nama: string;
    peran: string;
    instansi: string;
    kontak?: string;
    bobot: string;
    komponen: string[];
    status: string;
  } | null>(null);
  const [modalGenerateLinkOpen, setModalGenerateLinkOpen] = useState(false);
  const [linkCopiedAlert, setLinkCopiedAlert] = useState(false);
  const [linkPembimbingLapangan, setLinkPembimbingLapangan] = useState<string>('');

  // State Modal Alur KLK (22 Langkah)
  const [modalAlurKlkOpen, setModalAlurKlkOpen] = useState(false);
  const [filterAktorAlur, setFilterAktorAlur] = useState<'Semua' | 'Mahasiswa' | 'Admin' | 'Dosen'>('Semua');
  const [searchQueryAlur, setSearchQueryAlur] = useState('');

  // State Modal Rekap Nilai (Header Button)
  const [modalRekapNilaiOpen, setModalRekapNilaiOpen] = useState(false);
  const [rekapFilterJenis, setRekapFilterJenis] = useState<string>('KLK');
  const [rekapFilterSemester, setRekapFilterSemester] = useState<string>('Semua');
  const [rekapSearchMhs, setRekapSearchMhs] = useState<string>('');

  // State Modal Khusus: Nilai Dosen Pembimbing KLK
  const [modalNilaiDosenOpen, setModalNilaiDosenOpen] = useState(false);
  const [activeNilaiDosenSection, setActiveNilaiDosenSection] = useState<
    | null
    | { mode: 'input'; type: 'laporan' | 'kemandirian' }
    | { mode: 'tampil'; type: 'laporan' | 'kemandirian' }
    | { mode: 'lembar'; type: 'laporan' | 'kemandirian' }
  >(null);

  const [nilaiLaporanData, setNilaiLaporanData] = useState<{
    answers: Record<number, number>;
    catatan: string;
    isSaved: boolean;
    updatedAt: string;
  }>({
    answers: {
      1: 5,
      2: 5,
      3: 4,
      4: 5,
      5: 5,
      6: 4,
      7: 5,
      8: 4,
      9: 5,
      10: 4,
      11: 4,
      12: 5,
      13: 5
    },
    catatan:
      'Mahasiswa menunjukkan ketepatan, kejujuran ilmiah, dan pelaporan yang sangat akurat. Pemahaman terhadap regulasi K3 serta etika profesional di laboratorium kimia industri sangat memuaskan.',
    isSaved: true,
    updatedAt: '12 Maret 2026'
  });

  const [nilaiKemandirianData, setNilaiKemandirianData] = useState<{
    answers: Record<number, number>;
    catatan: string;
    isSaved: boolean;
    updatedAt: string;
  }>({
    answers: {
      1: 5,
      2: 5,
      3: 4
    },
    catatan:
      'Mahasiswa menunjukkan kemandirian luar biasa dalam menyusun dan melaksanakan rencana penelitian mandiri, aktif mengeksplorasi sumber referensi ilmiah mutakhir, serta kritis dalam analisis data laboratorium kimia.',
    isSaved: true,
    updatedAt: '12 Maret 2026'
  });

  const [toastNilaiDosen, setToastNilaiDosen] = useState<string | null>(null);

  // State Modal Khusus: Nilai Pembimbing Lapang KLK
  const [modalNilaiPembimbingLapangOpen, setModalNilaiPembimbingLapangOpen] = useState(false);
  const [activeTabLapang, setActiveTabLapang] = useState<
    'semua' | 'lembar' | 'template' | 'file' | 'input' | 'tampil'
  >('semua');
  const [subSectionLapangInput, setSubSectionLapangInput] = useState<'laporan' | 'kemandirian'>('laporan');
  const [subSectionLapangTampil, setSubSectionLapangTampil] = useState<'laporan' | 'kemandirian'>('laporan');
  const [subSectionTemplateLapang, setSubSectionTemplateLapang] = useState<'laporan' | 'kemandirian'>('laporan');
  const [subSectionFileLapang, setSubSectionFileLapang] = useState<'laporan' | 'kemandirian'>('laporan');

  const [berkasFileLapangData, setBerkasFileLapangData] = useState<{
    laporan: { fileName: string; fileSize: string; uploadDate: string; status: string };
    kemandirian: { fileName: string; fileSize: string; uploadDate: string; status: string };
  }>({
    laporan: {
      fileName: 'File_Penilaian_Laporan_Akhir_Mitra.pdf',
      fileSize: '1.8 MB',
      uploadDate: '14 Maret 2026',
      status: 'Tervalidasi Digital'
    },
    kemandirian: {
      fileName: 'File_Penilaian_Kemandirian_Mitra.pdf',
      fileSize: '1.2 MB',
      uploadDate: '14 Maret 2026',
      status: 'Tervalidasi Digital'
    }
  });

  const [previewFileLapangModal, setPreviewFileLapangModal] = useState<{
    title: string;
    type: 'laporan' | 'kemandirian';
  } | null>(null);

  const [previewTemplateLapangModal, setPreviewTemplateLapangModal] = useState<{
    title: string;
    type: 'laporan' | 'kemandirian';
  } | null>(null);

  const [isLaporanUploadOpen, setIsLaporanUploadOpen] = useState(false);
  const [isLaporanInputOpen, setIsLaporanInputOpen] = useState(false);
  const [selectedLaporanFile, setSelectedLaporanFile] = useState<File | null>(null);
  const laporanFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isKemandirianUploadOpen, setIsKemandirianUploadOpen] = useState(false);
  const [isKemandirianInputOpen, setIsKemandirianInputOpen] = useState(false);
  const [selectedKemandirianFile, setSelectedKemandirianFile] = useState<File | null>(null);
  const kemandirianFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleLaporanFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLaporanFile(file);
      setToastNilaiLapang(`File terpilih: "${file.name}". Klik "Submit" untuk mengunggah.`);
      setTimeout(() => setToastNilaiLapang(null), 4000);
    }
  };

  const handleLaporanFileSubmit = () => {
    const fileToUpload = selectedLaporanFile;
    const fileName = fileToUpload ? fileToUpload.name : berkasFileLapangData.laporan.fileName;
    const formattedSize = fileToUpload
      ? fileToUpload.size > 1024 * 1024
        ? `${(fileToUpload.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(fileToUpload.size / 1024)} KB`
      : berkasFileLapangData.laporan.fileSize;

    setBerkasFileLapangData((prev) => ({
      ...prev,
      laporan: {
        fileName,
        fileSize: formattedSize,
        uploadDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        status: 'Terunggah & Tervalidasi'
      }
    }));

    setSelectedLaporanFile(null);
    setToastNilaiLapang(`Berkas Laporan Akhir Program "${fileName}" berhasil diunggah (Submit) dan tersimpan ke sistem arsip KLK!`);
    setTimeout(() => setToastNilaiLapang(null), 5000);
  };

  const handleKemandirianFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedKemandirianFile(file);
      setToastNilaiLapang(`File terpilih: "${file.name}". Klik "Submit" untuk mengunggah.`);
      setTimeout(() => setToastNilaiLapang(null), 4000);
    }
  };

  const handleKemandirianFileSubmit = () => {
    const fileToUpload = selectedKemandirianFile;
    const fileName = fileToUpload ? fileToUpload.name : berkasFileLapangData.kemandirian.fileName;
    const formattedSize = fileToUpload
      ? fileToUpload.size > 1024 * 1024
        ? `${(fileToUpload.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(fileToUpload.size / 1024)} KB`
      : berkasFileLapangData.kemandirian.fileSize;

    setBerkasFileLapangData((prev) => ({
      ...prev,
      kemandirian: {
        fileName,
        fileSize: formattedSize,
        uploadDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        status: 'Terunggah & Tervalidasi'
      }
    }));

    setSelectedKemandirianFile(null);
    setToastNilaiLapang(`Berkas Kemandiriaan Pengayaan Pengetahuan "${fileName}" berhasil diunggah (Submit) dan tersimpan ke sistem arsip KLK!`);
    setTimeout(() => setToastNilaiLapang(null), 5000);
  };

  const [nilaiLaporanLapangData, setNilaiLaporanLapangData] = useState<{
    answers: Record<number, number>;
    catatan: string;
    isSaved: boolean;
    updatedAt: string;
  }>({
    answers: {
      1: 5,
      2: 4,
      3: 5,
      4: 4,
      5: 5,
      6: 5,
      7: 4,
      8: 5,
      9: 5,
      10: 4,
      11: 5,
      12: 4,
      13: 5
    },
    catatan:
      'Mahasiswa berkinerja sangat baik selama praktik kerja lapangan di laboratorium industri kami. Ketepatan analisis, kejujuran data, kepatuhan K3, serta kerjasama dalam tim kerja sangat membanggakan.',
    isSaved: true,
    updatedAt: '14 Maret 2026'
  });

  const [nilaiKemandirianLapangData, setNilaiKemandirianLapangData] = useState<{
    answers: Record<number, number>;
    catatan: string;
    isSaved: boolean;
    updatedAt: string;
  }>({
    answers: {
      1: 5,
      2: 4,
      3: 5
    },
    catatan:
      'Mahasiswa mampu mandiri dalam mengoperasikan instrumen laboratorium kimia industri serta proaktif mencari solusi penanganan sampel secara mandiri dan bertanggung jawab.',
    isSaved: true,
    updatedAt: '14 Maret 2026'
  });

  const [toastNilaiLapang, setToastNilaiLapang] = useState<string | null>(null);

  const handleFileBrowse = (
    category: 'pendaftaran' | 'ujian',
    itemId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    if (category === 'pendaftaran') {
      setBerkasPendaftaranMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          fileName: file.name,
          fileSize: sizeFormatted,
          status: 'selected'
        }
      }));
    } else {
      setBerkasUjianMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          fileName: file.name,
          fileSize: sizeFormatted,
          status: 'selected'
        }
      }));
    }
  };

  const handleSubmitFile = (category: 'pendaftaran' | 'ujian', itemId: string) => {
    const targetMap = category === 'pendaftaran' ? berkasPendaftaranMap : berkasUjianMap;
    const item = targetMap[itemId];

    if (!item || !item.fileName) {
      alert(`Silakan pilih file terlebih dahulu menggunakan tombol "Browse" untuk ${item?.label || 'dokumen ini'}.`);
      return;
    }

    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (category === 'pendaftaran') {
      setBerkasPendaftaranMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: 'uploaded',
          uploadedAt: dateStr,
          fileSize: prev[itemId].fileSize || '450 KB'
        }
      }));
    } else {
      setBerkasUjianMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: 'uploaded',
          uploadedAt: dateStr,
          fileSize: prev[itemId].fileSize || '850 KB'
        }
      }));
    }

    alert(`Berkas "${item.label}" (${item.fileName}) berhasil diunggah (Submit) dan tersimpan ke sistem arsip KLK.`);
  };

  const handlePreviewFile = (category: 'pendaftaran' | 'ujian', itemId: string) => {
    const targetMap = category === 'pendaftaran' ? berkasPendaftaranMap : berkasUjianMap;
    const item = targetMap[itemId];

    if (!item || !item.fileName) {
      alert(`Belum ada file yang diunggah untuk ${item?.label || 'dokumen ini'}. Silakan klik "Browse" lalu "Submit" terlebih dahulu.`);
      return;
    }

    setPreviewDocData({
      label: item.label,
      fileName: item.fileName,
      description: item.description,
      uploadedAt: item.uploadedAt || '17 Sep 2026',
      fileSize: item.fileSize || '520 KB',
      category: category === 'pendaftaran' ? 'Berkas Pendaftaran KLK' : 'Berkas Ujian KLK'
    });
  };

  const handleDownloadPreviewDoc = () => {
    if (!previewDocData || !detailModalKlk) return;

    const content = `===============================================================
KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA
DEPARTEMEN KIMIA
ARSIP DIGITAL KULIAH LAPANGAN KIMIA (KLK)
===============================================================
DOKUMEN          : ${previewDocData.label}
KATEGORI         : ${previewDocData.category}
NAMA BERKAS      : ${previewDocData.fileName}
TANGGAL UNGGAH   : ${previewDocData.uploadedAt || '17 Sep 2026'}
UKURAN BERKAS    : ${previewDocData.fileSize || '500 KB'}
STATUS VERIFIKASI: DIVERIFIKASI OLEH SIM-KLK DEPARTEMEN KIMIA UB

IDENTITAS MAHASISWA:
Nama Lengkap     : ${detailModalKlk.mahasiswaNama}
NIM              : ${detailModalKlk.nim}
Program Studi    : S1 Kimia FSTeM Universitas Brawijaya
Instansi / Mitra : ${detailModalKlk.namaMitra}
Dosen Pembimbing : ${detailModalKlk.dosenPembimbingKLK}

DESKRIPSI BERKAS:
${previewDocData.description}

Catatan Akademik:
Berkas digital ini tersimpan secara sah dalam pangkalan data administrasi
Kuliah Lapangan Kimia (KLK) Universitas Brawijaya Malang.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', previewDocData.fileName.endsWith('.txt') ? previewDocData.fileName : `${previewDocData.fileName}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateSuratPengantar = () => {
    if (!detailModalKlk) return;
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setBerkasPendaftaranMap((prev) => ({
      ...prev,
      surat_pengantar: {
        ...prev.surat_pengantar,
        fileName: `Surat_Pengantar_KLK_${detailModalKlk.nim}.pdf`,
        status: 'uploaded',
        uploadedAt: dateStr,
        fileSize: '512 KB'
      }
    }));

    setModalSuratPengantarOpen(true);
  };

  const handleOpenLampiranSuratPengantar = () => {
    setModalLampiranSuratOpen(true);
  };

  const handleDownloadSuratPengantar = () => {
    if (!detailModalKlk) return;
    const thn = new Date().getFullYear();
    const content = `===============================================================
KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA
DEPARTEMEN KIMIA
Jl. Veteran, Malang 65145, Jawa Timur, Indonesia
Telepon: (0341) 575838, Email: kimia@ub.ac.id | Laman: kimia.ub.ac.id
===============================================================

Nomor   : B/1429/UN10.F09.04/KM.01.00/${thn}
Lampiran: 1 (satu) berkas
Perihal : Permohonan Izin & Surat Pengantar Kuliah Lapangan Kimia (KLK)

Kepada Yth.
Pimpinan / Direktur / HRD
${detailModalKlk.namaMitra}
di Tempat

Dengan hormat,

Sehubungan dengan kurikulum Program Studi Sarjana (S1) Kimia Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya yang mewajibkan mahasiswa menempuh mata kuliah Kuliah Lapangan Kimia (KLK) sebagai wahana aplikasi kompetensi kimia terapan dan instrumentasi laboratorium industri, dengan ini kami mengajukan permohonan izin untuk mahasiswa kami:

Nama Mahasiswa        : ${detailModalKlk.mahasiswaNama}
NIM                   : ${detailModalKlk.nim}
Program Studi         : S1 Kimia FSTeM Universitas Brawijaya
Konsentrasi / Topik   : ${detailModalKlk.bidangPekerjaan || 'Analisis Kimia & Quality Control'}
Dosen Pembimbing KLK  : ${detailModalKlk.dosenPembimbingKLK || '-'}
Beban SKS Diakui      : ${detailModalKlk.sksDiakui || 7} SKS
Rencana Periode       : ${detailModalKlk.tanggalMulai} s.d. ${detailModalKlk.tanggalSelesai}

Untuk dapat melaksanakan kegiatan Kuliah Lapangan Kimia (KLK) di instansi / perusahaan yang Bapak/Ibu pimpin sesuai dengan ketentuan dan tata tertib yang berlaku.

Besar harapan kami Bapak/Ibu dapat memberikan kesempatan kepada mahasiswa yang bersangkutan. Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.

Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Ketua Departemen Kimia FSTeM UB,

ttd & cap digital

Prof. Dr. Dra. Hermin Sulistyarti
NIP. 196307181989032001
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Surat_Pengantar_KLK_${detailModalKlk.nim}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadLampiranSurat = () => {
    if (!detailModalKlk) return;
    const thn = new Date().getFullYear();
    const content = `===============================================================
KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA
DEPARTEMEN KIMIA
===============================================================
LAMPIRAN SURAT PENGANTAR KULIAH LAPANGAN KIMIA (KLK)
Nomor Surat: B/1429/UN10.F09.04/KM.01.00/${thn}
Tanggal    : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Perihal    : Daftar Mahasiswa dan Spesifikasi Kompetensi Kegiatan KLK

I. DAFTAR MAHASISWA PESERTA KLK:
1. Nama Lengkap       : ${detailModalKlk.mahasiswaNama}
   NIM                : ${detailModalKlk.nim}
   Program Studi      : Sarjana (S1) Kimia FSTeM Universitas Brawijaya
   Total SKS Selesai  : 110 SKS (IPK: 3.72)
   Beban SKS KLK      : ${detailModalKlk.sksDiakui || 7} SKS
   Instansi Tujuan    : ${detailModalKlk.namaMitra}
   Alamat Instansi    : ${detailModalKlk.alamatMitra || '-'}
   Bidang Pekerjaan   : ${detailModalKlk.bidangPekerjaan || 'Analisis Kimia & Quality Assurance'}
   Dosen Pembimbing   : ${detailModalKlk.dosenPembimbingKLK || '-'}
   Mentor Lapangan    : ${detailModalKlk.mentorIndustri || '-'}

II. RENCANA KOMPETENSI DAN TARGET KERJA LABORATORIUM:
1. Penerapan K3 Laboratorium & Standar Manajemen Limbah B3 Kimia
2. Pengoperasian Instrumen Analisis Kimia (GC-MS, HPLC, AAS, UV-Vis)
3. Validasi Metode Analisis dan Quality Control (QC) Sampel
4. Pengolahan Data Spektroskopi dan Kromatografi
5. Pembuatan Laporan Ilmiah dan Rekomendasi Teknis Industri

III. PENGESAHAN:
Mengetahui,
Ketua Departemen Kimia FSTeM Universitas Brawijaya

( Prof. Dr. Dra. Hermin Sulistyarti )
NIP. 196307181989032001
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lampiran_Surat_Pengantar_KLK_${detailModalKlk.nim}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadLembarPenilaian = (type: 'laporan' | 'kemandirian') => {
    if (!detailModalKlk) return;
    const thn = new Date().getFullYear();
    const namaMhs = detailModalKlk.namaMahasiswa || 'Mahasiswa KLK';
    if (type === 'laporan') {
      const content = `================================================================================
DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA
LEMBAR PENILAIAN LAPORAN AKHIR PROGRAM KULIAH LAPANGAN KIMIA (KLK)
Tahun Akademik: ${thn}/${thn + 1}
================================================================================

I. IDENTITAS MAHASISWA & KEGIATAN:
1. Nama Lengkap       : ${namaMhs}
2. NIM                : ${detailModalKlk.nim}
3. Program Studi      : Sarjana (S1) Kimia FSTeM Universitas Brawijaya
4. Instansi Mitra     : ${detailModalKlk.namaMitra} (${detailModalKlk.kotaMitra})
5. Bidang Pekerjaan   : ${detailModalKlk.bidangPekerjaan || 'Analisis Kimia Terapan & QC Lab'}
6. Dosen Pembimbing   : ${detailModalKlk.dosenPembimbingKLK || '-'}
7. Beban SKS KLK      : ${detailModalKlk.sksDiakui || 7} SKS

II. PEDOMAN SKALA & PEMBOBOTAN OPSI JAWABAN:
- Tidak Tampak : Bobot 1 (Skor: 20)
- Kurang       : Bobot 2 (Skor: 40)
- Cukup        : Bobot 3 (Skor: 60)
- Baik         : Bobot 4 (Skor: 80)
- Sangat Baik  : Bobot 5 (Skor: 100)

III. BUTIR-BUTIR PERTANYAAN PENILAIAN LAPORAN AKHIR (13 BUTIR):
${DAFTAR_PERTANYAAN_LAPORAN.map(
  (q) => `${q.id}. ${q.pertanyaan}\n   [ ] Tidak Tampak (1)   [ ] Kurang (2)   [ ] Cukup (3)   [ ] Baik (4)   [ ] Sangat Baik (5)`
).join('\n\n')}

IV. PENGESAHAN PENILAIAN:
Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Dosen Pembimbing KLK,

( ${detailModalKlk.dosenPembimbingKLK || 'Dosen Pembimbing KLK'} )
Departemen Kimia FSTeM Universitas Brawijaya
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lembar_Penilaian_Laporan_KLK_${detailModalKlk.nim}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const content = `================================================================================
DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA
LEMBAR PENILAIAN MATA KULIAH 1: KEMANDIRIAN PENGAYAAN PENGETAHUAN
PROGRAM KULIAH LAPANGAN KIMIA (KLK)
Tahun Akademik: ${thn}/${thn + 1}
================================================================================

I. IDENTITAS MAHASISWA & KEGIATAN:
1. Nama Lengkap       : ${namaMhs}
2. NIM                : ${detailModalKlk.nim}
3. Program Studi      : Sarjana (S1) Kimia FSTeM Universitas Brawijaya
4. Mata Kuliah        : Mata Kuliah 1 (Kemandirian Pengayaan Pengetahuan)
5. Instansi Mitra     : ${detailModalKlk.namaMitra} (${detailModalKlk.kotaMitra})
6. Bidang Pekerjaan   : ${detailModalKlk.bidangPekerjaan || 'Analisis Kimia Terapan & QC Lab'}
7. Dosen Pembimbing   : ${detailModalKlk.dosenPembimbingKLK || '-'}
8. Beban SKS KLK      : ${detailModalKlk.sksDiakui || 7} SKS

II. PEDOMAN SKALA & PEMBOBOTAN OPSI JAWABAN:
- Tidak Tampak : Bobot 1 (Skor: 20)
- Kurang       : Bobot 2 (Skor: 40)
- Cukup        : Bobot 3 (Skor: 60)
- Baik         : Bobot 4 (Skor: 80)
- Sangat Baik  : Bobot 5 (Skor: 100)

III. BUTIR-BUTIR PERTANYAAN PENILAIAN MATA KULIAH 1 (3 BUTIR):
${DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map(
  (q) => `${q.id}. ${q.pertanyaan}\n   [ ] Tidak Tampak (1)   [ ] Kurang (2)   [ ] Cukup (3)   [ ] Baik (4)   [ ] Sangat Baik (5)`
).join('\n\n')}

IV. PENGESAHAN PENILAIAN:
Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Dosen Pembimbing KLK,

( ${detailModalKlk.dosenPembimbingKLK || 'Dosen Pembimbing KLK'} )
Departemen Kimia FSTeM Universitas Brawijaya
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lembar_Penilaian_MK1_Kemandirian_KLK_${detailModalKlk.nim}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadRekapNilai = (type: 'laporan' | 'kemandirian') => {
    if (!detailModalKlk) return;
    const namaMhs = detailModalKlk.namaMahasiswa || 'Mahasiswa KLK';
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (type === 'laporan') {
      const skor = calculateTotalSkorLaporan(nilaiLaporanData.answers);
      const huruf = getGradeHuruf(skor);

      const wb = XLSX.utils.book_new();
      const rows: (string | number)[][] = [
        ['REKAPITULASI HASIL PENILAIAN DOSEN PEMBIMBING KLK'],
        ['LAPORAN AKHIR PROGRAM KULIAH LAPANGAN KIMIA (KLK) - 13 BUTIR PENILAIAN'],
        ['DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA'],
        [],
        ['I. IDENTITAS KEGIATAN'],
        ['Nama Mahasiswa', namaMhs],
        ['NIM', detailModalKlk.nim],
        ['Instansi Mitra', `${detailModalKlk.namaMitra} (${detailModalKlk.kotaMitra})`],
        ['Dosen Pembimbing KLK', detailModalKlk.dosenPembimbingKLK || '-'],
        ['Tanggal Penilaian', nilaiLaporanData.updatedAt || new Date().toISOString().slice(0, 10)],
        [],
        ['II. RINCIAN 13 BUTIR PENILAIAN LAPORAN'],
        ['No', 'Butir Evaluasi / Kriteria Penilaian', 'Kategori Jawaban', 'Bobot (1-5)', 'Skor Terkonversi (0-100)']
      ];

      DAFTAR_PERTANYAAN_LAPORAN.forEach((q) => {
        const bobot = nilaiLaporanData.answers[q.id] ?? 4;
        const opt = OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) || OPSI_BOBOT_JAWABAN[3];
        rows.push([q.id, q.pertanyaan, opt.label, opt.bobot, opt.skor]);
      });

      rows.push([]);
      rows.push(['III. HASIL EVALUASI AKHIR']);
      rows.push(['Total Skor Akhir Laporan', `${skor} / 100`]);
      rows.push(['Nilai Mutu (Huruf)', huruf]);
      rows.push(['Status Validasi', 'Sah & Tervalidasi Resmi oleh Dosen Pembimbing KLK']);
      rows.push(['Catatan & Feedback Evaluasi Dosen', nilaiLaporanData.catatan || '-']);
      rows.push([]);
      rows.push([`Malang, ${tanggalCetak}`]);
      rows.push(['Dosen Pembimbing KLK,']);
      rows.push([]);
      rows.push([]);
      rows.push([detailModalKlk.dosenPembimbingKLK || 'Dosen Pembimbing KLK']);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 6 }, { wch: 65 }, { wch: 22 }, { wch: 14 }, { wch: 26 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Laporan');
      XLSX.writeFile(wb, `Rekap_Nilai_Laporan_KLK_${detailModalKlk.nim}.xlsx`);
    } else {
      const skor = calculateTotalSkorKemandirian(nilaiKemandirianData.answers);
      const huruf = getGradeHuruf(skor);

      const wb = XLSX.utils.book_new();
      const rows: (string | number)[][] = [
        ['REKAPITULASI HASIL PENILAIAN DOSEN PEMBIMBING KLK'],
        ['MATA KULIAH 1: KEMANDIRIAN PENGAYAAN PENGETAHUAN'],
        ['DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA'],
        [],
        ['I. IDENTITAS KEGIATAN'],
        ['Mata Kuliah', 'Kemandirian Pengayaan Pengetahuan'],
        ['Nama Mahasiswa', namaMhs],
        ['NIM', detailModalKlk.nim],
        ['Instansi Mitra', `${detailModalKlk.namaMitra} (${detailModalKlk.kotaMitra})`],
        ['Dosen Pembimbing KLK', detailModalKlk.dosenPembimbingKLK || '-'],
        ['Tanggal Penilaian', nilaiKemandirianData.updatedAt || new Date().toISOString().slice(0, 10)],
        [],
        ['II. RINCIAN PEROLEHAN BUTIR EVALUASI MATA KULIAH 1'],
        ['No', 'Butir Evaluasi / Kriteria Penilaian', 'Kategori Jawaban', 'Bobot (1-5)', 'Skor Terkonversi (0-100)']
      ];

      DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.forEach((q) => {
        const bobot = nilaiKemandirianData.answers[q.id] ?? 4;
        const opt = OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) || OPSI_BOBOT_JAWABAN[3];
        rows.push([q.id, q.pertanyaan, opt.label, opt.bobot, opt.skor]);
      });

      rows.push([]);
      rows.push(['III. HASIL EVALUASI AKHIR']);
      rows.push(['Total Skor Akhir Kemandirian', `${skor} / 100`]);
      rows.push(['Nilai Mutu (Huruf)', huruf]);
      rows.push(['Status Validasi', 'Sah & Tervalidasi Resmi oleh Dosen Pembimbing KLK']);
      rows.push(['Catatan & Feedback Evaluasi Dosen', nilaiKemandirianData.catatan || '-']);
      rows.push([]);
      rows.push([`Malang, ${tanggalCetak}`]);
      rows.push(['Dosen Pembimbing KLK,']);
      rows.push([]);
      rows.push([]);
      rows.push([detailModalKlk.dosenPembimbingKLK || 'Dosen Pembimbing KLK']);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 6 }, { wch: 65 }, { wch: 22 }, { wch: 14 }, { wch: 26 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kemandirian');
      XLSX.writeFile(wb, `Rekap_Nilai_MK1_Kemandirian_KLK_${detailModalKlk.nim}.xlsx`);
    }
  };

  const handleOpenDetailPenilai = (type: 'dosen' | 'lapangan') => {
    if (!detailModalKlk) return;
    if (type === 'dosen') {
      setModalNilaiDosenOpen(true);
      setActiveNilaiDosenSection(null);
    } else {
      setModalNilaiPembimbingLapangOpen(true);
      setActiveTabLapang('semua');
    }
  };

  const handleDownloadLembarPenilaianLapang = async (type: 'laporan' | 'kemandirian') => {
    if (!detailModalKlk) return;
    const thn = new Date().getFullYear();
    const namaMhs = detailModalKlk.namaMahasiswa || 'Mahasiswa KLK';
    const namaMentor = detailModalKlk.mentorIndustri || 'Pembimbing Lapangan';
    const instansiMitra = detailModalKlk.namaMitra || 'Instansi Mitra / Industri';

    try {
      if (type === 'laporan') {
        const filename = `Lembar_Penilaian_Lapang_Laporan_${detailModalKlk.nim}.docx`;

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
                      size: 20,
                      color: '333333'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA',
                      bold: true,
                      size: 24,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'DEPARTEMEN KIMIA',
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
                      text: 'Gedung Kimia, Jl. Veteran, Malang 65145 | Telp: (0341) 575838 | Email: kimia@ub.ac.id',
                      size: 18,
                      color: '666666'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150, before: 50 },
                  children: [
                    new TextRun({
                      text: '════════════════════════════════════════════════════════════════════════════════',
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'LEMBAR PENILAIAN PEMBIMBING LAPANG KLK',
                      bold: true,
                      size: 22,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KOMPONEN: LAPORAN AKHIR PROGRAM KULIAH LAPANGAN KIMIA (KLK)',
                      bold: true,
                      size: 20,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150 },
                  children: [
                    new TextRun({
                      text: `Kerjasama Mitra: ${instansiMitra.toUpperCase()} | Tahun Akademik: ${thn}/${thn + 1}`,
                      italics: true,
                      size: 18,
                      color: '555555'
                    })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 100, after: 60 },
                  children: [
                    new TextRun({ text: 'I. IDENTITAS MAHASISWA & INSTANSI MITRA:\n', bold: true }),
                    new TextRun({ text: `1. Nama Lengkap Mahasiswa   : ${namaMhs}\n` }),
                    new TextRun({ text: `2. NIM                      : ${detailModalKlk.nim}\n` }),
                    new TextRun({ text: `3. Program Studi            : S1 Kimia FSTeM Universitas Brawijaya\n` }),
                    new TextRun({ text: `4. Instansi / Mitra KLK     : ${instansiMitra} (${detailModalKlk.kotaMitra || 'Jawa Timur'})\n` }),
                    new TextRun({ text: `5. Bidang / Topik Pekerjaan : ${detailModalKlk.bidangPekerjaan || 'Praktik Kimia Industri & Analisis Laboratorium'}\n` }),
                    new TextRun({ text: `6. Pembimbing Lapangan      : ${namaMentor}\n` }),
                    new TextRun({ text: `7. Bobot Penilaian Komponen : 40% Kinerja Lapangan` })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 100, after: 60 },
                  children: [
                    new TextRun({ text: 'II. PEDOMAN SKALA PENILAIAN (SKALA LIKERT 1 - 5):\n', bold: true }),
                    new TextRun({ text: '1 = Tidak Tampak (Skor 20)  |  2 = Kurang (Skor 40)  |  3 = Cukup (Skor 60)  |  4 = Baik (Skor 80)  |  5 = Sangat Baik (Skor 100)' })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 120, after: 80 },
                  children: [
                    new TextRun({
                      text: 'III. BUTIR EVALUASI PENILAIAN LAPORAN AKHIR OLEH PEMBIMBING LAPANG (13 BUTIR):',
                      bold: true,
                      size: 20,
                      color: '002B49'
                    })
                  ]
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No.', bold: true })] })] }),
                        new TableCell({ width: { size: 54, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Butir Penilaian / Indikator Capaian Kinerja', bold: true })] })] }),
                        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Skala Nilai (1 - 5)', bold: true })] })] }),
                        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Catatan', bold: true })] })] }),
                      ]
                    }),
                    ...DAFTAR_PERTANYAAN_LAPORAN.map((q) =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.id}` })] })] }),
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: q.pertanyaan })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ ]1  [ ]2  [ ]3  [ ]4  [ ]5' })] })] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                        ]
                      })
                    )
                  ]
                }),
                new Paragraph({
                  spacing: { before: 200, after: 80 },
                  children: [
                    new TextRun({ text: `${detailModalKlk.kotaMitra || 'Malang'}, ____________________ ${thn}\n` }),
                    new TextRun({ text: 'Pembimbing Lapang KLK / Mitra Industri,\n\n\n\n\n' }),
                    new TextRun({ text: `( ${namaMentor} )\n`, bold: true }),
                    new TextRun({ text: `${instansiMitra}` })
                  ]
                })
              ]
            }
          ]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastNilaiLapang(`Berhasil mengunduh ${filename}`);
        setTimeout(() => setToastNilaiLapang(null), 4000);
      } else {
        const filename = `Lembar_Penilaian_Lapang_Kemandirian_${detailModalKlk.nim}.docx`;

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
                      size: 20,
                      color: '333333'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA - DEPARTEMEN KIMIA',
                      bold: true,
                      size: 24,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150, before: 50 },
                  children: [
                    new TextRun({
                      text: '════════════════════════════════════════════════════════════════════════════════',
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'LEMBAR PENILAIAN PEMBIMBING LAPANG KLK',
                      bold: true,
                      size: 22,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KOMPONEN: KEMANDIRIAN PENGAYAAN PENGETAHUAN',
                      bold: true,
                      size: 20,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150 },
                  children: [
                    new TextRun({
                      text: `Kerjasama Mitra: ${instansiMitra.toUpperCase()} | Tahun Akademik: ${thn}/${thn + 1}`,
                      italics: true,
                      size: 18,
                      color: '555555'
                    })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 100, after: 60 },
                  children: [
                    new TextRun({ text: 'I. IDENTITAS MAHASISWA & INSTANSI MITRA:\n', bold: true }),
                    new TextRun({ text: `1. Nama Lengkap Mahasiswa   : ${namaMhs}\n` }),
                    new TextRun({ text: `2. NIM                      : ${detailModalKlk.nim}\n` }),
                    new TextRun({ text: `3. Program Studi            : S1 Kimia FSTeM Universitas Brawijaya\n` }),
                    new TextRun({ text: `4. Instansi / Mitra KLK     : ${instansiMitra} (${detailModalKlk.kotaMitra || 'Jawa Timur'})\n` }),
                    new TextRun({ text: `5. Pembimbing Lapangan      : ${namaMentor}\n` }),
                    new TextRun({ text: `6. Bobot Penilaian Komponen : 40% Kinerja Lapangan` })
                  ]
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No.', bold: true })] })] }),
                        new TableCell({ width: { size: 54, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Butir Penilaian Kemandirian', bold: true })] })] }),
                        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Skala Nilai (1 - 5)', bold: true })] })] }),
                        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Catatan', bold: true })] })] }),
                      ]
                    }),
                    ...DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.id}` })] })] }),
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: q.pertanyaan })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ ]1  [ ]2  [ ]3  [ ]4  [ ]5' })] })] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                        ]
                      })
                    )
                  ]
                }),
                new Paragraph({
                  spacing: { before: 200, after: 80 },
                  children: [
                    new TextRun({ text: `${detailModalKlk.kotaMitra || 'Malang'}, ____________________ ${thn}\n` }),
                    new TextRun({ text: 'Pembimbing Lapang KLK / Mitra Industri,\n\n\n\n\n' }),
                    new TextRun({ text: `( ${namaMentor} )\n`, bold: true }),
                    new TextRun({ text: `${instansiMitra}` })
                  ]
                })
              ]
            }
          ]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastNilaiLapang(`Berhasil mengunduh ${filename}`);
        setTimeout(() => setToastNilaiLapang(null), 4000);
      }
    } catch (err) {
      console.error('Gagal mengunduh lembar penilaian .docx:', err);
      setToastNilaiLapang('Gagal mengunduh berkas .docx.');
    }
  };

  const handleDownloadRekapNilaiLapang = (type: 'laporan' | 'kemandirian') => {
    if (!detailModalKlk) return;
    const namaMhs = detailModalKlk.namaMahasiswa || 'Mahasiswa KLK';
    const namaMentor = detailModalKlk.mentorIndustri || 'Pembimbing Lapangan';
    const instansiMitra = detailModalKlk.namaMitra || 'Instansi Mitra / Industri';
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (type === 'laporan') {
      const skor = calculateTotalSkorLaporan(nilaiLaporanLapangData.answers);
      const huruf = getGradeHuruf(skor);

      const wb = XLSX.utils.book_new();
      const rows: (string | number)[][] = [
        ['REKAPITULASI RESMI PENILAIAN PEMBIMBING LAPANGAN KLK'],
        ['KOMPONEN: LAPORAN AKHIR PROGRAM KULIAH LAPANGAN KIMIA (KLK) - 13 BUTIR PENILAIAN'],
        ['DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA'],
        [],
        ['I. IDENTITAS KEGIATAN & PEMBIMBING'],
        ['Nama Mahasiswa', namaMhs],
        ['NIM', detailModalKlk.nim],
        ['Instansi Mitra / Industri', `${instansiMitra} (${detailModalKlk.kotaMitra})`],
        ['Pembimbing Lapangan', namaMentor],
        ['Tanggal Pengesahan', nilaiLaporanLapangData.updatedAt || new Date().toISOString().slice(0, 10)],
        [],
        ['II. RINCIAN 13 BUTIR EVALUASI LAPORAN'],
        ['No', 'Butir Evaluasi / Kriteria Penilaian', 'Skor Jawaban', 'Bobot (1-5)', 'Skor Terkonversi (0-100)']
      ];

      DAFTAR_PERTANYAAN_LAPORAN.forEach((q) => {
        const bobot = nilaiLaporanLapangData.answers[q.id] ?? 4;
        const opt = OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) || OPSI_BOBOT_JAWABAN[3];
        rows.push([q.id, q.pertanyaan, opt.label, opt.bobot, opt.skor]);
      });

      rows.push([]);
      rows.push(['III. HASIL EVALUASI PEMBIMBING LAPANGAN']);
      rows.push(['Total Skor Laporan Akhir', `${skor} / 100`]);
      rows.push(['Nilai Mutu (Huruf)', huruf]);
      rows.push(['Status Verifikasi', 'Sah & Tervalidasi Resmi oleh Pembimbing Lapangan Mitra']);
      rows.push(['Catatan & Feedback Pembimbing', nilaiLaporanLapangData.catatan || '-']);
      rows.push([]);
      rows.push([`${detailModalKlk.kotaMitra || 'Malang'}, ${tanggalCetak}`]);
      rows.push(['Pembimbing Lapangan KLK,']);
      rows.push([]);
      rows.push([]);
      rows.push([namaMentor]);
      rows.push([instansiMitra]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 6 }, { wch: 65 }, { wch: 22 }, { wch: 14 }, { wch: 26 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Lapang Laporan');
      XLSX.writeFile(wb, `Rekap_Nilai_Lapang_Laporan_${detailModalKlk.nim}.xlsx`);
    } else {
      const skor = calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers);
      const huruf = getGradeHuruf(skor);

      const wb = XLSX.utils.book_new();
      const rows: (string | number)[][] = [
        ['REKAPITULASI RESMI PENILAIAN PEMBIMBING LAPANGAN KLK'],
        ['KOMPONEN: MATA KULIAH 1 (KEMANDIRIAN PENGAYAAN PENGETAHUAN)'],
        ['DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA'],
        [],
        ['I. IDENTITAS KEGIATAN & PEMBIMBING'],
        ['Komponen Penilaian', 'Kemandirian Pengayaan Pengetahuan'],
        ['Nama Mahasiswa', namaMhs],
        ['NIM', detailModalKlk.nim],
        ['Instansi Mitra / Industri', `${instansiMitra} (${detailModalKlk.kotaMitra})`],
        ['Pembimbing Lapangan', namaMentor],
        ['Tanggal Pengesahan', nilaiKemandirianLapangData.updatedAt || new Date().toISOString().slice(0, 10)],
        [],
        ['II. RINCIAN PEROLEHAN BUTIR EVALUASI KEMANDIRIAN'],
        ['No', 'Butir Evaluasi / Kriteria Penilaian', 'Skor Jawaban', 'Bobot (1-5)', 'Skor Terkonversi (0-100)']
      ];

      DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.forEach((q) => {
        const bobot = nilaiKemandirianLapangData.answers[q.id] ?? 4;
        const opt = OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) || OPSI_BOBOT_JAWABAN[3];
        rows.push([q.id, q.pertanyaan, opt.label, opt.bobot, opt.skor]);
      });

      rows.push([]);
      rows.push(['III. HASIL EVALUASI PEMBIMBING LAPANGAN']);
      rows.push(['Total Skor Kemandirian', `${skor} / 100`]);
      rows.push(['Nilai Mutu (Huruf)', huruf]);
      rows.push(['Status Verifikasi', 'Sah & Tervalidasi Resmi oleh Pembimbing Lapangan Mitra']);
      rows.push(['Catatan & Feedback Pembimbing', nilaiKemandirianLapangData.catatan || '-']);
      rows.push([]);
      rows.push([`${detailModalKlk.kotaMitra || 'Malang'}, ${tanggalCetak}`]);
      rows.push(['Pembimbing Lapangan KLK,']);
      rows.push([]);
      rows.push([]);
      rows.push([namaMentor]);
      rows.push([instansiMitra]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 6 }, { wch: 65 }, { wch: 22 }, { wch: 14 }, { wch: 26 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Lapang Kemandirian');
      XLSX.writeFile(wb, `Rekap_Nilai_Lapang_Kemandirian_${detailModalKlk.nim}.xlsx`);
    }
  };

  const handleSimpanNilaiLapang = (type: 'laporan' | 'kemandirian') => {
    if (!detailModalKlk) return;
    const dateNow = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (type === 'laporan') {
      setNilaiLaporanLapangData((prev) => ({
        ...prev,
        isSaved: true,
        updatedAt: dateNow
      }));
    } else {
      setNilaiKemandirianLapangData((prev) => ({
        ...prev,
        isSaved: true,
        updatedAt: dateNow
      }));
    }

    const skorLaporan = calculateTotalSkorLaporan(nilaiLaporanLapangData.answers);
    const skorKemandirian = calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers);
    const avgScore = Math.round((skorLaporan + skorKemandirian) / 2);
    const gradeHuruf = getGradeHuruf(avgScore);

    setDetailModalKlk((prev) =>
      prev
        ? {
            ...prev,
            nilaiIndustri: avgScore,
            nilaiAkhirHuruf: gradeHuruf,
            status: 'Selesai & Dinilai'
          }
        : null
    );

    onSimpanNilai(
      detailModalKlk.id,
      avgScore,
      detailModalKlk.nilaiDosen || 88,
      gradeHuruf
    );

    setToastNilaiLapang(
      `Nilai Pembimbing Lapang KLK (${
        type === 'laporan' ? 'Laporan Akhir Program' : 'Kemandirian Pengayaan Pengetahuan'
      }) berhasil disimpan dan disahkan ke sistem!`
    );
    setTimeout(() => setToastNilaiLapang(null), 5000);
  };

  const handleUploadFilePenilaianLapang = (
    type: 'laporan' | 'kemandirian',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setBerkasFileLapangData((prev) => ({
      ...prev,
      [type]: {
        fileName: file.name,
        fileSize: formattedSize,
        uploadDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        status: 'Tervalidasi Digital'
      }
    }));
    setToastNilaiLapang(
      `Berkas Penilaian ${
        type === 'laporan' ? 'Laporan Akhir Program' : 'Kemandiriaan Pengayaan Pengetahuan'
      } berhasil diperbarui!`
    );
    setTimeout(() => setToastNilaiLapang(null), 4000);
  };

  const handleDownloadFilePenilaianLapang = (type: 'laporan' | 'kemandirian') => {
    if (!detailModalKlk) return;
    const namaMhs = detailModalKlk.namaMahasiswa || 'Mahasiswa KLK';
    const namaMentor = detailModalKlk.mentorIndustri || 'Pembimbing Lapangan';
    const instansiMitra = detailModalKlk.namaMitra || 'Instansi Mitra / Industri';
    const fileInfo = berkasFileLapangData[type];
    const skor =
      type === 'laporan'
        ? calculateTotalSkorLaporan(nilaiLaporanLapangData.answers)
        : calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers);
    const huruf = getGradeHuruf(skor);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const content = `================================================================================
DOKUMEN FILE PENILAIAN RESMI PEMBIMBING LAPANG KLK
DEPARTEMEN KIMIA - FAKULTAS MIPA - UNIVERSITAS BRAWIJAYA
KERJASAMA MITRA INDUSTRI: ${instansiMitra.toUpperCase()}
================================================================================

I. IDENTITAS MAHASISWA & MITRA:
Nama Mahasiswa       : ${namaMhs}
NIM                  : ${detailModalKlk.nim}
Program Studi        : Sarjana (S1) Kimia FSTeM Universitas Brawijaya
Komponen Penilaian   : ${type === 'laporan' ? 'Laporan Akhir Program KLK' : 'Kemandiriaan Pengayaan Pengetahuan'}
Instansi Mitra       : ${instansiMitra} (${detailModalKlk.kotaMitra})
Bidang Pekerjaan     : ${detailModalKlk.bidangPekerjaan || 'Praktik Kimia Industri & Laboratorium'}
Pembimbing Lapangan  : ${namaMentor}

II. STATUS DAN INFORMASI BERKAS PENILAIAN:
Nama File Dokumen    : ${fileInfo.fileName}
Ukuran Berkas        : ${fileInfo.fileSize}
Tanggal Pengesahan   : ${fileInfo.uploadDate}
Status Keabsahan     : ${fileInfo.status} (Ditandatangani secara elektronik/resmi)

III. RINGKASAN HASIL EVALUASI LAPANGAN:
Nilai Total Angka    : ${skor} / 100
Nilai Huruf Mutu     : ${huruf}
Predikat Capaian     : ${skor >= 80 ? 'Sangat Baik' : skor >= 70 ? 'Baik' : 'Cukup'}

Catatan & Rekomendasi Mentor Industri:
"${type === 'laporan' ? nilaiLaporanLapangData.catatan : nilaiKemandirianLapangData.catatan}"

IV. PENGESAHAN:
${detailModalKlk.kotaMitra || 'Malang'}, ${dateStr}
Pembimbing Lapangan Mitra,

[ STEMPEL & TANDA TANGAN DIGITAL MITRA TERVERIFIKASI ]
( ${namaMentor} )
${instansiMitra}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `File_Penilaian_${type === 'laporan' ? 'Laporan_Akhir' : 'Kemandirian'}_${detailModalKlk.nim}.txt`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateLinkPembimbing = () => {
    if (!detailModalKlk) return;
    const token = `KLK-${detailModalKlk.nim}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const url = `https://sikma.kimia.ub.ac.id/evaluasi-mitra?token=${token}&nim=${detailModalKlk.nim}&mitra=${encodeURIComponent(detailModalKlk.namaMitra)}`;
    setLinkPembimbingLapangan(url);
    setModalGenerateLinkOpen(true);
    setLinkCopiedAlert(false);
  };

  const handleCopyLinkPembimbing = () => {
    if (!linkPembimbingLapangan) return;
    navigator.clipboard.writeText(linkPembimbingLapangan);
    setLinkCopiedAlert(true);
    setTimeout(() => setLinkCopiedAlert(false), 3000);
  };

  const handleDownloadAlurKlk = () => {
    const content = `================================================================================
ALUR PROSEDUR PELAKSANAAN KLK (KEGIATAN MAHASISWA DI LUAR KAMPUS)
DEPARTEMEN KIMIA FAKULTAS MIPA UNIVERSITAS BRAWIJAYA
================================================================================

Berikut merupakan 22 tahapan resmi alur pelaksanaan Kuliah Luar Kampus (KLK):

${DAFTAR_ALUR_KLK.map(
  (item) =>
    `[LANGKAH ${item.no < 10 ? '0' + item.no : item.no}] - Pelaksana: ${item.pelaksana.toUpperCase()}
Tahap      : ${item.tahap}
Alur Resmi : ${item.deskripsi}
Keterangan : ${item.keterangan || '-'}
`
).join('\n')}
================================================================================
Total Langkah : 22 Tahapan Prosedural
Pelaksana     : Mahasiswa (15 langkah), Admin (5 langkah), Dosen (2 langkah)
Dicetak melalui Sistem Informasi Akademik & KLK Kimia UB (SIKMA).
Tanggal Unduh : ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Alur_Prosedur_Pelaksanaan_KLK_Kimia_UB.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredAlurKlk = DAFTAR_ALUR_KLK.filter((item) => {
    const matchesAktor = filterAktorAlur === 'Semua' || item.pelaksana === filterAktorAlur;
    const query = searchQueryAlur.trim().toLowerCase();
    if (!query) return matchesAktor;
    const matchesSearch =
      item.deskripsi.toLowerCase().includes(query) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(query)) ||
      item.tahap.toLowerCase().includes(query) ||
      item.pelaksana.toLowerCase().includes(query) ||
      item.no.toString().includes(query);
    return matchesAktor && matchesSearch;
  });

  // Helper perhitungan nilai per mata kuliah konversi untuk Rekap Nilai
  const calculateScoreForMk = (
    item: PengajuanKLK,
    mkName: string
  ): { angka: number; huruf: 'A' | 'B+' | 'B' | 'C+' | 'C' } => {
    const baseScore =
      item.nilaiDosen && item.nilaiIndustri
        ? Math.round(item.nilaiDosen * 0.6 + item.nilaiIndustri * 0.4)
        : item.nilaiDosen || item.nilaiIndustri || 84;

    let offset = 0;
    const nimNum = parseInt(item.nim.slice(-2) || '0', 10);
    switch (mkName) {
      case 'KLK':
        offset = 0;
        break;
      case 'Sumber Daya Alam':
        offset = (nimNum % 3) - 1;
        break;
      case 'Keselamatan dan Lingkungan':
        offset = ((nimNum + 1) % 4) - 1;
        break;
      case 'Metode dan Terapan':
        offset = ((nimNum + 2) % 3) - 1;
        break;
      case 'Analisis Penilaian Tindakan':
        offset = (nimNum % 4) - 2;
        break;
      case 'Kemandirian Pengayaan Pengetahuan':
        offset = ((nimNum + 3) % 4) - 1;
        break;
      default:
        offset = 0;
    }

    const finalAngka = Math.min(100, Math.max(50, baseScore + offset));
    let huruf: 'A' | 'B+' | 'B' | 'C+' | 'C' = 'B';
    if (finalAngka >= 80) huruf = 'A';
    else if (finalAngka >= 75) huruf = 'B+';
    else if (finalAngka >= 70) huruf = 'B';
    else if (finalAngka >= 60) huruf = 'C+';
    else huruf = 'C';

    return { angka: finalAngka, huruf };
  };

  const filteredRekapList = roleScopedKlkList.filter((item) => {
    const matchSemester =
      rekapFilterSemester === 'Semua' ||
      item.namaSemester === rekapFilterSemester ||
      (item.namaSemester &&
        item.namaSemester.toLowerCase().includes(rekapFilterSemester.toLowerCase()));

    const query = rekapSearchMhs.trim().toLowerCase();
    const matchSearch =
      !query ||
      item.mahasiswaNama.toLowerCase().includes(query) ||
      item.nim.toLowerCase().includes(query) ||
      item.namaMitra.toLowerCase().includes(query) ||
      (item.dosenPembimbingKLK && item.dosenPembimbingKLK.toLowerCase().includes(query));

    return matchSemester && matchSearch;
  });

  const handleDownloadRekapNilaiTable = () => {
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const isAllMk = rekapFilterJenis === 'Semua (KLK dan MK Konversi)';

    const rows: (string | number)[][] = [
      ['REKAPITULASI HASIL PENILAIAN KLK & MATA KULIAH KONVERSI'],
      ['DEPARTEMEN KIMIA FAKULTAS MIPA UNIVERSITAS BRAWIJAYA'],
      [],
      ['Jenis Penilaian:', rekapFilterJenis],
      ['Semester:', rekapFilterSemester === 'Semua' ? 'Semua Semester' : rekapFilterSemester],
      ['Total Mahasiswa:', `${filteredRekapList.length} Mahasiswa Terdata`],
      ['Tanggal Unduh:', tanggalCetak],
      ['Standar Kelulusan:', 'Minimal Nilai B (>= 70)'],
      []
    ];

    if (isAllMk) {
      rows.push([
        'No',
        'NIM',
        'Nama Mahasiswa',
        'Semester',
        'SKS Diakui',
        'Mitra Instansi',
        'Dosen Pembimbing KLK',
        'KLK (Angka)',
        'KLK (Huruf)',
        'SDA (Angka)',
        'SDA (Huruf)',
        'K3L (Angka)',
        'K3L (Huruf)',
        'Metode (Angka)',
        'Metode (Huruf)',
        'APT (Angka)',
        'APT (Huruf)',
        'Kemandirian (Angka)',
        'Kemandirian (Huruf)',
        'Rata-rata Nilai',
        'Nilai Akhir Huruf',
        'Status KLK'
      ]);

      filteredRekapList.forEach((m, idx) => {
        const pkl = calculateScoreForMk(m, 'KLK');
        const sda = calculateScoreForMk(m, 'Sumber Daya Alam');
        const k3l = calculateScoreForMk(m, 'Keselamatan dan Lingkungan');
        const met = calculateScoreForMk(m, 'Metode dan Terapan');
        const apt = calculateScoreForMk(m, 'Analisis Penilaian Tindakan');
        const kpp = calculateScoreForMk(m, 'Kemandirian Pengayaan Pengetahuan');
        const avg = Math.round(
          (pkl.angka + sda.angka + k3l.angka + met.angka + apt.angka + kpp.angka) / 6
        );
        const finalHuruf =
          m.nilaiAkhirHuruf || (avg >= 80 ? 'A' : avg >= 75 ? 'B+' : 'B');

        rows.push([
          idx + 1,
          m.nim,
          m.mahasiswaNama,
          m.namaSemester || 'Genap 2025/2026',
          m.sksDiakui,
          m.namaMitra,
          m.dosenPembimbingKLK || '-',
          pkl.angka,
          pkl.huruf,
          sda.angka,
          sda.huruf,
          k3l.angka,
          k3l.huruf,
          met.angka,
          met.huruf,
          apt.angka,
          apt.huruf,
          kpp.angka,
          kpp.huruf,
          avg,
          finalHuruf,
          m.status
        ]);
      });
    } else {
      rows.push([
        'No',
        'NIM',
        'Nama Mahasiswa',
        'Semester',
        'Mitra Instansi',
        'Bidang Pekerjaan',
        'Dosen Pembimbing KLK',
        'SKS Diakui',
        'Mata Kuliah',
        'Nilai Angka',
        'Nilai Huruf',
        'Keterangan',
        'Status KLK'
      ]);

      filteredRekapList.forEach((m, idx) => {
        const score = calculateScoreForMk(m, rekapFilterJenis);
        const keterangan =
          score.huruf === 'A'
            ? 'Lulus Sangat Baik'
            : score.huruf === 'B+'
            ? 'Lulus Baik Sekali'
            : 'Lulus Baik';

        rows.push([
          idx + 1,
          m.nim,
          m.mahasiswaNama,
          m.namaSemester || 'Genap 2025/2026',
          m.namaMitra,
          m.bidangPekerjaan || 'Praktik Industri',
          m.dosenPembimbingKLK || '-',
          m.sksDiakui,
          rekapFilterJenis,
          score.angka,
          score.huruf,
          keterangan,
          m.status
        ]);
      });
    }

    rows.push([]);
    rows.push(['Keterangan Standar Nilai FSTeM Universitas Brawijaya:']);
    rows.push(['- Nilai A  : >= 80 (Sangat Baik / Lulus)']);
    rows.push(['- Nilai B+ : 75 - 79 (Baik Sekali / Lulus)']);
    rows.push(['- Nilai B  : 70 - 74 (Baik / Lulus)']);
    rows.push(['- Nilai C+ : 60 - 69 (Cukup Baik / Lulus Bersyarat)']);
    rows.push(['- Nilai C  : 55 - 59 (Cukup)']);
    rows.push([]);
    rows.push([`Malang, ${tanggalCetak}`]);
    rows.push(['Ketua Komisi KLK Departemen Kimia FSTeM Universitas Brawijaya']);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    if (isAllMk) {
      ws['!cols'] = [
        { wch: 5 },
        { wch: 16 },
        { wch: 28 },
        { wch: 18 },
        { wch: 12 },
        { wch: 25 },
        { wch: 28 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 16 },
        { wch: 20 }
      ];
    } else {
      ws['!cols'] = [
        { wch: 5 },
        { wch: 16 },
        { wch: 28 },
        { wch: 18 },
        { wch: 25 },
        { wch: 25 },
        { wch: 28 },
        { wch: 12 },
        { wch: 24 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 }
      ];
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai KLK');

    const sanitizedJenis = rekapFilterJenis.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Rekap_Nilai_KLK_${sanitizedJenis}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleOpenDetailModal = (item: PengajuanKLK) => {
    setDetailModalKlk(item);
    setModalTglUjian(item.tanggalUjian || '');
    setModalPukulUjian(item.pukulUjian || '');
    setModalRuangUjian(item.ruangUjian || '');
    setIsEditingUjianInModal(false);
    setModalSaveSuccess(false);

    setIsSksMenuOpen(false);
    const validSksList = [3, 7, 10, 13, 16];
    const initialSks = validSksList.includes(item.sksDiakui) ? item.sksDiakui : 7;
    setSelectedSksChoice(initialSks);

    setIsEditingNilaiInModal(false);
    setModalNilaiIndustri(item.nilaiIndustri || 85);
    setModalNilaiDosen(item.nilaiDosen || 88);
    setModalNilaiHuruf(item.nilaiAkhirHuruf || 'A');
  };

  const handleDownloadDoc = async (docType: 'daftar_hadir' | 'kartu_bimbingan' | 'berita_acara') => {
    if (!detailModalKlk) return;

    setDownloadingDocType(docType);

    const mhsName = detailModalKlk.mahasiswaNama;
    const nim = detailModalKlk.nim;
    const mitra = detailModalKlk.namaMitra;
    const pembimbing = detailModalKlk.dosenPembimbingKLK;
    const periode = `${detailModalKlk.tanggalMulai} s.d. ${detailModalKlk.tanggalSelesai}`;
    const thn = new Date().getFullYear();

    try {
      if (docType === 'daftar_hadir') {
        const filename = `Template_Daftar_Hadir_KLK_${nim}.docx`;

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
                      size: 20,
                      color: '333333'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA',
                      bold: true,
                      size: 24,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'DEPARTEMEN KIMIA',
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
                      text: 'Gedung Kimia, Jl. Veteran, Malang 65145 | Telp: (0341) 575838 | Email: kimia@ub.ac.id',
                      size: 18,
                      color: '666666'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150, before: 50 },
                  children: [
                    new TextRun({
                      text: '════════════════════════════════════════════════════════════════════════════════',
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'DAFTAR HADIR HARIAN KEGIATAN KULIAH LAPANGAN KIMIA (KLK)',
                      bold: true,
                      size: 22,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150 },
                  children: [
                    new TextRun({
                      text: `Semester / Tahun Akademik: ${detailModalKlk.namaSemester || 'Genap 2025/2026'}`,
                      italics: true,
                      size: 18,
                      color: '555555'
                    })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 100, after: 60 },
                  children: [
                    new TextRun({ text: `Nama Mahasiswa        : ${mhsName}\n`, bold: true }),
                    new TextRun({ text: `NIM                   : ${nim}\n` }),
                    new TextRun({ text: `Program Studi         : S1 Kimia FSTeM Universitas Brawijaya\n` }),
                    new TextRun({ text: `Instansi / Mitra KLK  : ${mitra}\n` }),
                    new TextRun({ text: `Periode Pelaksanaan   : ${periode}\n` }),
                    new TextRun({ text: `Dosen Pembimbing KLK  : ${pembimbing}\n` }),
                    new TextRun({ text: `Pembimbing Lapangan   : ${detailModalKlk.mentorIndustri || 'Pembimbing Lapangan / Mitra Industri'}` })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 120, after: 80 },
                  children: [
                    new TextRun({
                      text: 'TABEL PRESENSI KEGIATAN KERJA LAPANGAN KIMIA:',
                      bold: true,
                      size: 20,
                      color: '002B49'
                    })
                  ]
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No.', bold: true })] })] }),
                        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Hari / Tanggal', bold: true })] })] }),
                        new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Jam Datang', bold: true })] })] }),
                        new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Jam Pulang', bold: true })] })] }),
                        new TableCell({ width: { size: 36, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Uraian Aktivitas / Pekerjaan Kimia Industri', bold: true })] })] }),
                        new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Paraf Mentor', bold: true })] })] }),
                      ]
                    }),
                    ...Array.from({ length: 12 }).map((_, idx) =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}` })] })] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                        ]
                      })
                    )
                  ]
                }),
                new Paragraph({
                  spacing: { before: 200, after: 80 },
                  children: [
                    new TextRun({ text: 'Mengetahui,\n' })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Pembimbing Lapangan / Mitra Industri                      Dosen Pembimbing KLK Kimia UB\n\n\n\n\n' }),
                    new TextRun({ text: `( ${detailModalKlk.mentorIndustri || '___________________________'} )                 ( ${pembimbing} )\n`, bold: true }),
                    new TextRun({ text: 'NIP/ID Pegawai: ....................                           NIP. .................................' })
                  ]
                })
              ]
            }
          ]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloadToast(`Berhasil mengunduh ${filename}`);
      } else if (docType === 'kartu_bimbingan') {
        const filename = `Template_Kartu_Bimbingan_KLK_${nim}.docx`;

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
                      size: 20,
                      color: '333333'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA',
                      bold: true,
                      size: 24,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'DEPARTEMEN KIMIA',
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
                      text: 'Gedung Kimia, Jl. Veteran, Malang 65145 | Telp: (0341) 575838 | Email: kimia@ub.ac.id',
                      size: 18,
                      color: '666666'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150, before: 50 },
                  children: [
                    new TextRun({
                      text: '════════════════════════════════════════════════════════════════════════════════',
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'KARTU KONTROL BIMBINGAN KULIAH LAPANGAN KIMIA (KLK)',
                      bold: true,
                      size: 22,
                      color: '002B49'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 150 },
                  children: [
                    new TextRun({
                      text: `Kode Pendaftaran: ${detailModalKlk.kodePendaftaran} | Status: ${detailModalKlk.status}`,
                      italics: true,
                      size: 18,
                      color: '555555'
                    })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 100, after: 60 },
                  children: [
                    new TextRun({ text: `Nama Mahasiswa        : ${mhsName}\n`, bold: true }),
                    new TextRun({ text: `NIM                   : ${nim}\n` }),
                    new TextRun({ text: `Program Studi         : S1 Kimia FSTeM Universitas Brawijaya\n` }),
                    new TextRun({ text: `Mitra Kerja Lapangan  : ${mitra}\n` }),
                    new TextRun({ text: `Topik / Bidang Kerja  : ${detailModalKlk.bidangPekerjaan}\n` }),
                    new TextRun({ text: `Dosen Pembimbing KLK  : ${pembimbing}` })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 120, after: 80 },
                  children: [
                    new TextRun({
                      text: 'CATATAN PROGRES & REKOMENDASI SESI BIMBINGAN:',
                      bold: true,
                      size: 20,
                      color: '002B49'
                    })
                  ]
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No.', bold: true })] })] }),
                        new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tanggal Bimbingan', bold: true })] })] }),
                        new TableCell({ width: { size: 36, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Pokok Bahasan & Progres', bold: true })] })] }),
                        new TableCell({ width: { size: 26, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Catatan / Rekomendasi Dosen', bold: true })] })] }),
                        new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Status & Paraf', bold: true })] })] }),
                      ]
                    }),
                    ...bimbinganSesiList.map((s, idx) =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}` })] })] }),
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.tanggal })] })] }),
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.pokokBahasan })] })] }),
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.catatanDosen || '-' })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${s.status}${s.parafDosen ? ' [Paraf ✓]' : ''}` })] })] }),
                        ]
                      })
                    ),
                    ...Array.from({ length: Math.max(0, 8 - bimbinganSesiList.length) }).map((_, i) =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${bimbinganSesiList.length + i + 1}` })] })] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                          new TableCell({ children: [new Paragraph(' ')] }),
                        ]
                      })
                    )
                  ]
                }),
                new Paragraph({
                  spacing: { before: 150, after: 120 },
                  children: [
                    new TextRun({
                      text: `Catatan: Minimal frekuensi bimbingan KLK adalah 6 sesi. Total sesi saat ini: ${bimbinganSesiList.length} sesi (${bimbinganSesiList.filter(s => s.status === 'Disetujui').length} Disetujui).`,
                      italics: true,
                      size: 18,
                      color: '555555'
                    })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Mahasiswa Peserta KLK                                   Dosen Pembimbing KLK Kimia UB\n\n\n\n\n' }),
                    new TextRun({ text: `( ${mhsName} )                               ( ${pembimbing} )\n`, bold: true }),
                    new TextRun({ text: `NIM. ${nim}                                              NIP. .................................` })
                  ]
                })
              ]
            }
          ]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloadToast(`Berhasil mengunduh ${filename}`);
      } else {
        // berita_acara -> PDF using jsPDF
        const filename = `Berita_Acara_Ujian_KLK_${nim}.pdf`;
        const nilInd = detailModalKlk.nilaiIndustri || 85;
        const nilDos = detailModalKlk.nilaiDosen || 88;
        const nilUjian = Math.round((nilInd + nilDos) / 2);
        const nilAkhir = ((nilInd * 0.4) + (nilDos * 0.3) + (nilUjian * 0.3)).toFixed(1);

        const pdfDoc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdfDoc.internal.pageSize.getWidth();
        const margin = 18;
        let y = 18;

        // Kop Surat
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(9);
        pdfDoc.setTextColor(60, 60, 60);
        pdfDoc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', pageWidth / 2, y, { align: 'center' });
        y += 5;

        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(12);
        pdfDoc.setTextColor(0, 43, 73); // #002B49
        pdfDoc.text('UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA', pageWidth / 2, y, { align: 'center' });
        y += 5.5;

        pdfDoc.setFontSize(13);
        pdfDoc.text('DEPARTEMEN KIMIA', pageWidth / 2, y, { align: 'center' });
        y += 4.5;

        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(90, 90, 90);
        pdfDoc.text('Gedung Kimia, Jl. Veteran, Malang 65145, Jawa Timur | Telp: (0341) 575838 | Email: kimia@ub.ac.id', pageWidth / 2, y, { align: 'center' });
        y += 3;

        // Double lines
        pdfDoc.setDrawColor(0, 43, 73);
        pdfDoc.setLineWidth(0.8);
        pdfDoc.line(margin, y, pageWidth - margin, y);
        y += 1;
        pdfDoc.setLineWidth(0.2);
        pdfDoc.line(margin, y, pageWidth - margin, y);
        y += 7;

        // Title
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(12);
        pdfDoc.setTextColor(0, 43, 73);
        pdfDoc.text('BERITA ACARA EVALUASI / UJIAN SEMINAR KLK', pageWidth / 2, y, { align: 'center' });
        y += 5;

        pdfDoc.setFont('helvetica', 'italic');
        pdfDoc.setFontSize(9);
        pdfDoc.setTextColor(90, 90, 90);
        pdfDoc.text(`Nomor: BA-KLK/KIM/${thn}/${detailModalKlk.kodePendaftaran || '2026'}`, pageWidth / 2, y, { align: 'center' });
        y += 7;

        // Statement
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(9.5);
        pdfDoc.setTextColor(30, 30, 30);
        const statement = 'Pada hari ini, telah diselenggarakan Evaluasi / Ujian Seminar Kegiatan Mahasiswa di Luar Kampus (KLK) bagi mahasiswa Departemen Kimia FSTeM Universitas Brawijaya:';
        pdfDoc.text(statement, margin, y, { maxWidth: pageWidth - margin * 2 });
        y += 8;

        // Biodata Box
        pdfDoc.setFillColor(248, 250, 252);
        pdfDoc.setDrawColor(220, 226, 235);
        pdfDoc.roundedRect(margin, y, pageWidth - margin * 2, 38, 2, 2, 'FD');

        const labelX = margin + 4;
        const colonX = margin + 48;
        const valX = margin + 51;
        let bioY = y + 6;

        const bioItems = [
          { label: 'Nama Mahasiswa', val: mhsName, bold: true },
          { label: 'NIM', val: nim, bold: true },
          { label: 'Program Studi', val: 'S1 Kimia FSTeM Universitas Brawijaya' },
          { label: 'Instansi / Mitra KLK', val: mitra },
          { label: 'Topik / Pekerjaan', val: detailModalKlk.bidangPekerjaan || 'Analisis & Manajemen Laboratorium Industri' },
          { label: 'Waktu & Ruang Ujian', val: `${detailModalKlk.tanggalUjian || 'Sesuai Jadwal'} (${detailModalKlk.pukulUjian || '09:00 - 10:30 WIB'}) — ${detailModalKlk.ruangUjian || 'Ruang Seminar Kimia'}` },
        ];

        bioItems.forEach(item => {
          pdfDoc.setFont('helvetica', 'normal');
          pdfDoc.setFontSize(9);
          pdfDoc.setTextColor(70, 70, 70);
          pdfDoc.text(item.label, labelX, bioY);
          pdfDoc.text(':', colonX, bioY);
          pdfDoc.setFont('helvetica', item.bold ? 'bold' : 'normal');
          pdfDoc.setTextColor(20, 20, 20);
          pdfDoc.text(item.val, valX, bioY, { maxWidth: pageWidth - margin * 2 - 56 });
          bioY += 5.2;
        });

        y += 43;

        // Penilaian Header
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(10);
        pdfDoc.setTextColor(0, 43, 73);
        pdfDoc.text('REKAPITULASI PENILAIAN HASIL EVALUASI:', margin, y);
        y += 4;

        // Table Penilaian
        const tableTop = y;
        const tableWidth = pageWidth - margin * 2;
        pdfDoc.setFillColor(241, 245, 249);
        pdfDoc.rect(margin, tableTop, tableWidth, 7, 'F');
        pdfDoc.setDrawColor(203, 213, 225);
        pdfDoc.rect(margin, tableTop, tableWidth, 36, 'D');

        // Header row
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(8.5);
        pdfDoc.setTextColor(0, 43, 73);
        pdfDoc.text('No.', margin + 3, tableTop + 5);
        pdfDoc.text('Komponen Evaluasi & Penilaian', margin + 14, tableTop + 5);
        pdfDoc.text('Bobot', margin + 115, tableTop + 5);
        pdfDoc.text('Nilai Angka', margin + 145, tableTop + 5);

        // Horizontal lines inside table
        pdfDoc.line(margin, tableTop + 7, margin + tableWidth, tableTop + 7);
        pdfDoc.line(margin, tableTop + 14, margin + tableWidth, tableTop + 14);
        pdfDoc.line(margin, tableTop + 21, margin + tableWidth, tableTop + 21);
        pdfDoc.line(margin, tableTop + 28, margin + tableWidth, tableTop + 28);

        // Rows
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setTextColor(30, 30, 30);

        // Row 1
        pdfDoc.text('1.', margin + 3, tableTop + 11.5);
        pdfDoc.text('Nilai Pembimbing Lapangan / Mitra Industri', margin + 14, tableTop + 11.5);
        pdfDoc.text('40%', margin + 115, tableTop + 11.5);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text(`${nilInd}`, margin + 145, tableTop + 11.5);
        pdfDoc.setFont('helvetica', 'normal');

        // Row 2
        pdfDoc.text('2.', margin + 3, tableTop + 18.5);
        pdfDoc.text('Nilai Dosen Pembimbing KLK Kimia UB', margin + 14, tableTop + 18.5);
        pdfDoc.text('30%', margin + 115, tableTop + 18.5);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text(`${nilDos}`, margin + 145, tableTop + 18.5);
        pdfDoc.setFont('helvetica', 'normal');

        // Row 3
        pdfDoc.text('3.', margin + 3, tableTop + 25.5);
        pdfDoc.text('Nilai Penguji / Seminar Ujian KLK', margin + 14, tableTop + 25.5);
        pdfDoc.text('30%', margin + 115, tableTop + 25.5);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text(`${nilUjian}`, margin + 145, tableTop + 25.5);
        pdfDoc.setFont('helvetica', 'normal');

        // Row 4 (Total)
        pdfDoc.setFillColor(236, 253, 245);
        pdfDoc.rect(margin + 0.2, tableTop + 28.2, tableWidth - 0.4, 7.6, 'F');
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setTextColor(6, 95, 70);
        pdfDoc.text('NILAI AKHIR & PREDIKAT KELULUSAN', margin + 14, tableTop + 33.5);
        pdfDoc.text('100%', margin + 115, tableTop + 33.5);
        pdfDoc.text(`${nilAkhir}  ( Huruf: ${detailModalKlk.nilaiAkhirHuruf || 'A'} )`, margin + 140, tableTop + 33.5);

        y = tableTop + 42;

        // Decision Box
        pdfDoc.setFillColor(240, 253, 244);
        pdfDoc.setDrawColor(187, 247, 208);
        pdfDoc.roundedRect(margin, y, tableWidth, 12, 1.5, 1.5, 'FD');
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(9);
        pdfDoc.setTextColor(22, 101, 52);
        pdfDoc.text('KEPUTUSAN: LULUS DENGAN PREDIKAT SANGAT MEMUASKAN', pageWidth / 2, y + 7.5, { align: 'center' });

        y += 18;

        // Signatures
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(8.5);
        pdfDoc.setTextColor(30, 30, 30);
        pdfDoc.text(`Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - margin - 50, y);
        y += 5;

        const col1X = margin + 15;
        const col2X = pageWidth / 2;
        const col3X = pageWidth - margin - 25;

        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.text('Dosen Pembimbing KLK,', col1X, y, { align: 'center' });
        pdfDoc.text('Dosen Penguji Seminar,', col2X, y, { align: 'center' });
        pdfDoc.text('Mengetahui,\nKetua Departemen Kimia,', col3X, y, { align: 'center' });

        y += 20;

        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text(`( ${pembimbing} )`, col1X, y, { align: 'center' });
        pdfDoc.text('( Prof. Dr. Dra. Hermin Sulistyarti, M.Si )', col2X, y, { align: 'center' });
        pdfDoc.text('( Dr. rer. nat. Rachmat Triandi Tjahjanto )', col3X, y, { align: 'center' });

        y += 4;
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(7.5);
        pdfDoc.setTextColor(100, 100, 100);
        pdfDoc.text('NIP. 197405102000031002', col1X, y, { align: 'center' });
        pdfDoc.text('NIP. 196306231988022001', col2X, y, { align: 'center' });
        pdfDoc.text('NIP. 197109271997021001', col3X, y, { align: 'center' });

        pdfDoc.save(filename);
        setDownloadToast(`Berhasil mengunduh ${filename}`);
      }
    } catch (err) {
      console.error('Gagal mengunduh dokumen:', err);
      setDownloadToast('Terjadi kesalahan saat memproses unduhan dokumen.');
    } finally {
      setDownloadingDocType(null);
    }
  };

  const handleSelectSksChoice = (sks: number) => {
    setSelectedSksChoice(sks);
    setIsSksMenuOpen(false);
    if (detailModalKlk) {
      setDetailModalKlk({
        ...detailModalKlk,
        sksDiakui: sks
      });
    }
  };

  const handleSaveNilaiInModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModalKlk) return;
    onSimpanNilai(
      detailModalKlk.id,
      modalNilaiIndustri,
      modalNilaiDosen,
      modalNilaiHuruf
    );
    setDetailModalKlk({
      ...detailModalKlk,
      nilaiIndustri: modalNilaiIndustri,
      nilaiDosen: modalNilaiDosen,
      nilaiAkhirHuruf: modalNilaiHuruf,
      status: 'Selesai & Dinilai'
    });
    setIsEditingNilaiInModal(false);
    alert('Nilai KLK berhasil diperbarui dan disimpan!');
  };

  const handleSaveUjianInModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModalKlk) return;
    if (onUpdateUjian) {
      onUpdateUjian(detailModalKlk.id, modalTglUjian, modalPukulUjian, modalRuangUjian);
    }
    setDetailModalKlk((prev) =>
      prev
        ? {
            ...prev,
            tanggalUjian: modalTglUjian,
            pukulUjian: modalPukulUjian,
            ruangUjian: modalRuangUjian
          }
        : null
    );
    setModalSaveMessage('Jadwal Ujian (Tanggal, Pukul, dan Ruang Ujian) berhasil diperbarui dan disimpan!');
    setModalSaveSuccess(true);
    setIsEditingUjianInModal(false);
    setTimeout(() => setModalSaveSuccess(false), 3000);
  };

  const handleOpenEditKlkModal = (item: PengajuanKLK) => {
    let initialStatus: 'Diproses' | 'Disetujui' | 'Ditolak' = 'Diproses';
    if (
      item.status === 'Disetujui' ||
      item.status === 'Disetujui / Sedang Berjalan' ||
      item.status === 'Selesai & Dinilai'
    ) {
      initialStatus = 'Disetujui';
    } else if (item.status === 'Ditolak') {
      initialStatus = 'Ditolak';
    } else {
      initialStatus = 'Diproses';
    }

    setEditKlkForm({
      namaMitra: item.namaMitra || '',
      alamatMitra: item.alamatMitra || '',
      bidangPekerjaan: item.bidangPekerjaan || '',
      skema: item.skema || 'Magang Industri Kimia',
      sksDiakui: item.sksDiakui || 7,
      tanggalMulai: item.tanggalMulai || '',
      tanggalSelesai: item.tanggalSelesai || '',
      dosenPembimbingKLK: item.dosenPembimbingKLK || (dosenList[0]?.nama || 'Dr. Dra. Hermin Sulistyarti, M.Si.'),
      mentorIndustri: item.mentorIndustri || '',
      kontakMentor: item.kontakMentor || '',
      semester: item.semester || 6,
      status: initialStatus
    });
    setModalEditKlkOpen(true);
  };

  const handleSaveEditKlk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModalKlk) return;

    const updatedItem: PengajuanKLK = {
      ...detailModalKlk,
      namaMitra: editKlkForm.namaMitra,
      alamatMitra: editKlkForm.alamatMitra,
      bidangPekerjaan: editKlkForm.bidangPekerjaan,
      skema: editKlkForm.skema,
      sksDiakui: Number(editKlkForm.sksDiakui),
      tanggalMulai: editKlkForm.tanggalMulai,
      tanggalSelesai: editKlkForm.tanggalSelesai,
      dosenPembimbingKLK: editKlkForm.dosenPembimbingKLK,
      mentorIndustri: editKlkForm.mentorIndustri,
      kontakMentor: editKlkForm.kontakMentor,
      semester: Number(editKlkForm.semester),
      status: editKlkForm.status
    };

    setDetailModalKlk(updatedItem);

    if (onUpdateKLK) {
      onUpdateKLK(updatedItem);
    } else {
      const idx = klkList.findIndex((k) => k.id === updatedItem.id);
      if (idx !== -1) {
        klkList[idx] = updatedItem;
      }
    }

    if (onUpdateStatus) {
      onUpdateStatus(updatedItem.id, editKlkForm.status);
    }

    setModalSaveMessage(`Data Pendaftaran KLK berhasil diperbarui! Status ditetapkan: ${editKlkForm.status}`);
    setModalSaveSuccess(true);
    setModalEditKlkOpen(false);
    setTimeout(() => setModalSaveSuccess(false), 3500);
  };

  // Form Logbook Mingguan State
  const [logMingguKe, setLogMingguKe] = useState<number>(1);
  const [logTglMulai, setLogTglMulai] = useState('');
  const [logTglSelesai, setLogTglSelesai] = useState('');
  const [logAktivitas, setLogAktivitas] = useState('');
  const [logAlatMetode, setLogAlatMetode] = useState('');
  const [logHasil, setLogHasil] = useState('');
  const [logbookSuccess, setLogbookSuccess] = useState(false);

  // Penilaian State
  const [nilaiIndInput, setNilaiIndInput] = useState<number>(90);
  const [nilaiDosInput, setNilaiDosInput] = useState<number>(88);
  const [nilaiSavedAlert, setNilaiSavedAlert] = useState(false);

  // Simulation mode for evaluator testing
  const [klkSimulationMode, setKlkSimulationMode] = useState<'normal' | 'belum_daftar' | 'belum_mulai' | 'sudah_mulai'>('normal');

  // Selected KLK object
  const selectedKlk = isMahasiswa
    ? (roleScopedKlkList.find((k) => k.id === selectedKlkId) || roleScopedKlkList[0] || null)
    : (roleScopedKlkList.find((k) => k.id === selectedKlkId) || roleScopedKlkList[0] || klkList[0] || null);

  // Helper: Mengecek apakah kegiatan KLK sudah resmi dimulai
  const hasStudentStartedKlk = (klk: PengajuanKLK | null | undefined): boolean => {
    if (!klk) return false;

    // 1. Status harus sudah disetujui / aktif berjalan / selesai
    const isApproved =
      klk.status === 'Disetujui' ||
      klk.status === 'Disetujui / Sedang Berjalan' ||
      klk.status === 'Selesai & Dinilai';

    if (!isApproved) {
      // Jika status masih 'Diproses', 'Menunggu Persetujuan Dept', 'Draft', atau 'Ditolak'
      return false;
    }

    // 2. Tanggal pelaksanaan (tanggalMulai) harus sudah tercapai
    if (klk.tanggalMulai) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr < klk.tanggalMulai) {
          return false;
        }
      } catch {}
    }

    return true;
  };

  // Filtered list (untuk tab Data Pengajuan KLK)
  const filteredList = roleScopedKlkList.filter((item) => {
    const matchSearch =
      item.mahasiswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nim.includes(searchQuery) ||
      item.namaMitra.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kodePendaftaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.namaSemester && item.namaSemester.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSkema = filterSkema === 'Semua' || item.skema === filterSkema;
    const matchSemester =
      filterSemester === 'Semua' ||
      (filterSemester.startsWith('tingkat-') &&
        item.semester === parseInt(filterSemester.replace('tingkat-', ''), 10)) ||
      item.namaSemester === filterSemester ||
      (item.namaSemester && item.namaSemester.toLowerCase().includes(filterSemester.toLowerCase())) ||
      item.semester.toString() === filterSemester;
    const matchStatus =
      filterStatus === 'Semua' ||
      item.status === filterStatus ||
      (filterStatus === 'Diproses' && (item.status === 'Diproses' || item.status === 'Menunggu Persetujuan Dept')) ||
      (filterStatus === 'Disetujui' && (item.status === 'Disetujui' || item.status === 'Disetujui / Sedang Berjalan'));
    return matchSearch && matchSkema && matchSemester && matchStatus;
  });

  // Calculate statistics berdasarkan role scope
  const totalAktif = roleScopedKlkList.filter(
    (k) => k.status === 'Disetujui / Sedang Berjalan' || k.status === 'Disetujui'
  ).length;
  const totalPending = roleScopedKlkList.filter(
    (k) => k.status === 'Menunggu Persetujuan Dept' || k.status === 'Diproses'
  ).length;
  const totalDitolak = roleScopedKlkList.filter((k) => k.status === 'Ditolak').length;
  const totalSelesai = roleScopedKlkList.filter((k) => k.status === 'Selesai & Dinilai').length;

  // Handle New Submission
  const handleSubmitBaru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMitra || !formBidangPekerjaan || !formTglMulai || !formTglSelesai) {
      alert('Harap isi semua kolom wajib untuk pengajuan KLK.');
      return;
    }

    if (formMkKonversiList.length === 0) {
      alert('Silakan pilih minimal 1 usulan mata kuliah konversi.');
      return;
    }

    if (hasSerialConflict) {
      const conflictNames = formSerialConflicts.map((c) => c.pairName).join(', ');
      alert(
        `Pengajuan tidak dapat diproses karena terdapat mata kuliah berseri yang berpasangan (${conflictNames}). Sesuai ketentuan, mata kuliah berseri (seperti Seri I dan Seri II) tidak boleh diambil secara bersamaan dalam satu pengajuan KLK. Silakan sesuaikan pilihan Anda.`
      );
      return;
    }

    if (!TARGET_KOMBINASI_SKS_KLK.includes(formTotalSks as any)) {
      alert(
        `Kombinasi total SKS usulan mata kuliah konversi saat ini adalah ${formTotalSks} SKS. Sesuai ketentuan, kombinasi jumlah SKS yang diperbolehkan adalah 4, 7, 10, 13, atau 16 SKS. Silakan sesuaikan pilihan mata kuliah Anda.`
      );
      return;
    }

    const activeMhsNama = currentStudentData.nama;
    const activeMhsNim = (currentStudentData.nim || '').replace(/[^\d]/g, '') || currentStudentData.nim;
    const activeMhsId = currentStudentData.id;

    const activeKontakMentor =
      [formHpPembimbing.trim(), formEmailPembimbing.trim()].filter(Boolean).join(' / ') ||
      formKontakMentor ||
      '-';

    const newKLK: PengajuanKLK = {
      id: `klk-${Date.now()}`,
      kodePendaftaran: `KLK-KIM-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      mahasiswaId: activeMhsId,
      mahasiswaNama: activeMhsNama,
      nim: activeMhsNim,
      semester: currentStudentData.semester || 7,
      namaSemester: formSemester,
      skema: formSkema,
      namaMitra: formMitra,
      alamatMitra: formAlamatMitra || 'Kantor Pusat / Fasilitas Pabrik Mitra',
      bidangPekerjaan: formBidangPekerjaan,
      mentorIndustri: formMentor || 'Pembimbing Lapangan Mitra Terkait',
      kontakMentor: activeKontakMentor,
      noHpMentor: formHpPembimbing.trim() || undefined,
      emailMentor: formEmailPembimbing.trim() || undefined,
      dosenPembimbingKLK: formDosenKLK,
      tanggalMulai: formTglMulai,
      tanggalSelesai: formTglSelesai,
      tanggalUjian: formTglUjian || undefined,
      pukulUjian: formPukulUjian || undefined,
      sksDiakui: formTotalSks,
      mataKuliahKonversi: formMkKonversiList.join('; '),
      mataKuliahKonversiList: formMkKonversiList,
      status: canManageStatus ? formStatus : 'Diproses',
      nomorSuratTugas:
        (canManageStatus ? formStatus : 'Diproses') === 'Disetujui'
          ? `08${Math.floor(10 + Math.random() * 90)}/UN10.F09/AK-KLK/2026`
          : undefined,
      dokumenLoA: formLoAName || 'Surat_Penerimaan_Mitra_Resmi.pdf',
      dokumenSuratLamaran: formBerkasBaruMap.surat_lamaran.fileName || undefined,
      dokumenProposal: formBerkasBaruMap.proposal.fileName || undefined,
      dokumenCV: formBerkasBaruMap.cv_mahasiswa.fileName || undefined,
      dokumenTranskrip: formBerkasBaruMap.transkrip_akademik.fileName || undefined,
      logbooks: []
    };

    // Update berkas pendaftaran map if any documents are uploaded
    setBerkasPendaftaranMap((prev) => ({
      ...prev,
      ...(formBerkasBaruMap.surat_lamaran.fileName
        ? {
            surat_lamaran: {
              id: 'surat_lamaran',
              label: 'Surat Lamaran',
              description: 'Surat permohonan magang KLK ke pimpinan instansi mitra',
              fileName: formBerkasBaruMap.surat_lamaran.fileName,
              status: 'uploaded',
              fileSize: formBerkasBaruMap.surat_lamaran.fileSize || '450 KB',
              uploadedAt: formBerkasBaruMap.surat_lamaran.uploadedAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              allowPreview: true
            }
          }
        : {}),
      ...(formBerkasBaruMap.proposal.fileName
        ? {
            proposal: {
              id: 'proposal',
              label: 'Proposal',
              description: 'Proposal rencana kerja & metodologi riset / laboratorium kimia',
              fileName: formBerkasBaruMap.proposal.fileName,
              status: 'uploaded',
              fileSize: formBerkasBaruMap.proposal.fileSize || '1.2 MB',
              uploadedAt: formBerkasBaruMap.proposal.uploadedAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              allowPreview: true
            }
          }
        : {}),
      ...(formBerkasBaruMap.cv_mahasiswa.fileName
        ? {
            cv_mahasiswa: {
              id: 'cv_mahasiswa',
              label: 'CV Mahasiswa',
              description: 'Curriculum Vitae terbaru memuat riwayat studi dan keahlian instrumen',
              fileName: formBerkasBaruMap.cv_mahasiswa.fileName,
              status: 'uploaded',
              fileSize: formBerkasBaruMap.cv_mahasiswa.fileSize || '350 KB',
              uploadedAt: formBerkasBaruMap.cv_mahasiswa.uploadedAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              allowPreview: true
            }
          }
        : {}),
      ...(formBerkasBaruMap.transkrip_akademik.fileName
        ? {
            transkrip_akademik: {
              id: 'transkrip_akademik',
              label: 'Transkrip Akademik',
              description: 'Transkrip nilai akademik kumulatif lengkap yang telah disahkan DPA/KPS',
              fileName: formBerkasBaruMap.transkrip_akademik.fileName,
              status: 'uploaded',
              fileSize: formBerkasBaruMap.transkrip_akademik.fileSize || '650 KB',
              uploadedAt: formBerkasBaruMap.transkrip_akademik.uploadedAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              allowPreview: true
            }
          }
        : {})
    }));

    onAddPengajuan(newKLK);
    setSelectedKlkId(newKLK.id);
    setFormSubmittedSuccess(true);
    setTimeout(() => {
      setFormSubmittedSuccess(false);
      setSubTab('form-klk-cetak');
    }, 1500);
  };

  // Handle Logbook Submission
  const handleSaveLogbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKlk) return;

    const newLog: LogbookMingguanKLK = {
      id: `klk-log-${Date.now()}`,
      mingguKe: Number(logMingguKe),
      tanggalMulai: logTglMulai,
      tanggalSelesai: logTglSelesai,
      aktivitas: logAktivitas,
      alatDanMetode: logAlatMetode,
      hasilDanKendala: logHasil,
      statusVerifikasi: 'Menunggu Verifikasi',
      catatanMentor: ''
    };

    onAddLogbook(selectedKlk.id, newLog);
    setLogbookSuccess(true);
    setLogAktivitas('');
    setLogAlatMetode('');
    setLogHasil('');
    setTimeout(() => setLogbookSuccess(false), 2000);
  };

  // Handle Simpan Nilai
  const handleSimpanNilaiAkhir = () => {
    if (!selectedKlk) return;
    const finalScore = (nilaiIndInput * 0.4) + (nilaiDosInput * 0.6);
    let huruf: 'A' | 'B+' | 'B' | 'C+' | 'C' = 'B';
    if (finalScore >= 80) huruf = 'A';
    else if (finalScore >= 75) huruf = 'B+';
    else if (finalScore >= 70) huruf = 'B';
    else if (finalScore >= 60) huruf = 'C+';
    else huruf = 'C';

    onSimpanNilai(selectedKlk.id, nilaiIndInput, nilaiDosInput, huruf);
    setNilaiSavedAlert(true);
    setTimeout(() => setNilaiSavedAlert(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003861] to-[#014474] text-white p-6 rounded-xl shadow-md border border-slate-700/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Sistem Informasi Kegiatan Mahasiswa (SIKMA) Kimia UB</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              KLK — Kegiatan Mahasiswa di Luar Kampus
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Portal pendaftaran, persetujuan rencana studi, monitoring logbook mingguan,
              dan pelaporan akhir untuk skema <strong>PKL</strong>,{' '}
              <strong>Magang Berdampak (Prodi)</strong>, dan <strong>Magang Berdampak (Fakultas)</strong>{' '}
              Departemen Kimia FSTeM Universitas Brawijaya.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-tambah-klk-header"
              onClick={() => setSubTab('form-baru')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c4a02d] text-[#002B49] font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftar KLK Baru</span>
            </button>
            <button
              id="btn-rekap-nilai-header"
              onClick={() => setModalRekapNilaiOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-all border border-white/20 cursor-pointer shadow-xs"
              title="Buka Rekapitulasi Nilai KLK & Mata Kuliah Konversi"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
              <span>Rekap Nilai</span>
            </button>
            <button
              id="btn-pedoman-header"
              onClick={() => setModalAlurKlkOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-all border border-white/20 cursor-pointer shadow-xs"
              title="Lihat 22 Langkah Alur Prosedur Pelaksanaan KLK"
            >
              <GitMerge className="w-4 h-4 text-[#D4AF37]" />
              <span>Alur KLK</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-slate-300">
              {isMahasiswa ? 'Pengajuan KLK Anda' : 'Total Pengajuan KLK'}
            </div>
            <div className="text-xl font-bold text-white mt-0.5">
              {roleScopedKlkList.length} {isMahasiswa ? 'Kegiatan' : 'Mahasiswa'}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-slate-300">Sedang Aktif di Lapangan</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {totalAktif} {isMahasiswa ? 'Kegiatan' : 'Orang'}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-slate-300">Menunggu Verifikasi Dept</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{totalPending} Berkas</div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-slate-300">Mitra Industri Terdaftar</div>
            <div className="text-xl font-bold text-[#D4AF37] mt-0.5">{mitraList.length} Instansi</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <div className="flex border-b border-slate-200 min-w-max p-1 gap-1">
          <button
            id="tab-klk-baru"
            onClick={() => setSubTab('form-baru')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'form-baru'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Form Pengajuan KLK</span>
            {isMahasiswa && (
              isFormBaruUnlocked ? (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Terbuka
                </span>
              ) : (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  <span>Scan QR</span>
                </span>
              )
            )}
          </button>

          <button
            id="tab-klk-list"
            onClick={() => setSubTab('pengajuan-list')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'pengajuan-list'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Data Pengajuan KLK ({roleScopedKlkList.length})</span>
          </button>

          <button
            id="tab-klk-cetak"
            onClick={() => setSubTab('form-klk-cetak')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'form-klk-cetak'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Form KLK Resmi (Cetak)</span>
          </button>

          <button
            id="tab-klk-logbook"
            onClick={() => setSubTab('logbook-mingguan')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'logbook-mingguan'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Logbook Mingguan KLK</span>
          </button>

          <button
            id="tab-klk-seminar"
            onClick={() => setSubTab('penilaian-seminar')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'penilaian-seminar'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Seminar & Nilai Akhir</span>
          </button>

          <button
            id="tab-klk-mitra"
            onClick={() => setSubTab('direktori-mitra')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'direktori-mitra'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Direktori Mitra Kimia ({mitraList.length})</span>
          </button>

          <button
            id="tab-klk-unduhan"
            onClick={() => setSubTab('unduhan-panduan')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'unduhan-panduan'
                ? 'bg-[#002B49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Pedoman & Dokumen</span>
          </button>

          {canManageStatus && (
            <button
              type="button"
              id="btn-tab-kelola-qr-sosialisasi"
              onClick={() => setIsQrManagerModalOpen(true)}
              className="ml-auto flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#002B49] hover:bg-[#003865] border border-[#D4AF37]/40 transition-all shadow-xs shrink-0 self-center cursor-pointer"
              title="Kelola Kode QR Sosialisasi & Otorisasi Buka Blokir Mahasiswa"
            >
              <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Kelola QR & Buka Blokir</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DAFTAR PENGAJUAN KLK */}
      {subTab === 'pengajuan-list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mahasiswa, NIM, mitra industri..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5" />
                <span>Skema:</span>
              </div>
              <select
                id="filter-skema-klk"
                value={filterSkema}
                onChange={(e) => setFilterSkema(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Semua">Semua Skema KLK</option>
                <option value="PKL">PKL</option>
                <option value="Magang Berdampak (Prodi)">Magang Berdampak (Prodi)</option>
                <option value="Magang Berdampak (Fakultas)">Magang Berdampak (Fakultas)</option>
                <option value="Magang Regular">Magang Regular</option>
                <option value="Magang Industri (MBKM)">Magang Industri</option>
                <option value="Riset / Penelitian Luar Kampus">Riset Luar Kampus</option>
                <option value="Studi Independen Bersertifikat">Studi Independen</option>
              </select>

              {/* Filter Semester (Diletakkan setelah filter Skema) */}
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <span>Semester:</span>
              </div>
              <select
                id="filter-semester-klk"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Semua">Semua Semester</option>
                <optgroup label="Tahun Akademik">
                  {semesterOptions.map((s) => (
                    <option key={s.id} value={s.namaSemester}>
                      {s.namaSemester} {s.status === 'Aktif' ? '(Aktif)' : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tingkat Semester">
                  <option value="tingkat-5">Semester 5</option>
                  <option value="tingkat-6">Semester 6</option>
                  <option value="tingkat-7">Semester 7</option>
                  <option value="tingkat-8">Semester 8</option>
                </optgroup>
              </select>

              <select
                id="filter-status-klk"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Semua">Semua Status</option>
                <option value="Diproses">Diproses</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
                <option value="Selesai & Dinilai">Selesai & Dinilai</option>
              </select>

              {(filterSkema !== 'Semua' || filterSemester !== 'Semua' || filterStatus !== 'Semua' || searchQuery) && (
                <button
                  id="btn-reset-filter-klk"
                  onClick={() => {
                    setFilterSkema('Semua');
                    setFilterSemester('Semua');
                    setFilterStatus('Semua');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded transition-colors"
                  title="Reset semua filter"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Info Banner Khusus Peran Mahasiswa */}
          {isMahasiswa && (
            <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-900 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>Aktivitas Pengajuan KLK Anda:</span>
                    <span className="text-[#002B49] bg-blue-100/90 px-2 py-0.5 rounded font-mono font-bold">
                      {effectiveUser?.nama || student.nama}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    NIM: <span className="font-semibold">{effectiveUser?.identifier || student.nim}</span> &bull; Menampilkan khusus daftar usulan kegiatan dan monitoring KLK atas nama Anda sendiri.
                  </div>
                </div>
              </div>
              <span className="self-start sm:self-center text-[10px] font-bold bg-blue-200/90 text-blue-950 border border-blue-300 px-2.5 py-1 rounded-full shrink-0">
                Akses Akun Mahasiswa
              </span>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {isMahasiswa
                    ? 'Daftar Pengajuan KLK Mahasiswa (Akun Anda)'
                    : 'Daftar Pendaftaran KLK Mahasiswa Kimia UB'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isMahasiswa
                    ? `Menampilkan ${filteredList.length} usulan kegiatan atas nama ${effectiveUser?.nama || student.nama}`
                    : `Menampilkan ${filteredList.length} dari total ${klkList.length} usulan kegiatan`}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                T.A. 2026/2027 Ganjil
              </span>
            </div>

            <div className="w-full overflow-hidden">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <th className="w-[18%] p-2.5 sm:p-3">Kode & Mahasiswa</th>
                    <th className="w-[10%] p-2.5 sm:p-3">Skema & SKS</th>
                    <th className="w-[13%] p-2.5 sm:p-3">Mitra Industri / Riset</th>
                    <th className="w-[10%] p-2.5 sm:p-3">Periode</th>
                    <th className="w-[15%] p-2.5 sm:p-3">Pembimbing</th>
                    <th className="w-[11%] p-2.5 sm:p-3">Waktu Ujian</th>
                    <th className="w-[8%] p-2.5 sm:p-3">Ruang Ujian</th>
                    <th className="w-[6%] p-2.5 sm:p-3 text-center">Status</th>
                    <th className="w-[9%] p-2.5 sm:p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredList.map((item) => {
                    const isSelected = item.id === selectedKlkId;
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Kolom Kode & Mahasiswa */}
                        <td className="p-2.5 sm:p-3 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] text-[#002B49] font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
                              {item.kodePendaftaran}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-medium">
                              {item.nim}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs mt-1 leading-tight truncate" title={item.mahasiswaNama}>
                            {item.mahasiswaNama}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>Sem. {item.semester}</span>
                            {item.namaSemester && (
                              <span className="text-[#002B49] font-medium bg-slate-100 px-1 rounded text-[9px] border border-slate-200 truncate max-w-[90px]">
                                {item.namaSemester}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Kolom Skema & SKS */}
                        <td className="p-2.5 sm:p-3 align-top">
                          <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[10px] truncate max-w-full" title={item.skema}>
                            {item.skema}
                          </span>
                          <div className="text-slate-600 font-medium mt-1 text-[11px]">
                            {item.sksDiakui} SKS Konversi
                          </div>
                        </td>

                        {/* Kolom Mitra Industri / Riset */}
                        <td className="p-2.5 sm:p-3 align-top">
                          <div className="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate" title={item.namaMitra}>{item.namaMitra}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5" title={item.bidangPekerjaan}>
                            {item.bidangPekerjaan}
                          </div>
                        </td>

                        {/* Kolom Periode */}
                        <td className="p-2.5 sm:p-3 align-top">
                          <div className="text-slate-700 flex items-start space-x-1 text-[10px] leading-tight">
                            <Calendar className="w-3 h-3 text-[#002B49] shrink-0 mt-0.5" />
                            <div className="truncate">
                              <div>{item.tanggalMulai}</div>
                              <div className="text-slate-400">s.d. {item.tanggalSelesai}</div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {item.logbooks.length} Logbook
                          </div>
                        </td>

                        {/* Kolom Pembimbing */}
                        <td className="p-2.5 sm:p-3 align-top">
                          <div className="space-y-1">
                            <div className="flex items-start gap-1">
                              <GraduationCap className="w-3 h-3 text-[#002B49] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="text-[9px] font-semibold text-slate-400 uppercase leading-none">Dosen</div>
                                <div className="text-slate-900 font-bold text-xs truncate leading-tight" title={item.dosenPembimbingKLK}>
                                  {item.dosenPembimbingKLK}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-1 pt-0.5 border-t border-slate-100">
                              <Briefcase className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="text-[9px] font-semibold text-slate-400 uppercase leading-none">Mentor</div>
                                <div className="text-slate-700 font-medium text-[10px] truncate leading-tight" title={item.mentorIndustri}>
                                  {item.mentorIndustri}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Field Pelaksanaan Waktu Ujian (tanggal dan pukul) */}
                        <td className="p-2.5 sm:p-3 align-top">
                          {item.tanggalUjian ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1 font-bold text-slate-800 text-xs">
                                <Calendar className="w-3 h-3 text-[#002B49] shrink-0" />
                                <span className="truncate">{item.tanggalUjian}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-[10px] text-slate-600">
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate">{item.pukulUjian || 'Menyesuaikan'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium border border-slate-200">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              <span>Belum Ada</span>
                            </span>
                          )}
                        </td>

                        {/* Field Ruang Ujian */}
                        <td className="p-2.5 sm:p-3 align-top">
                          {item.ruangUjian ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1 font-bold text-slate-800 text-xs">
                                <DoorOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate" title={item.ruangUjian}>
                                  {item.ruangUjian}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 block">
                                FSTeM UB
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">
                              Belum Ditentukan
                            </span>
                          )}
                        </td>

                        {/* Kolom Status */}
                        <td className="p-2.5 sm:p-3 text-center align-top">
                          {(item.status === 'Disetujui / Sedang Berjalan' || item.status === 'Disetujui') && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold text-[10px]">
                              Disetujui
                            </span>
                          )}
                          {(item.status === 'Menunggu Persetujuan Dept' || item.status === 'Diproses') && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-[10px]">
                              Diproses
                            </span>
                          )}
                          {item.status === 'Selesai & Dinilai' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded-full font-semibold text-[10px]">
                              Selesai ({item.nilaiAkhirHuruf})
                            </span>
                          )}
                          {item.status === 'Ditolak' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-semibold text-[10px]">
                              Ditolak
                            </span>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="p-2.5 sm:p-3 text-center align-top">
                          <div className="flex items-center justify-center flex-wrap gap-1">
                            {/* Tombol Detail */}
                            <button
                              id={`btn-detail-klk-${item.id}`}
                              onClick={() => handleOpenDetailModal(item)}
                              title="Lihat Form Detail Lengkap KLK"
                              className="inline-flex items-center gap-0.5 px-2 py-1 bg-[#002B49] hover:bg-[#003B66] text-white rounded text-[10px] font-semibold shadow-2xs transition-all ring-1 ring-[#D4AF37]/30"
                            >
                              <Eye className="w-3 h-3 text-[#D4AF37]" />
                              <span>Detail</span>
                            </button>

                            <button
                              id={`btn-select-klk-${item.id}`}
                              onClick={() => {
                                setSelectedKlkId(item.id);
                                setSubTab('form-klk-cetak');
                              }}
                              title="Lihat Form KLK Resmi"
                              className="p-1 text-[#002B49] hover:bg-slate-200 rounded transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <button
                              id={`btn-logbook-klk-${item.id}`}
                              onClick={() => {
                                setSelectedKlkId(item.id);
                                setSubTab('logbook-mingguan');
                              }}
                              title="Logbook Mingguan"
                              className="p-1 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>

                            {/* Verification action for Dosen / Admin */}
                            {(currentRole === 'dosen' || currentRole === 'admin' || currentRole === 'super_admin') &&
                              (item.status === 'Menunggu Persetujuan Dept' || item.status === 'Diproses') && (
                                <div className="flex items-center space-x-0.5">
                                  <button
                                    id={`btn-approve-klk-${item.id}`}
                                    onClick={() =>
                                      onUpdateStatus(
                                        item.id,
                                        'Disetujui',
                                        `08${Math.floor(10 + Math.random() * 90)}/UN10.F09/AK-KLK/2026`
                                      )
                                    }
                                    title="Setujui Pengajuan KLK"
                                    className="p-1 text-emerald-700 hover:bg-emerald-100 rounded transition-colors font-bold"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-reject-klk-${item.id}`}
                                    onClick={() => onUpdateStatus(item.id, 'Ditolak')}
                                    title="Tolak Pengajuan KLK"
                                    className="p-1 text-rose-700 hover:bg-rose-100 rounded transition-colors font-bold"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 bg-white">
                        <div className="max-w-md mx-auto flex flex-col items-center">
                          <FileSpreadsheet className="w-10 h-10 text-slate-300 mb-2" />
                          <p className="text-xs font-semibold text-slate-700">
                            {isMahasiswa
                              ? `Belum ada data pengajuan KLK atas nama ${effectiveUser?.nama || student.nama}.`
                              : 'Tidak ada data pengajuan KLK yang sesuai dengan filter pencarian.'}
                          </p>
                          {isMahasiswa && (
                            <button
                              onClick={() => setSubTab('form-baru')}
                              className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#002B49] text-white rounded-lg text-xs font-medium hover:bg-[#003865] transition-colors shadow-xs cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Ajukan Pendaftaran KLK Baru</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORM PENGAJUAN KLK */}
      {subTab === 'form-baru' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 w-full">
          <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-[#002B49] font-bold text-base">
                <PlusCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>Formulir Pengajuan Kegiatan Mahasiswa di Luar Kampus (KLK)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Departemen Kimia FSTeM Universitas Brawijaya &bull; Harap isi formulir rencana kegiatan, mitra, dan usulan konversi SKS.
              </p>
            </div>

            {canManageStatus && (
              <button
                type="button"
                id="btn-kelola-qr-form-baru"
                onClick={() => setIsQrManagerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span>Kelola QR Sosialisasi & Buka Blokir</span>
              </button>
            )}
          </div>

          {!isFormBaruUnlocked ? (
            <QrScanGate
              studentName={activeStudentNama}
              studentNim={effectiveUser?.identifier || student.nim}
              qrList={qrSosialisasiList}
              isUnblockedByAdmin={isStudentUnblocked}
              onVerifySuccess={handleVerifyStudentSuccess}
              onOpenAdminManager={() => setIsQrManagerModalOpen(true)}
              canManageQr={canManageStatus}
            />
          ) : (
            <>
              {isMahasiswa && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Akses Pendaftaran KLK Aktif</div>
                      <div className="text-[11px] text-emerald-700">
                        {isStudentUnblocked
                          ? 'Akses pendaftaran dibuka melalui otorisasi khusus Administrator (Buka Blokir).'
                          : 'Presensi Sosialisasi telah berhasil diverifikasi melalui Scan QR Code resmi.'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Status: Terbuka
                  </span>
                </div>
              )}

              {formSubmittedSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center space-x-3 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong>Pengajuan KLK Berhasil Didaftarkan!</strong> Berkas usulan telah masuk ke sistem SIKMA Kimia UB dan siap diproses verifikasi oleh Koordinator KLK. Mengarahkan ke Form KLK...
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitBaru} className="space-y-6 text-xs">
            {/* Mahasiswa Info & Dropdown Pemilihan (Khusus Admin/Dosen) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              {!isMahasiswa && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#002B49]" />
                      <span>Pilih Mahasiswa Pemohon KLK</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Sinkron: {mahasiswaList.length} Mahasiswa
                      </span>
                    </div>
                  </div>

                  {/* Searchable Combobox Component */}
                  <div ref={mhsDropdownRef} className="relative">
                    {/* Trigger Card displaying current selected student */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsMhsDropdownOpen((prev) => !prev)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsMhsDropdownOpen((prev) => !prev);
                        }
                      }}
                      className={`w-full p-2.5 bg-white border rounded-xl cursor-pointer transition shadow-2xs flex items-center justify-between gap-2 text-left ${
                        isMhsDropdownOpen
                          ? 'border-[#002B49] ring-2 ring-[#002B49]/20'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#002B49] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {currentStudentData?.nama ? currentStudentData.nama.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {currentStudentData ? currentStudentData.nama : 'Pilih Mahasiswa...'}
                            </span>
                            {currentStudentData && (
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                NIM: {currentStudentData.nim}
                              </span>
                            )}
                          </div>
                          {currentStudentData && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                              <span>Angkatan {currentStudentData.angkatan}</span>
                              <span>•</span>
                              <span>Semester {currentStudentData.semester}</span>
                              <span>•</span>
                              <span className="truncate">PA: {currentStudentData.dosenPANama || '-'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {isMhsDropdownOpen ? 'Tutup' : 'Cari / Pilih'}
                        </span>
                        <div className="p-1 rounded text-slate-500 hover:bg-slate-100">
                          {isMhsDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#002B49]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Popover with Search & Filtered List */}
                    {isMhsDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        {/* Live Search Input Header */}
                        <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
                          <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Ketik Nama, NIM, Angkatan, atau Dosen PA untuk mencari..."
                              value={mhsSearchQuery}
                              onChange={(e) => setMhsSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#002B49] focus:border-transparent"
                            />
                            {mhsSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setMhsSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
                                title="Hapus pencarian"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                            <span>
                              Ditemukan <strong className="text-slate-800">{filteredMhsPemohon.length}</strong> dari {mahasiswaList.length} mahasiswa
                            </span>
                            {mhsSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setMhsSearchQuery('')}
                                className="text-[#002B49] hover:underline font-semibold"
                              >
                                Reset filter
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of Filtered Students */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {filteredMhsPemohon.length === 0 ? (
                            <div className="p-6 text-center text-slate-500">
                              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                              <p className="font-semibold text-slate-700 text-xs">Mahasiswa tidak ditemukan</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Tidak ada data yang cocok dengan "{mhsSearchQuery}"
                              </p>
                              <button
                                type="button"
                                onClick={() => setMhsSearchQuery('')}
                                className="mt-2 text-xs font-semibold text-[#002B49] hover:underline inline-flex items-center gap-1"
                              >
                                Tampilkan semua mahasiswa
                              </button>
                            </div>
                          ) : (
                            filteredMhsPemohon.map((m) => {
                              const isSelected =
                                (formSelectedMhsId ? formSelectedMhsId === m.id : currentStudentData?.id === m.id);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setFormSelectedMhsId(m.id);
                                    setIsMhsDropdownOpen(false);
                                    setMhsSearchQuery('');
                                  }}
                                  className={`w-full text-left p-2.5 transition flex items-center justify-between gap-3 hover:bg-slate-50 ${
                                    isSelected
                                      ? 'bg-blue-50/70 border-l-4 border-[#002B49]'
                                      : 'border-l-4 border-transparent'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-slate-900 text-xs">
                                        {m.nama}
                                      </span>
                                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 border border-blue-200">
                                        {m.nim}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                        Angkatan {m.angkatan}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                                        Sem. {m.semester}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                                      <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                      <span className="truncate">Dosen PA: {m.dosenPANama || '-'}</span>
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0">
                                    {isSelected ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-[#002B49] text-white shadow-2xs">
                                        <Check className="w-3 h-3" />
                                        Terpilih
                                      </span>
                                    ) : (
                                      <span className="inline-block text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                                        Pilih
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <span>💡</span>
                    <span>
                      Pilih mahasiswa melalui kolom pencarian di atas (berdasarkan Nama, NIM, Angkatan, atau Dosen PA). Biodata di bawah akan terisi otomatis.
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-200">
                <div>
                  <label className="text-slate-500 block text-[11px]">Nama Mahasiswa</label>
                  <div className="font-bold text-slate-900 mt-0.5 text-xs">{currentStudentData.nama}</div>
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">NIM & Semester</label>
                  <div className="font-bold text-slate-900 mt-0.5 text-xs">
                    {currentStudentData.nim} (Semester {currentStudentData.semester})
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">Dosen PA (Pembimbing Akademik)</label>
                  <div className="font-bold text-slate-900 mt-0.5 text-xs">{currentStudentData.dosenPANama}</div>
                </div>
              </div>
            </div>

            {/* Pilihan Semester (dari Master Data Semester) & Skema Kegiatan Luar Kampus (KLK) Bersebelahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pilihan Semester (dari Master Data Semester) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <label className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#002B49]" />
                      <span>Semester</span>
                      <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Data Semester
                    </span>
                  </label>
                  <select
                    id="select-semester-klk"
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs font-semibold text-slate-800 shadow-xs"
                  >
                    {semesterOptions.map((sem) => (
                      <option key={sem.id} value={sem.namaSemester}>
                        {sem.namaSemester} {sem.status === 'Aktif' ? '• (Aktif)' : `• (${sem.status})`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pilihan semester pelaksanaan dari master data Semester (Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031).
                  </p>
                </div>
              </div>

              {/* Skema Kegiatan Luar Kampus (KLK) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <label className="font-bold text-slate-800 flex items-center justify-between mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#002B49]" />
                      <span>Skema Kegiatan Luar Kampus (KLK)</span>
                      <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Pilihan Skema Resmi
                    </span>
                  </label>
                  <select
                    id="select-skema-klk-baru"
                    value={formSkema}
                    onChange={(e) => setFormSkema(e.target.value as SkemaKLK)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <option value="PKL">PKL</option>
                    <option value="Magang Berdampak (Prodi)">Magang Berdampak (Prodi)</option>
                    <option value="Magang Berdampak (Fakultas)">Magang Berdampak (Fakultas)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pilih skema pelaksanaan KLK: PKL, Magang Berdampak (Prodi), atau Magang Berdampak (Fakultas).
                  </p>
                </div>
              </div>
            </div>

            {/* Usulan Mata Kuliah Konversi (Pilihan 1 atau Lebih dengan Kombinasi 4, 7, 10, 13, 16 SKS) */}
            <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#002B49]" />
                    <span>Usulan Mata Kuliah Konversi</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mahasiswa dapat memilih <strong>1 atau lebih dari 1 usulan mata kuliah konversi</strong>. Total akumulasi beban SKS harus memenuhi salah satu kombinasi: <strong>4, 7, 10, 13, atau 16 SKS</strong>.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#002B49]/10 text-[#002B49] border border-[#002B49]/20">
                    Kombinasi 4, 7, 10, 13, 16 SKS
                  </span>
                </div>
              </div>

              {/* Baris Pilihan Kombinasi Target SKS (4, 7, 10, 13, 16 SKS) & Live Status Perhitungan */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#002B49]" />
                    <span>Pilihan Target Kombinasi SKS:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {TARGET_KOMBINASI_SKS_KLK.map((target) => {
                      const isTargetActive = formTotalSks === target;
                      return (
                        <label
                          key={target}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            isTargetActive
                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs ring-2 ring-[#002B49]/20'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name="radio-kombinasi-sks-target"
                            id={`radio-target-${target}-sks`}
                            checked={isTargetActive}
                            onChange={() => handleSelectRadioTargetSks(target)}
                            className="w-3.5 h-3.5 text-[#002B49] focus:ring-[#002B49] cursor-pointer"
                          />
                          <span>{target} SKS</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Status Live Perhitungan Kombinasi SKS */}
                <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium">Akumulasi Terpilih</div>
                    <div className="text-xs font-extrabold text-[#002B49]">
                      {formTotalSks} SKS ({formMkKonversiList.length} Mata Kuliah)
                    </div>
                  </div>
                  {hasSerialConflict ? (
                    <div className="px-3 py-1.5 bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>Konflik Seri ({formSerialConflicts.length} Pasangan)</span>
                    </div>
                  ) : isFormKombinasiSksValid ? (
                    <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Kombinasi Valid: {formTotalSks} SKS</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Total {formTotalSks} SKS (Belum Sesuai 4, 7, 10, 13, 16)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Toast / Peringatan Validasi Pilihan Mata Kuliah */}
              {conflictWarningToast && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-rose-950">
                        {conflictWarningToast.includes('16 SKS')
                          ? 'Peringatan Batas Maksimal SKS (Maksimal 16 SKS):'
                          : 'Peringatan Larangan Mata Kuliah Berseri / Berurutan:'}
                      </strong>
                      <span className="text-[11px] text-rose-800 leading-relaxed mt-0.5 block">
                        {conflictWarningToast}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConflictWarningToast(null)}
                    className="text-rose-400 hover:text-rose-700 p-1 shrink-0"
                    title="Tutup peringatan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Pencarian & Filter Cepat Mata Kuliah */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="input-cari-mk-konversi"
                    placeholder="Ketik kode, nama mata kuliah, atau CPL..."
                    value={searchMkKonversi}
                    onChange={(e) => setSearchMkKonversi(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:ring-2 focus:ring-[#002B49] text-slate-800"
                  />
                  {searchMkKonversi && (
                    <button
                      type="button"
                      onClick={() => setSearchMkKonversi('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
                  <span>
                    Menampilkan <strong className="text-slate-800">{filteredMkKonversiList.length}</strong> dari {DAFTAR_MATA_KULIAH_KONVERSI_KLK.length} MK
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectRadioTargetSks(4)}
                      className="px-2 py-0.5 rounded text-[11px] text-[#002B49] font-bold hover:bg-slate-200 transition"
                      title="Kembalikan ke paket default 4 SKS (PKL)"
                    >
                      Reset (4 SKS)
                    </button>
                    {formMkKonversiList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormMkKonversiList([]);
                          setConflictWarningToast(null);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] text-rose-600 font-medium hover:bg-rose-50 transition"
                        title="Kosongkan seluruh pilihan mata kuliah"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 23 Mata Kuliah Konversi & Proteksi Mata Kuliah Berseri */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1 border border-slate-200 rounded-xl bg-white shadow-inner">
                {filteredMkKonversiList.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan mata kuliah konversi yang sesuai kata kunci &ldquo;{searchMkKonversi}&rdquo;.
                  </div>
                ) : (
                  filteredMkKonversiList.map((mkStr) => {
                    const info = parseMkKonversiString(mkStr);
                    const isSelected = formMkKonversiList.includes(mkStr);
                    const conflictWithSelected = !isSelected
                      ? getSerialConflictWith(mkStr, formMkKonversiList)
                      : null;
                    const isSerialLocked = Boolean(conflictWithSelected);
                    const willExceed16Sks = !isSelected && formTotalSks + info.sks > 16;

                    return (
                      <div
                        key={mkStr}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => handleToggleMkKonversi(mkStr)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleMkKonversi(mkStr);
                          }
                        }}
                        title={
                          isSerialLocked && conflictWithSelected
                            ? `Terkunci: Tidak boleh berpasangan dengan ${parseMkKonversiString(conflictWithSelected).nama} (mata kuliah berseri)`
                            : willExceed16Sks
                            ? `Batas Maksimal 16 SKS: Menambahkan ${info.nama} (${info.sks} SKS) akan membuat total menjadi ${formTotalSks + info.sks} SKS (melebihi batas maksimal 16 SKS).`
                            : undefined
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 relative group ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#002B49] ring-1 ring-[#002B49]/30 shadow-xs'
                            : isSerialLocked
                            ? 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300 hover:bg-amber-50/50'
                            : willExceed16Sks
                            ? 'bg-slate-50/60 border-slate-200/80 opacity-60 hover:opacity-85 hover:border-slate-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Circle Indicator */}
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#002B49] bg-white ring-2 ring-[#002B49]/20'
                                : isSerialLocked
                                ? 'border-amber-400 bg-amber-50'
                                : willExceed16Sks
                                ? 'border-slate-300 bg-slate-100'
                                : 'border-slate-300 bg-white group-hover:border-slate-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#002B49] animate-scale-in" />
                            )}
                            {isSerialLocked && !isSelected && (
                              <Lock className="w-2 h-2 text-amber-600" />
                            )}
                          </div>
                        </div>

                        {/* Detail Mata Kuliah */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {info.kode}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[#002B49] text-white'
                                  : 'bg-blue-100 text-[#002B49]'
                              }`}
                            >
                              {info.sks} SKS
                            </span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {info.cpl}
                            </span>
                            {isSerialLocked && conflictWithSelected && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5 text-amber-700" />
                                <span>Seri Terkunci</span>
                              </span>
                            )}
                            {willExceed16Sks && !isSerialLocked && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5 text-slate-500" />
                                <span>+{info.sks} SKS (&gt;16 SKS)</span>
                              </span>
                            )}
                          </div>

                          <div className={`font-bold text-xs mt-1.5 leading-snug ${
                            isSerialLocked || willExceed16Sks ? 'text-slate-700' : 'text-slate-900'
                          }`}>
                            {info.nama || info.kode}
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {info.fullString}
                          </div>

                          {isSerialLocked && conflictWithSelected && (
                            <div className="text-[10px] font-medium text-amber-700 mt-1 flex items-center gap-1">
                              <span>⚠ Tidak boleh berpasangan dengan {parseMkKonversiString(conflictWithSelected).nama}</span>
                            </div>
                          )}
                          {willExceed16Sks && !isSerialLocked && (
                            <div className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                              <span>⚠ Melebihi batas 16 SKS jika ditambahkan (akan menjadi {formTotalSks + info.sks} SKS)</span>
                            </div>
                          )}
                        </div>

                        {/* Indikator Terpilih */}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <span className="w-2 h-2 rounded-full bg-[#002B49] inline-block" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Banner Panduan & Validasi Akumulasi SKS & Konflik Seri */}
              {hasSerialConflict ? (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-950">
                      Konflik Terdeteksi: Mata Kuliah Berseri Tidak Boleh Berpasangan
                    </div>
                    <div className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                      Pilihan Anda saat ini memuat pasangan mata kuliah berseri: <strong>{formSerialConflicts.map((c) => c.pairName).join(', ')}</strong>. Sesuai ketentuan, mata kuliah berseri (seperti Magang Industri I dan II, atau Magang Penelitian I dan II) tidak boleh diambil bersamaan dalam 1 periode KLK. Harap batalkan salah satu dari mata kuliah tersebut.
                    </div>
                  </div>
                </div>
              ) : isFormKombinasiSksValid ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      Kombinasi SKS Memenuhi Ketentuan ({formTotalSks} SKS) & Tanpa Konflik Seri
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Anda telah memilih <strong>{formMkKonversiList.length} mata kuliah konversi</strong> dengan total <strong>{formTotalSks} SKS</strong> tanpa adanya mata kuliah berseri yang berpasangan. Kombinasi ini memenuhi seluruh aturan kurikulum KLK Departemen Kimia (pilihan kombinasi: 4, 7, 10, 13, atau 16 SKS).
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      Perhatian: Total Akumulasi SKS Saat Ini ({formTotalSks} SKS)
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Jumlah SKS usulan mata kuliah konversi yang dipilih saat ini belum memenuhi kombinasi resmi yang diizinkan. Silakan pilih atau sesuaikan kombinasi mata kuliah hingga totalnya bernilai tepat <strong>4 SKS</strong>, <strong>7 SKS</strong>, <strong>10 SKS</strong>, <strong>13 SKS</strong>, atau <strong>16 SKS</strong> tanpa memilih mata kuliah berseri secara berpasangan.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nama Mitra & Alamat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Nama Instansi / Perusahaan / Mitra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formMitra}
                  onChange={(e) => setFormMitra(e.target.value)}
                  placeholder="Contoh: PT Petrokimia Gresik, PT Kalbe Farma, Pusat Riset Kimia BRIN..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Alamat Lengkap Lokasi Kegiatan Mitra
                </label>
                <input
                  type="text"
                  value={formAlamatMitra}
                  onChange={(e) => setFormAlamatMitra(e.target.value)}
                  placeholder="Kota/Kabupaten, Provinsi, Kawasan Industri..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                />
              </div>
            </div>

            {/* Deskripsi Singkat Pekerjaan */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Deskripsi Singkat Pekerjaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formBidangPekerjaan}
                onChange={(e) => setFormBidangPekerjaan(e.target.value)}
                placeholder="Contoh: Divisi Quality Control (QC) - Analisis Spektrofotometri & Kromatografi Produk..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
              />
            </div>

            {/* Pembimbing Lapangan & Dosen Pembimbing */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Nama Pembimbing Lapangan
                  </label>
                  <input
                    type="text"
                    value={formMentor}
                    onChange={(e) => setFormMentor(e.target.value)}
                    placeholder="Nama & Jabatan Pembimbing Lapangan Mitra"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Dosen Pembimbing KLK (Departemen Kimia) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formDosenKLK}
                    onChange={(e) => setFormDosenKLK(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                  >
                    {dosenList.map((d) => (
                      <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                        {d.nama}, {d.gelar} ({d.bidang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kontak Pembimbing Lapangan (2 Bagian Terpisah: No HP dan Nama Email) */}
              <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <label className="font-bold text-slate-800 text-xs">
                    Kontak Pembimbing Lapangan
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    No HP & Email Pembimbing Lapangan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block text-xs mb-1.5">
                      No HP
                    </label>
                    <input
                      type="tel"
                      id="input-hp-pembimbing-lapangan"
                      value={formHpPembimbing}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormHpPembimbing(val);
                        setFormKontakMentor(
                          [val.trim(), formEmailPembimbing.trim()].filter(Boolean).join(' / ')
                        );
                      }}
                      placeholder="Contoh: 081234567890"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Nomor telepon / WhatsApp resmi pembimbing lapangan
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block text-xs mb-1.5">
                      Nama Email
                    </label>
                    <input
                      type="email"
                      id="input-email-pembimbing-lapangan"
                      value={formEmailPembimbing}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormEmailPembimbing(val);
                        setFormKontakMentor(
                          [formHpPembimbing.trim(), val.trim()].filter(Boolean).join(' / ')
                        );
                      }}
                      placeholder="Contoh: pembimbing.lapangan@perusahaan.com"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Alamat email resmi pembimbing lapangan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Periode Kegiatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Rencana Tanggal Mulai Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formTglMulai}
                  onChange={(e) => setFormTglMulai(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Rencana Tanggal Selesai Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formTglSelesai}
                  onChange={(e) => setFormTglSelesai(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] text-xs"
                />
              </div>
            </div>

            {/* Upload Berkas Pengajuan KLK */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#002B49] text-white flex items-center justify-center shadow-xs">
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Upload Berkas Pengajuan KLK
                    </h3>
                    <p className="text-xs text-slate-500">
                      Unggah berkas kelengkapan melalui tombol <strong>Browse</strong>, <strong>Submit</strong>, dan periksa via <strong>Preview</strong> (PDF / DOCX, maks. 5 MB)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-[#002B49]" />
                    {[
                      formBerkasBaruMap.surat_lamaran,
                      formBerkasBaruMap.proposal,
                      formBerkasBaruMap.cv_mahasiswa,
                      formBerkasBaruMap.transkrip_akademik
                    ].filter((b) => b.status === 'uploaded').length} / 4 Berkas Terunggah
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(['surat_lamaran', 'proposal', 'cv_mahasiswa', 'transkrip_akademik'] as const).map((key) => {
                  const item = formBerkasBaruMap[key];
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#002B49]/40 transition-all shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      {/* Header Card: Icon, Label, Description & Status Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                item.status === 'uploaded'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'selected'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs truncate">
                                {item.label}
                              </h4>
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {item.status === 'uploaded' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Terunggah</span>
                            </span>
                          ) : item.status === 'selected' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0 border border-blue-300">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>Dipilih</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 shrink-0 border border-slate-200">
                              Belum Ada
                            </span>
                          )}
                        </div>

                        {/* File Name Info Display */}
                        <div className="mt-2 text-xs">
                          {item.fileName ? (
                            <div className="text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                              <span className="font-mono truncate font-medium text-slate-800" title={item.fileName}>
                                📎 {item.fileName}
                              </span>
                              <span className="text-slate-400 shrink-0 font-mono text-[10px]">
                                {item.fileSize}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic px-1 py-1">
                              Belum ada berkas dipilih (format: PDF / DOCX, maks. 5 MB)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hidden Native File Input */}
                      <input
                        type="file"
                        id={`file-input-baru-${item.id}`}
                        className="hidden"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => handleBrowseBerkasBaru(key, e)}
                      />

                      {/* Action Buttons: Browse, Submit, Preview */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        {/* 1. BROWSE */}
                        <button
                          type="button"
                          id={`btn-browse-baru-${item.id}`}
                          onClick={() => document.getElementById(`file-input-baru-${item.id}`)?.click()}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs rounded-lg border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title={`Pilih berkas untuk ${item.label}`}
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Browse</span>
                        </button>

                        {/* 2. SUBMIT */}
                        <button
                          type="button"
                          id={`btn-submit-baru-${item.id}`}
                          onClick={() => handleSubmitBerkasBaru(key)}
                          disabled={!item.fileName}
                          className={`flex-1 py-1.5 px-2 font-bold text-xs rounded-lg shadow-2xs inline-flex items-center justify-center gap-1 transition-colors ${
                            item.fileName
                              ? item.status === 'uploaded'
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                                : 'bg-[#002B49] hover:bg-[#003861] text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          title={item.fileName ? `Submit / Unggah ${item.label}` : 'Pilih berkas terlebih dahulu via Browse'}
                        >
                          <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{item.status === 'uploaded' ? 'Tersubmit' : 'Submit'}</span>
                        </button>

                        {/* 3. PREVIEW */}
                        <button
                          type="button"
                          id={`btn-preview-baru-${item.id}`}
                          onClick={() => handlePreviewBerkasBaru(key)}
                          disabled={!item.fileName}
                          className={`flex-1 py-1.5 px-2 font-bold text-xs rounded-lg border shadow-2xs inline-flex items-center justify-center gap-1 transition-colors ${
                            item.fileName
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                          title={item.fileName ? `Pratinjau ${item.label}` : 'Belum ada berkas untuk dipratinjau'}
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Pastikan data kegiatan, mata kuliah konversi, dan berkas persyaratan telah terisi sebelum menyimpan usulan.
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSubTab('pengajuan-list')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-klk-baru"
                  className="px-6 py-2.5 bg-[#002B49] hover:bg-[#003861] active:bg-[#00243d] text-white font-bold rounded-lg text-xs shadow-sm flex items-center space-x-2 cursor-pointer transition-colors"
                  title="Simpan & Ajukan Usulan KLK"
                >
                  <Send className="w-4 h-4 text-[#D4AF37]" />
                  <span>Simpan & Ajukan Usulan KLK</span>
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )}

      {/* TAB 3: FORM KLK RESMI (BUKTI RENCANA STUDI & CETAK) */}
      {subTab === 'form-klk-cetak' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-slate-500">Pilih Berkas Pengajuan:</span>
              <select
                value={selectedKlkId}
                onChange={(e) => setSelectedKlkId(e.target.value)}
                className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5"
              >
                {roleScopedKlkList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kodePendaftaran} — {k.mahasiswaNama} ({k.namaMitra})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#002B49] text-white text-xs font-bold rounded-lg hover:bg-[#003861] shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Form KLK (PDF)</span>
            </button>
          </div>

          {selectedKlk ? (
            <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
              {/* Kop Surat Departemen Kimia FSTeM UB */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-[#002B49] text-white flex items-center justify-center font-bold text-xl rounded-lg shadow-sm">
                      UB
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                      </div>
                      <div className="text-sm font-bold text-slate-900 uppercase">
                        UNIVERSITAS BRAWIJAYA • FAKULTAS MIPA
                      </div>
                      <div className="text-base font-extrabold text-[#002B49] uppercase tracking-wide">
                        DEPARTEMEN KIMIA
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Gedung Jurusan Kimia FSTeM UB, Jl. Veteran, Malang 65145 • Telp: (0341) 575838 • Email: kimia@ub.ac.id • Web: kimia.ub.ac.id
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="border border-slate-300 p-2 rounded bg-slate-50 inline-block text-center">
                      <div className="text-[9px] text-slate-500 font-mono">FORM KLK-01</div>
                      <div className="font-mono text-xs font-extrabold text-[#002B49]">
                        {selectedKlk.kodePendaftaran}
                      </div>
                      <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                        TERVERIFIKASI SISTEM
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase underline tracking-wide">
                  FORMULIR PERSETUJUAN KEGIATAN MAHASISWA DI LUAR KAMPUS (KLK)
                </h3>
                <div className="text-xs text-slate-600 mt-1">
                  Bukti Rencana Studi & Instrumen Kontrol Kegiatan Magang Regular / Riset Industri
                </div>
              </div>

              {/* Data Mahasiswa & Rencana Kegiatan */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-[#002B49] uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                    I. IDENTITAS MAHASISWA
                  </h4>
                  <div className="grid grid-cols-3 gap-2 pl-2">
                    <div className="text-slate-500">Nama Lengkap Mahasiswa</div>
                    <div className="col-span-2 font-bold text-slate-900">: {selectedKlk.mahasiswaNama}</div>

                    <div className="text-slate-500">Nomor Induk Mahasiswa (NIM)</div>
                    <div className="col-span-2 font-mono font-semibold text-slate-900">: {selectedKlk.nim}</div>

                    <div className="text-slate-500">Program Studi / Semester</div>
                    <div className="col-span-2 text-slate-900">
                      : Sarjana (S1) Kimia • Semester {selectedKlk.semester}
                    </div>

                    <div className="text-slate-500">Semester Akademik KLK</div>
                    <div className="col-span-2 font-bold text-[#002B49]">
                      : {selectedKlk.namaSemester || 'Ganjil 2026 / 2027'}
                    </div>

                    <div className="text-slate-500">Status Usulan KLK</div>
                    <div className="col-span-2">
                      : <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedKlk.status === 'Disetujui' || selectedKlk.status === 'Disetujui / Sedang Berjalan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedKlk.status === 'Ditolak'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedKlk.status}
                      </span>
                    </div>

                    <div className="text-slate-500">Dosen Pembimbing Akademik (PA)</div>
                    <div className="col-span-2 text-slate-900">: {student.dosenPANama}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#002B49] uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                    II. RENCANA KEGIATAN LUAR KAMPUS (KLK)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 pl-2">
                    <div className="text-slate-500">Skema Program KLK</div>
                    <div className="col-span-2 font-bold text-[#002B49]">: {selectedKlk.skema}</div>

                    <div className="text-slate-500">Nama Instansi / Mitra</div>
                    <div className="col-span-2 font-bold text-slate-900">: {selectedKlk.namaMitra}</div>

                    <div className="text-slate-500">Alamat Lokasi Mitra</div>
                    <div className="col-span-2 text-slate-800">: {selectedKlk.alamatMitra}</div>

                    <div className="text-slate-500">Bidang Pekerjaan / Laboratorium</div>
                    <div className="col-span-2 text-slate-800 font-medium">: {selectedKlk.bidangPekerjaan}</div>

                    <div className="text-slate-500">Periode Pelaksanaan</div>
                    <div className="col-span-2 text-slate-800">
                      : {selectedKlk.tanggalMulai} s.d. {selectedKlk.tanggalSelesai}
                    </div>

                    <div className="text-slate-500">Beban SKS yang Diakui</div>
                    <div className="col-span-2 font-bold text-slate-900">: {selectedKlk.sksDiakui} SKS Matakuliah Kimia</div>

                    <div className="text-slate-500">Nomor Surat Tugas Resmi</div>
                    <div className="col-span-2 font-mono text-slate-800">
                      : {selectedKlk.nomorSuratTugas || 'Dalam proses penerbitan oleh Subbag Akademik'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#002B49] uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                    III. PEMBIMBING & MENTOR
                  </h4>
                  <div className="grid grid-cols-3 gap-2 pl-2">
                    <div className="text-slate-500">Dosen Pembimbing KLK (Departemen)</div>
                    <div className="col-span-2 font-bold text-slate-900">: {selectedKlk.dosenPembimbingKLK}</div>

                    <div className="text-slate-500">Pembimbing Lapangan (Mitra)</div>
                    <div className="col-span-2 text-slate-900">: {selectedKlk.mentorIndustri}</div>

                    <div className="text-slate-500">Kontak Pembimbing Lapangan</div>
                    <div className="col-span-2 text-slate-800">: {selectedKlk.kontakMentor}</div>
                  </div>
                </div>

                {/* Catatan Komitmen */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 mt-4 leading-relaxed">
                  <strong>Pernyataan Mahasiswa:</strong> Saya menyatakan bersedia mentaati seluruh peraturan tata tertib,
                  keselamatan kerja laboratorium (K3), menjaga rahasia industri milik mitra kerja sama, mengisi logbook mingguan
                  secara berkala di portal SIKMA Kimia UB, serta menyusun laporan akhir sesuai pedoman KLK Departemen Kimia FSTeM Universitas Brawijaya.
                </div>

                {/* Tanda Tangan Pengesahan 3 Kolom */}
                <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[11px]">
                  <div>
                    <div className="text-slate-600">Mengetahui,</div>
                    <div className="font-medium text-slate-800">Dosen Pembimbing Akademik (PA)</div>
                    <div className="my-6">
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        Disetujui Digital
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 underline">{student.dosenPANama}</div>
                    <div className="text-slate-500 text-[10px]">NIP. 197008121997021001</div>
                  </div>

                  <div>
                    <div className="text-slate-600">Malang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="font-medium text-slate-800">Mahasiswa Pemohon</div>
                    <div className="my-6">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-semibold">
                        Tertanda Tangan
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 underline">{selectedKlk.mahasiswaNama}</div>
                    <div className="text-slate-500 text-[10px]">NIM. {selectedKlk.nim}</div>
                  </div>

                  <div>
                    <div className="text-slate-600">Mengesahkan,</div>
                    <div className="font-medium text-slate-800">Koordinator KLK Kimia</div>
                    <div className="my-6">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#002B49] text-[#D4AF37] rounded text-[10px] font-bold shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        <span>KIMIA FSTeM UB</span>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 underline">Dr. Anna Safitri, M.Sc., Ph.D</div>
                    <div className="text-slate-500 text-[10px]">NIP. 197705152003122002</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
              Belum ada data KLK yang dipilih.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LOGBOOK MINGGUAN KLK */}
      {subTab === 'logbook-mingguan' && (() => {
        const hasRegisteredKlk = klkSimulationMode === 'belum_daftar'
          ? false
          : klkSimulationMode === 'belum_mulai' || klkSimulationMode === 'sudah_mulai'
          ? true
          : roleScopedKlkList.length > 0 && !!selectedKlk;

        const isKlkStarted = klkSimulationMode === 'belum_daftar'
          ? false
          : klkSimulationMode === 'belum_mulai'
          ? false
          : klkSimulationMode === 'sudah_mulai'
          ? true
          : hasRegisteredKlk && hasStudentStartedKlk(selectedKlk);

        const showEmptyForStudent = isMahasiswa && (!hasRegisteredKlk || !isKlkStarted);

        return (
          <div className="space-y-6">
            {/* Header / Selector Bar: Tampil jika bukan mahasiswa atau jika mahasiswa sudah memiliki pendaftaran dan kegiatan dimulai */}
            {!showEmptyForStudent && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-slate-600">Pilih Kegiatan KLK:</span>
                  <select
                    value={selectedKlkId}
                    onChange={(e) => setSelectedKlkId(e.target.value)}
                    className="text-xs font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-[#002B49]"
                  >
                    {roleScopedKlkList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.mahasiswaNama} — {k.namaMitra} ({k.skema})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-500">
                  Dosen Pembimbing:{' '}
                  <strong className="text-slate-800">
                    {selectedKlk ? selectedKlk.dosenPembimbingKLK : '-'}
                  </strong>
                </div>
              </div>
            )}

            {/* KONDISI 1: MAHASISWA BELUM MELAKUKAN PENDAFTARAN BARU */}
            {isMahasiswa && !hasRegisteredKlk && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Belum Melakukan Pendaftaran Baru KLK</span>
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">
                    Tab Logbook Mingguan KLK Masih Kosong
                  </h3>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Anda belum memiliki data pengajuan pendaftaran Kegiatan Mahasiswa di Luar Kampus (KLK). 
                    Sesuai ketentuan, formulir pengisian logbook mingguan dan catatan aktivitas industri/riset baru akan terbuka setelah Anda melakukan pendaftaran baru dan kegiatan KLK resmi dimulai.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-empty-daftar-baru"
                    onClick={() => setSubTab('form-baru')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                    <span>Buka Form Pengajuan KLK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab('pengajuan-list')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Daftar Pengajuan KLK</span>
                  </button>
                </div>

                {/* Alur Tahapan Informasi */}
                <div className="mt-6 pt-5 border-t border-slate-100 text-left">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    Tahapan Prosedur Menuju Logbook Mingguan:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#002B49] block mb-1">1. Scan QR Sosialisasi</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">Ikuti sosialisasi dan scan kode QR resmi dari admin.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#002B49] block mb-1">2. Pendaftaran Baru</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">Isi formulir rencana kegiatan, mitra industri, dan usulan SKS.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#002B49] block mb-1">3. KLK Dimulai & Logbook</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">Setelah usulan disetujui & mulai kegiatan, logbook aktif.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KONDISI 2: MAHASISWA SUDAH MENDAFTAR, TAPI BELUM MEMULAI KLK */}
            {isMahasiswa && hasRegisteredKlk && !isKlkStarted && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <Timer className="w-8 h-8 text-amber-600" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Kegiatan KLK Belum Dimulai &bull; Status: {selectedKlk?.status || 'Diproses'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Tab Logbook Mingguan KLK Masih Kosong
                  </h3>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {selectedKlk?.status === 'Ditolak'
                      ? 'Pengajuan pendaftaran KLK Anda berstatus Ditolak. Anda belum dapat memulai kegiatan maupun mengisi logbook mingguan. Silakan konsultasikan dengan Koordinator KLK atau ajukan pendaftaran baru.'
                      : selectedKlk?.status === 'Disetujui' || selectedKlk?.status === 'Disetujui / Sedang Berjalan'
                      ? `Pendaftaran KLK Anda telah disetujui, namun periode pelaksanaan kegiatan baru akan dimulai pada tanggal ${selectedKlk?.tanggalMulai || '-'}. Form pengisian Logbook Mingguan akan otomatis aktif saat kegiatan resmi dimulai.`
                      : `Pengajuan KLK Anda di ${selectedKlk?.namaMitra || 'Mitra Industri'} saat ini masih dalam proses peninjauan dan verifikasi Departemen Kimia (Status: "${selectedKlk?.status || 'Diproses'}"). Form pengisian dan riwayat Logbook Mingguan akan otomatis aktif setelah pendaftaran disetujui dan kegiatan resmi dimulai.`}
                  </p>
                </div>

                {/* Kartu Ringkasan Data Usulan KLK */}
                {selectedKlk && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs max-w-lg mx-auto space-y-2">
                    <div className="font-bold text-[#002B49] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#002B49]" />
                        <span>Data Pendaftaran KLK Anda</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{selectedKlk.kodePendaftaran}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                      <span className="text-slate-500">Mitra Instansi:</span>
                      <span className="col-span-2 font-bold text-slate-800">{selectedKlk.namaMitra}</span>

                      <span className="text-slate-500">Skema KLK:</span>
                      <span className="col-span-2 text-slate-700">{selectedKlk.skema} ({selectedKlk.sksDiakui} SKS)</span>

                      <span className="text-slate-500">Periode Rencana:</span>
                      <span className="col-span-2 text-slate-700">{selectedKlk.tanggalMulai} s.d. {selectedKlk.tanggalSelesai}</span>

                      <span className="text-slate-500">Dosen Pembimbing:</span>
                      <span className="col-span-2 text-slate-700">{selectedKlk.dosenPembimbingKLK || '-'}</span>

                      <span className="text-slate-500">Status Usulan:</span>
                      <span className="col-span-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedKlk.status === 'Disetujui' || selectedKlk.status === 'Disetujui / Sedang Berjalan'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : selectedKlk.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {selectedKlk.status}
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubTab('form-klk-cetak')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Lihat Bukti Form Pendaftaran KLK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab('pengajuan-list')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Daftar Pengajuan KLK</span>
                  </button>
                </div>
              </div>
            )}

            {/* KONDISI 3: BUKAN MAHASISWA ATAU MAHASISWA SUDAH MEMULAI KLK (LOGBOOK AKTIF) */}
            {!showEmptyForStudent && selectedKlk && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Input Logbook Baru (Untuk Mahasiswa) */}
                <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-3">
                    <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                    <span>Input Logbook Mingguan</span>
                  </div>

                  {logbookSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Logbook mingguan berhasil disimpan!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveLogbook} className="space-y-3 text-xs">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Minggu Ke-</label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={logMingguKe}
                        onChange={(e) => setLogMingguKe(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">Tgl Mulai</label>
                        <input
                          type="date"
                          value={logTglMulai}
                          onChange={(e) => setLogTglMulai(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">Tgl Selesai</label>
                        <input
                          type="date"
                          value={logTglSelesai}
                          onChange={(e) => setLogTglSelesai(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Deskripsi Aktivitas Kimia / QC / R&D
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={logAktivitas}
                        onChange={(e) => setLogAktivitas(e.target.value)}
                        placeholder="Rincian kegiatan laboratorium atau analisis kimia yang dilakukan pada minggu ini..."
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Instrumen, Bahan, & Metode Pengujian
                      </label>
                      <input
                        type="text"
                        value={logAlatMetode}
                        onChange={(e) => setLogAlatMetode(e.target.value)}
                        placeholder="Contoh: Spektrofotometer UV-Vis, HPLC, AAS, titrasi asam-basa..."
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Hasil Temuan & Kendala Teknis
                      </label>
                      <textarea
                        rows={2}
                        value={logHasil}
                        onChange={(e) => setLogHasil(e.target.value)}
                        placeholder="Parameter yang diperoleh atau troubleshooting yang dijalankan..."
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#002B49] hover:bg-[#003861] text-white font-bold rounded-lg text-xs shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Logbook Mingguan</span>
                    </button>
                  </form>
                </div>

                {/* Daftar Logbook yang sudah tercatat */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Riwayat Logbook Mingguan: {selectedKlk.namaMitra}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Total {selectedKlk.logbooks.length} minggu laporan aktivitas tersimpan
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 font-semibold rounded text-slate-700">
                      Mentor: {selectedKlk.mentorIndustri}
                    </span>
                  </div>

                  {selectedKlk.logbooks.length === 0 ? (
                    <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                      Belum ada entri logbook mingguan untuk mahasiswa ini. Gunakan formulir di sebelah kiri untuk menambahkan laporan minggu pertama.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedKlk.logbooks.map((lb) => (
                        <div
                          key={lb.id}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-[#002B49] text-white font-bold rounded text-[11px]">
                                Minggu Ke-{lb.mingguKe}
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                {lb.tanggalMulai} s.d. {lb.tanggalSelesai}
                              </span>
                            </div>

                            <div>
                              {lb.statusVerifikasi === 'Disetujui Mentor' && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Disetujui Mentor ({lb.tanggalVerifikasi})</span>
                                </span>
                              )}
                              {lb.statusVerifikasi === 'Menunggu Verifikasi' && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                                  <Clock className="w-3 h-3" />
                                  <span>Menunggu Verifikasi</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-slate-800">Aktivitas Pekerjaan:</div>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{lb.aktivitas}</p>
                          </div>

                          {lb.alatDanMetode && (
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                              <span className="font-medium text-slate-700">Metode & Instrumen: </span>
                              <span className="text-slate-600">{lb.alatDanMetode}</span>
                            </div>
                          )}

                          {lb.hasilDanKendala && (
                            <div>
                              <span className="font-medium text-slate-700">Temuan & Hasil: </span>
                              <span className="text-slate-600">{lb.hasilDanKendala}</span>
                            </div>
                          )}

                          {lb.catatanMentor && (
                            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
                              <strong>Catatan Pembimbing Lapangan:</strong> {lb.catatanMentor}
                            </div>
                          )}

                          {/* Action buttons for verification */}
                          {(currentRole === 'dosen' || currentRole === 'admin' || currentRole === 'super_admin') &&
                            lb.statusVerifikasi === 'Menunggu Verifikasi' && (
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                                <button
                                  onClick={() =>
                                    onVerifyLogbook(
                                      selectedKlk.id,
                                      lb.id,
                                      'Disetujui Mentor',
                                      'Aktivitas minggu ini terverifikasi memenuhi capaian teknis laboratorium.'
                                    )
                                  }
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Setujui Logbook Ini</span>
                                </button>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Test Bar for Evaluator Testing (Role Mahasiswa) */}
            {isMahasiswa && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Panduan Pengujian Logbook Mahasiswa (Role Mahasiswa):</span>
                  </div>
                  {klkSimulationMode !== 'normal' && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                      Simulasi: {klkSimulationMode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Sesuai permintaan Anda, jika mahasiswa <strong>belum melakukan Pendaftaran Baru</strong> atau <strong>belum memulai KLK</strong> maka tab Logbook Mingguan menjadi kosong:
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setKlkSimulationMode('belum_daftar')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      klkSimulationMode === 'belum_daftar'
                        ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    1. Uji: Belum Mendaftar Baru (Logbook Kosong)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKlkSimulationMode('belum_mulai')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      klkSimulationMode === 'belum_mulai'
                        ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    2. Uji: Sudah Mendaftar tapi Belum Dimulai (Logbook Kosong)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKlkSimulationMode('sudah_mulai')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      klkSimulationMode === 'sudah_mulai'
                        ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    3. Uji: KLK Sudah Dimulai (Logbook Aktif)
                  </button>
                  {klkSimulationMode !== 'normal' && (
                    <button
                      type="button"
                      onClick={() => setKlkSimulationMode('normal')}
                      className="px-2.5 py-1 text-[11px] text-amber-900 font-semibold hover:underline cursor-pointer ml-auto"
                    >
                      Reset Data Asli
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 5: SEMINAR & PENILAIAN AKHIR KLK */}
      {subTab === 'penilaian-seminar' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-600">Pilih Kegiatan Mahasiswa:</span>
              <select
                value={selectedKlkId}
                onChange={(e) => {
                  setSelectedKlkId(e.target.value);
                  const found = roleScopedKlkList.find((k) => k.id === e.target.value);
                  if (found) {
                    setNilaiIndInput(found.nilaiIndustri || 90);
                    setNilaiDosInput(found.nilaiDosen || 88);
                  }
                }}
                className="text-xs font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5"
              >
                {roleScopedKlkList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.mahasiswaNama} — {k.namaMitra} ({k.skema})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-500">
              Status:{' '}
              <strong className="text-slate-800">
                {selectedKlk ? selectedKlk.status : '-'}
              </strong>
            </span>
          </div>

          {selectedKlk && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Input Penilaian Akhir (40% Mitra + 60% Dosen) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>Komponen Nilai Akhir KLK</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Bobot: 40% Mitra • 60% Dosen
                  </span>
                </div>

                {nilaiSavedAlert && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center space-x-2 text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Nilai akhir KLK berhasil dihitung dan disimpan ke transkrip!</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nilai dari Pembimbing Lapangan / Mitra Industri (Bobot 40%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={nilaiIndInput}
                      onChange={(e) => setNilaiIndInput(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Mencakup kedisiplinan, keselamatan lab, inisiatif, dan capaian target kerja kimia.
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nilai dari Dosen Pembimbing KLK UB (Bobot 60%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={nilaiDosInput}
                      onChange={(e) => setNilaiDosInput(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Mencakup kelengkapan logbook, kualitas naskah laporan KLK, dan penguasaan sains kimia.
                    </div>
                  </div>

                  {/* Perhitungan Nilai Rata-rata & Huruf */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-slate-500 text-[11px]">Skor Akhir Tertimbang:</div>
                      <div className="text-xl font-black text-[#002B49]">
                        {((nilaiIndInput * 0.4) + (nilaiDosInput * 0.6)).toFixed(1)} / 100
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 text-[11px]">Predikat Nilai:</div>
                      <div className="text-2xl font-black text-[#D4AF37]">
                        {(nilaiIndInput * 0.4) + (nilaiDosInput * 0.6) >= 80 ? 'A' : 'B+'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSimpanNilaiAkhir}
                    className="w-full py-2.5 bg-[#002B49] hover:bg-[#003861] text-white font-bold rounded-lg shadow-sm transition-all text-xs"
                  >
                    Simpan & Sahkan Nilai Akhir Mahasiswa
                  </button>
                </div>
              </div>

              {/* Box 2: Dokumen Akhir & Konversi SKS */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
                  <Layers className="w-4 h-4 text-[#002B49]" />
                  <span>Pelaporan Akhir & Matakuliah Konversi</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-semibold text-slate-800">Berkas Laporan Akhir:</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-slate-600 font-medium">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="truncate max-w-[200px]">
                          {selectedKlk.laporanAkhir || 'Draft_Laporan_Akhir_KLK.pdf'}
                        </span>
                      </div>
                      <button className="text-[11px] text-[#002B49] font-bold hover:underline">
                        Unduh Draft
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-700 mb-2">
                      Daftar Konversi Mata Kuliah ({selectedKlk.sksDiakui} SKS Total):
                    </div>
                    <div className="space-y-1.5">
                      <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">Praktik Kerja Lapangan Kimia (KLK)</div>
                          <div className="text-[10px] text-slate-500">Kode: MAK6109 • Semester 7</div>
                        </div>
                        <span className="font-bold text-[#002B49]">4 SKS</span>
                      </div>

                      {selectedKlk.sksDiakui >= 6 && (
                        <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">
                              Manajemen Laboratorium & K3 Industri Kimia
                            </div>
                            <div className="text-[10px] text-slate-500">Kode: MKK6120 • Mata Kuliah Pilihan</div>
                          </div>
                          <span className="font-bold text-[#002B49]">2 SKS</span>
                        </div>
                      )}

                      {selectedKlk.sksDiakui >= 10 && (
                        <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">
                              Metode Analisis & Instrumentasi Industri Lanjut
                            </div>
                            <div className="text-[10px] text-slate-500">Kode: MKK6145 • Topik Khusus Riset</div>
                          </div>
                          <span className="font-bold text-[#002B49]">4 SKS</span>
                        </div>
                      )}

                      {selectedKlk.sksDiakui >= 20 && (
                        <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">
                              Kapita Selekta Industri & Proyek Riset Terapan
                            </div>
                            <div className="text-[10px] text-slate-500">Kode: KLK6200 • Konversi Kuliah Luar Kampus</div>
                          </div>
                          <span className="font-bold text-[#002B49]">10 SKS</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DIREKTORI MITRA INDUSTRI & RISET */}
      {subTab === 'direktori-mitra' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Mitra Resmi Kerjasama KLK Departemen Kimia UB
              </h2>
              <p className="text-[11px] text-slate-500">
                Daftar instansi industri, balai riset nasional, dan laboratorium terakreditasi mitra SIKMA
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
              {mitraList.length} Mitra Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mitraList.map((m) => (
              <div
                key={m.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[10px] border border-blue-200">
                      {m.kategori}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      Kuota: {m.kuotaPerSemester} Mhs/Sem
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{m.nama}</h3>

                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{m.lokasi}</span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {m.deskripsi}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">{m.kontakHR}</span>
                  <button
                    onClick={() => {
                      setFormMitra(m.nama);
                      setFormAlamatMitra(m.alamat);
                      setSubTab('form-baru');
                    }}
                    className="px-3 py-1 bg-[#002B49] text-white hover:bg-[#003861] rounded font-semibold text-[11px]"
                  >
                    Daftar di Sini
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PUSAT DOKUMEN & PANDUAN RESMI KLK */}
      {subTab === 'unduhan-panduan' && (
        <div className="space-y-4">
          {/* Banner Alur Prosedur Pelaksanaan KLK (22 Langkah) */}
          <div className="bg-gradient-to-r from-[#002B49] via-[#003B66] to-[#002B49] p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#D4AF37]/30">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-black shadow-sm shrink-0">
                <GitMerge className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Alur Prosedur Pelaksanaan KLK
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#D4AF37] text-[#002B49] font-extrabold text-[10px] tracking-wide">
                    22 TAHAPAN BAKU
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Panduan alur resmi kegiatan mahasiswa di luar kampus, mulai dari sosialisasi, presensi QR, pendaftaran, surat pengantar, bimbingan berkala, pengunggahan nilai lapang, hingga ujian dan berita acara TU.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                id="btn-buka-alur-modal-dari-tab"
                onClick={() => setModalAlurKlkOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c4a02d] text-[#002B49] font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <ListOrdered className="w-4 h-4" />
                <span>Buka 22 Langkah Alur KLK</span>
              </button>
              <button
                type="button"
                id="btn-unduh-alur-txt-tab"
                onClick={handleDownloadAlurKlk}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
                title="Unduh Format Teks Alur KLK"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">Unduh</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Pusat Unduhan Pedoman & Formulir Resmi KLK
              </h2>
              <p className="text-[11px] text-slate-500">
                Dokumen baku Departemen Kimia Fakultas MIPA Universitas Brawijaya
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-[#D4AF37] text-[#002B49] font-bold rounded-md">
              Edisi 2026/2027
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dokumenList.map((dok) => (
              <div
                key={dok.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3 hover:border-[#002B49] transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center font-bold flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#002B49]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {dok.tipe}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {dok.ukuranFile} • Diperbarui {dok.tanggalUpdate}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{dok.judul}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {dok.deskripsi}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(`Mengunduh berkas: ${dok.judul} (${dok.tipe}) dari server SIKMA Kimia UB.`)
                  }
                  className="p-2 text-[#002B49] hover:bg-slate-100 rounded-lg flex-shrink-0"
                  title="Unduh Dokumen"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FORM DETAIL KLK SESUAI FIELDS DAFTAR PENDAFTARAN KLK */}
      {detailModalKlk && (
        <div
          id="modal-detail-klk"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailModalKlk(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#002B49] shadow-sm font-bold">
                  <FileText className="w-6 h-6 text-[#002B49]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-white tracking-wide">
                      Form Detail Pendaftaran KLK Mahasiswa
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 bg-white/10 text-amber-200 rounded border border-white/20 font-bold">
                      {detailModalKlk.kodePendaftaran}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Departemen Kimia FSTeM Universitas Brawijaya • SIKMA Kimia UB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Badge */}
                {(detailModalKlk.status === 'Disetujui' || detailModalKlk.status === 'Disetujui / Sedang Berjalan') && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disetujui</span>
                  </span>
                )}
                {(detailModalKlk.status === 'Diproses' || detailModalKlk.status === 'Menunggu Persetujuan Dept') && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Diproses</span>
                  </span>
                )}
                {detailModalKlk.status === 'Ditolak' && (
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <X className="w-3.5 h-3.5 text-rose-400" />
                    <span>Ditolak</span>
                  </span>
                )}
                {detailModalKlk.status === 'Selesai & Dinilai' && (
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-300" />
                    <span>Selesai (Nilai {detailModalKlk.nilaiAkhirHuruf})</span>
                  </span>
                )}

                <button
                  id="btn-close-modal-detail-klk"
                  onClick={() => setDetailModalKlk(null)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Modal (Scrollable Content with Left Boxes & Right Details) */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 bg-slate-50/50">
              {/* Alert Notifikasi jika baru disimpan */}
              {modalSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">
                    {modalSaveMessage}
                  </span>
                </div>
              )}

              {/* ========================================================================= */}
              {/* DUA BOX DI BAGIAN ATAS: BOX 1 (PENGUMUMAN) & BOX 2 (BIMBINGAN & EDIT KLK) */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* BOX 1: PENGUMUMAN (2 PENGUMUMAN) */}
                <div
                  id="box-pengumuman-detail-klk"
                  className="lg:col-span-8 bg-gradient-to-br from-amber-50/70 via-white to-blue-50/30 rounded-2xl border border-amber-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Header Box 1 */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/60">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-2xs">
                          <Megaphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">
                              Pengumuman
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              Akademik KLK
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                        FSTeM UB &bull; KIMIA
                      </span>
                    </div>

                    {/* KONTEN PENGUMUMAN (1 SUB BOX TUNGGAL DENGAN HANYA 2 PENGUMUMAN) */}
                    <div
                      id="sub-box-pengumuman-tunggal"
                      className="bg-white/95 rounded-xl border border-amber-200/80 p-2.5 sm:p-3 shadow-2xs divide-y divide-slate-100 space-y-2"
                    >
                      {/* Poin 1 */}
                      <div className="flex items-start gap-2.5 pt-0 first:pt-0">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          1
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong className="text-slate-900">Kewajiban Bimbingan:</strong> Mahasiswa wajib menyelesaikan minimal <strong>6 kali sesi bimbingan</strong> dengan Dosen Pembimbing KLK (<strong>{detailModalKlk.dosenPembimbingKLK || 'Dosen Pembimbing'}</strong>) serta mengisi logbook kegiatan mingguan secara berkala.
                        </p>
                      </div>

                      {/* Poin 2 */}
                      <div className="flex items-start gap-2.5 pt-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          2
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong className="text-slate-900">Nilai Mitra & Berkas Seminar:</strong> Lembar evaluasi dari mentor industri (<strong>{detailModalKlk.mentorIndustri || 'Pembimbing Lapangan'}</strong> - <em>{detailModalKlk.namaMitra}</em>) dan draf laporan wajib diverifikasi sebelum pendaftaran seminar dibuka.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer status tip di dalam Box 1 */}
                  <div className="mt-2.5 pt-2 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Periode: <strong>{detailModalKlk.tanggalMulai}</strong> s.d. <strong>{detailModalKlk.tanggalSelesai}</strong></span>
                    </span>
                    <span className="font-bold text-[#002B49] text-[11px]">
                      {detailModalKlk.sksDiakui} SKS Diakui &bull; {detailModalKlk.skema}
                    </span>
                  </div>
                </div>

                {/* BOX 2: BUTTON BIMBINGAN WARNA HIJAU & BUTTON EDIT KLK WARNA KUNING (MENYESUAIKAN TINGGI BOX PENGUMUMAN) */}
                <div
                  id="box-aksi-detail-klk"
                  className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                          <span>Aksi & Pengelolaan KLK</span>
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Kendali bimbingan & perbarui data usulan
                        </p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Sistem Aktif" />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug mb-2">
                      Akses cepat pencatatan bimbingan dan perbaikan data kegiatan:
                    </p>
                  </div>

                  {/* KONTEN BUTTON RINGKAS & ELEGAN */}
                  <div className="space-y-2">
                    {/* BUTTON 1: BIMBINGAN (WARNA HIJAU) */}
                    <button
                      type="button"
                      id="btn-bimbingan-klk-hijau"
                      onClick={() => setModalBimbinganKlkOpen(true)}
                      className="w-full group px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer border border-emerald-700/40"
                      title="Buka Form Kartu Bimbingan KLK"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <span className="block font-extrabold leading-tight">Bimbingan</span>
                          <span className="text-[10px] text-emerald-100 block font-normal leading-none">
                            Form Kartu Bimbingan
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-100 font-semibold">
                          Kartu Bimbingan
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    </button>

                    {/* BUTTON 2: EDIT KLK (WARNA KUNING) */}
                    <button
                      type="button"
                      id="btn-edit-klk-kuning"
                      onClick={() => handleOpenEditKlkModal(detailModalKlk)}
                      className="w-full group px-3.5 py-2.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer border border-amber-500"
                      title="Ubah Data Usulan KLK Mahasiswa"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-950/15 text-amber-950 flex items-center justify-center font-bold shrink-0">
                          <Edit3 className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <span className="block font-extrabold leading-tight">Edit KLK</span>
                          <span className="text-[10px] text-amber-900/80 block font-normal leading-none">
                            Ubah Mitra, Skema & Dosen
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/50 text-amber-950 font-bold">
                          Ubah
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-950 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN LAYOUT: LEFT BOXES & RIGHT CONTENT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* ============================================================== */}
                {/* KOLOM KIRI: BOX 1 (Berkas KLK), BOX 2 (SKS), BOX 3 (Nilai KLK) */}
                {/* ============================================================== */}
                <div className="lg:col-span-4 xl:col-span-4 space-y-4">
                  {/* BOX 1: Berkas KLK */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#002B49]" />
                        <span>Berkas KLK</span>
                      </h4>
                      <p className="text-xs font-semibold text-slate-600 mt-1 pb-2 border-b border-slate-100">
                        Unduh berkas
                      </p>
                    </div>

                    {/* Download Toast Notification */}
                    {downloadToast && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{downloadToast}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDownloadToast(null)}
                          className="text-emerald-700 hover:text-emerald-900 font-bold ml-1.5 cursor-pointer shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 pt-1">
                      {/* Item 1: Template Daftar Hadir */}
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-blue-50/50 hover:border-blue-300 transition-colors flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              Template Daftar Hadir
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Presensi harian kerja lapangan
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="btn-unduh-daftar-hadir"
                          onClick={() => handleDownloadDoc('daftar_hadir')}
                          disabled={downloadingDocType === 'daftar_hadir'}
                          className="px-3 py-1.5 bg-[#002B49] text-white hover:bg-[#003B66] rounded-md font-bold text-[11px] inline-flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Unduh Template Daftar Hadir"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{downloadingDocType === 'daftar_hadir' ? 'Memproses...' : 'Unduh'}</span>
                        </button>
                      </div>

                      {/* Item 2: Template Kartu Bimbingan */}
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-blue-50/50 hover:border-blue-300 transition-colors flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4 text-indigo-700" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              Template Kartu Bimbingan
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Catatan bimbingan pembimbing
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="btn-unduh-kartu-bimbingan"
                          onClick={() => handleDownloadDoc('kartu_bimbingan')}
                          disabled={downloadingDocType === 'kartu_bimbingan'}
                          className="px-3 py-1.5 bg-[#002B49] text-white hover:bg-[#003B66] rounded-md font-bold text-[11px] inline-flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Unduh Template Kartu Bimbingan"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{downloadingDocType === 'kartu_bimbingan' ? 'Memproses...' : 'Unduh'}</span>
                        </button>
                      </div>

                      {/* Item 3: Unduh Berita Acara */}
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-red-50/50 hover:border-red-300 transition-colors flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-rose-700" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              Unduh Berita Acara
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Form evaluasi ujian seminar KLK
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="btn-unduh-berita-acara"
                          onClick={() => handleDownloadDoc('berita_acara')}
                          disabled={downloadingDocType === 'berita_acara'}
                          className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-md font-bold text-[11px] inline-flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Unduh Berita Acara Ujian KLK"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{downloadingDocType === 'berita_acara' ? 'Memproses...' : 'Unduh'}</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION: UNGGAH BERKAS */}
                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div>
                        <p className="text-xs font-bold text-slate-900 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-800">
                            <Upload className="w-3.5 h-3.5 text-[#002B49]" />
                            <span>Unggah Berkas</span>
                          </span>
                          <span className="text-[10px] font-normal text-slate-500">
                            Dokumen Persyaratan KLK
                          </span>
                        </p>
                      </div>

                      {/* Unggah Berkas terdiri dari Berkas Pendaftaran KLK dan Berkas Ujian KLK */}
                      <div className="space-y-2">
                        {/* 1. Berkas Pendaftaran KLK */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden transition-all bg-white shadow-2xs">
                          <button
                            type="button"
                            id="btn-berkas-pendaftaran-klk"
                            onClick={() =>
                              setActiveUnggahCategory(
                                activeUnggahCategory === 'pendaftaran' ? null : 'pendaftaran'
                              )
                            }
                            className={`w-full p-2.5 flex items-center justify-between font-bold text-xs transition-colors ${
                              activeUnggahCategory === 'pendaftaran'
                                ? 'bg-[#002B49] text-white'
                                : 'bg-slate-50 hover:bg-blue-50/50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileCheck
                                className={`w-4 h-4 ${
                                  activeUnggahCategory === 'pendaftaran'
                                    ? 'text-[#D4AF37]'
                                    : 'text-[#002B49]'
                                }`}
                              />
                              <span className="text-left">Berkas Pendaftaran KLK</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  activeUnggahCategory === 'pendaftaran'
                                    ? 'bg-blue-900/80 text-blue-100'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                8 Dokumen
                              </span>
                              {activeUnggahCategory === 'pendaftaran' ? (
                                <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </button>

                          {/* Jika klik Berkas Pendaftaran KLK akan muncul form unggah berkas (upload file) */}
                          {activeUnggahCategory === 'pendaftaran' && (
                            <div className="p-3 bg-white space-y-2.5 border-t border-slate-200">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-100">
                                <span>Form Unggah Berkas Pendaftaran:</span>
                                <span className="text-[10px] text-slate-400">PDF, DOCX, JPG (Maks 10MB)</span>
                              </div>

                              {/* Form: Surat Pengantar, Form Persetujuan DPA, Surat Instansi, Surat Lamaran, Proposal, CV Mahasiswa, Transkrip Akademik, Perpanjangan Durasi KLK */}
                              {[
                                'surat_pengantar',
                                'persetujuan_dpa',
                                'surat_instansi',
                                'surat_lamaran',
                                'proposal',
                                'cv_mahasiswa',
                                'transkrip_akademik',
                                'perpanjangan_klk'
                              ].map((key) => {
                                const item = berkasPendaftaranMap[key];
                                if (!item) return null;

                                return (
                                  <div
                                    key={item.id}
                                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/20 transition-colors space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-[#002B49] shrink-0" />
                                          <span className="truncate">{item.label}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                          {item.description}
                                        </p>
                                      </div>
                                      {item.status === 'uploaded' ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>Terunggah</span>
                                        </span>
                                      ) : item.status === 'selected' ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                                          <Clock className="w-3 h-3 text-blue-600" />
                                          <span>Dipilih</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600 shrink-0">
                                          <span>Belum Ada</span>
                                        </span>
                                      )}
                                    </div>

                                    {/* File Name Info */}
                                    {item.fileName ? (
                                      <div className="text-[10px] text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 flex items-center justify-between gap-1">
                                        <span className="font-mono truncate" title={item.fileName}>
                                          📎 {item.fileName}
                                        </span>
                                        {item.fileSize && (
                                          <span className="text-slate-400 shrink-0 font-mono text-[9px]">
                                            {item.fileSize}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-slate-400 italic px-1">
                                        Belum ada berkas dipilih
                                      </div>
                                    )}

                                    {/* Khusus Surat Pengantar: Tombol Generate dan Lampiran */}
                                    {item.id === 'surat_pengantar' && (
                                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-50/80 border border-blue-200">
                                        <button
                                          type="button"
                                          id="btn-generate-surat-pengantar"
                                          onClick={handleGenerateSuratPengantar}
                                          className="flex-1 py-1.5 px-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-[11px] rounded shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                          title="Generate Surat Pengantar Resmi KLK Kimia UB"
                                        >
                                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                                          <span>Generate</span>
                                        </button>
                                        <button
                                          type="button"
                                          id="btn-lampiran-surat-pengantar"
                                          onClick={handleOpenLampiranSuratPengantar}
                                          className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                          title="Buka Lampiran Surat Pengantar KLK"
                                        >
                                          <Layers className="w-3.5 h-3.5 text-emerald-200" />
                                          <span>Lampiran</span>
                                        </button>
                                      </div>
                                    )}

                                    {/* Hidden File Input for Native File Chooser */}
                                    <input
                                      type="file"
                                      id={`file-input-${item.id}`}
                                      className="hidden"
                                      accept=".pdf,.docx,.doc,.png,.jpg"
                                      onChange={(e) => handleFileBrowse('pendaftaran', item.id, e)}
                                    />

                                    {/* Action Buttons: Browse, Submit, Preview (Khusus Perpanjangan Durasi KLK hanya Browse & Submit) */}
                                    {item.id === 'perpanjangan_klk' ? (
                                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                                        {/* BROWSE */}
                                        <button
                                          type="button"
                                          id={`btn-browse-${item.id}`}
                                          onClick={() =>
                                            document.getElementById(`file-input-${item.id}`)?.click()
                                          }
                                          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-[11px] rounded border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                          title={`Pilih berkas untuk ${item.label}`}
                                        >
                                          <FolderOpen className="w-3 h-3 text-[#D4AF37]" />
                                          <span>Browse</span>
                                        </button>

                                        {/* SUBMIT */}
                                        <button
                                          type="button"
                                          id={`btn-submit-${item.id}`}
                                          onClick={() => handleSubmitFile('pendaftaran', item.id)}
                                          className="flex-1 py-1.5 px-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-[11px] rounded shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                          title={`Unggah ${item.label}`}
                                        >
                                          <Upload className="w-3 h-3 text-[#D4AF37]" />
                                          <span>Submit</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                                        {/* BROWSE */}
                                        <button
                                          type="button"
                                          id={`btn-browse-${item.id}`}
                                          onClick={() =>
                                            document.getElementById(`file-input-${item.id}`)?.click()
                                          }
                                          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-[11px] rounded border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                          title={`Pilih berkas untuk ${item.label}`}
                                        >
                                          <FolderOpen className="w-3 h-3 text-[#D4AF37]" />
                                          <span>Browse</span>
                                        </button>

                                        {/* SUBMIT */}
                                        <button
                                          type="button"
                                          id={`btn-submit-${item.id}`}
                                          onClick={() => handleSubmitFile('pendaftaran', item.id)}
                                          className="flex-1 py-1.5 px-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-[11px] rounded shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                          title={`Unggah ${item.label}`}
                                        >
                                          <Upload className="w-3 h-3 text-[#D4AF37]" />
                                          <span>Submit</span>
                                        </button>

                                        {/* PREVIEW */}
                                        <button
                                          type="button"
                                          id={`btn-preview-${item.id}`}
                                          onClick={() => handlePreviewFile('pendaftaran', item.id)}
                                          disabled={!item.fileName}
                                          className={`flex-1 py-1.5 px-2 font-bold text-[11px] rounded border shadow-2xs inline-flex items-center justify-center gap-1 transition-colors ${
                                            item.fileName
                                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 cursor-pointer'
                                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                          }`}
                                          title={`Pratinjau ${item.label}`}
                                        >
                                          <Eye className="w-3 h-3 text-amber-600" />
                                          <span>Preview</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 2. Berkas Ujian KLK */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden transition-all bg-white shadow-2xs">
                          <button
                            type="button"
                            id="btn-berkas-ujian-klk"
                            onClick={() =>
                              setActiveUnggahCategory(
                                activeUnggahCategory === 'ujian' ? null : 'ujian'
                              )
                            }
                            className={`w-full p-2.5 flex items-center justify-between font-bold text-xs transition-colors ${
                              activeUnggahCategory === 'ujian'
                                ? 'bg-[#002B49] text-white'
                                : 'bg-slate-50 hover:bg-blue-50/50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Award
                                className={`w-4 h-4 ${
                                  activeUnggahCategory === 'ujian'
                                    ? 'text-[#D4AF37]'
                                    : 'text-amber-600'
                                }`}
                              />
                              <span className="text-left">Berkas Ujian KLK</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  activeUnggahCategory === 'ujian'
                                    ? 'bg-blue-900/80 text-blue-100'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                5 Dokumen
                              </span>
                              {activeUnggahCategory === 'ujian' ? (
                                <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </button>

                          {/* Form Unggah Berkas Ujian KLK */}
                          {activeUnggahCategory === 'ujian' && (
                            <div className="p-3 bg-white space-y-2.5 border-t border-slate-200">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-100">
                                <span>Form Unggah Berkas Ujian Seminar:</span>
                                <span className="text-[10px] text-slate-400">PDF, PPTX, DOCX (Maks 15MB)</span>
                              </div>

                              {[
                                'daftar_hadir',
                                'lembar_pengesahan',
                                'presentasi',
                                'laporan_pkl',
                                'berita_acara'
                              ].map((key) => {
                                const item = berkasUjianMap[key];
                                if (!item) return null;

                                return (
                                  <div
                                    key={item.id}
                                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/20 transition-colors space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-[#002B49] shrink-0" />
                                          <span className="truncate">{item.label}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                          {item.description}
                                        </p>
                                      </div>
                                      {item.status === 'uploaded' ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>Terunggah</span>
                                        </span>
                                      ) : item.status === 'selected' ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                                          <Clock className="w-3 h-3 text-blue-600" />
                                          <span>Dipilih</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600 shrink-0">
                                          <span>Belum Ada</span>
                                        </span>
                                      )}
                                    </div>

                                    {item.fileName ? (
                                      <div className="text-[10px] text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 flex items-center justify-between gap-1">
                                        <span className="font-mono truncate" title={item.fileName}>
                                          📎 {item.fileName}
                                        </span>
                                        {item.fileSize && (
                                          <span className="text-slate-400 shrink-0 font-mono text-[9px]">
                                            {item.fileSize}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-slate-400 italic px-1">
                                        Belum ada berkas dipilih
                                      </div>
                                    )}

                                    <input
                                      type="file"
                                      id={`file-input-${item.id}`}
                                      className="hidden"
                                      accept={
                                        item.id === 'presentasi'
                                          ? '.pptx,.ppt,.pdf'
                                          : '.pdf,.docx,.doc'
                                      }
                                      onChange={(e) => handleFileBrowse('ujian', item.id, e)}
                                    />

                                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                                      <button
                                        type="button"
                                        id={`btn-browse-${item.id}`}
                                        onClick={() =>
                                          document.getElementById(`file-input-${item.id}`)?.click()
                                        }
                                        className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-[11px] rounded border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                        title={`Pilih berkas untuk ${item.label}`}
                                      >
                                        <FolderOpen className="w-3 h-3 text-[#D4AF37]" />
                                        <span>Browse</span>
                                      </button>

                                      <button
                                        type="button"
                                        id={`btn-submit-${item.id}`}
                                        onClick={() => handleSubmitFile('ujian', item.id)}
                                        className="flex-1 py-1.5 px-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-[11px] rounded shadow-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                        title={`Unggah ${item.label}`}
                                      >
                                        <Upload className="w-3 h-3 text-[#D4AF37]" />
                                        <span>Submit</span>
                                      </button>

                                      {item.allowPreview !== false && (
                                        <button
                                          type="button"
                                          id={`btn-preview-${item.id}`}
                                          onClick={() => handlePreviewFile('ujian', item.id)}
                                          disabled={!item.fileName}
                                          className={`flex-1 py-1.5 px-2 font-bold text-[11px] rounded border shadow-2xs inline-flex items-center justify-center gap-1 transition-colors ${
                                            item.fileName
                                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 cursor-pointer'
                                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                          }`}
                                          title={`Pratinjau ${item.label}`}
                                        >
                                          <Eye className="w-3 h-3 text-amber-600" />
                                          <span>Preview</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOX 2: SKS dan Mata Kuliah KLK */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#002B49]" />
                        <span>SKS dan Mata Kuliah KLK</span>
                      </h4>
                    </div>

                    {/* Button Jumlah SKS dan MK */}
                    <div>
                      <button
                        type="button"
                        id="btn-jumlah-sks-mk"
                        onClick={() => setIsSksMenuOpen(!isSksMenuOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-[#002B49] to-[#003B66] text-white rounded-xl font-bold text-xs shadow-xs hover:brightness-105 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#D4AF37]" />
                          <span>Jumlah SKS dan MK</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#D4AF37] text-[#002B49] rounded-md font-bold text-[11px]">
                            {selectedSksChoice} SKS
                          </span>
                          {isSksMenuOpen ? (
                            <ChevronUp className="w-4 h-4 text-white" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Pilihan Jumlah SKS sebanyak 3, 7, 10, 13 dan 16 */}
                    {isSksMenuOpen && (
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#002B49]">
                            Pilih Beban SKS:
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            (Pilihan: 3, 7, 10, 13, 16)
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[3, 7, 10, 13, 16].map((sksVal) => (
                            <button
                              key={sksVal}
                              type="button"
                              id={`btn-pilih-sks-${sksVal}`}
                              onClick={() => handleSelectSksChoice(sksVal)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold text-center border transition-all ${
                                selectedSksChoice === sksVal
                                  ? 'bg-[#002B49] text-[#D4AF37] border-[#002B49] shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {sksVal}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Klik angka di atas untuk memilih beban konversi SKS dan paket mata kuliah.
                        </p>
                      </div>
                    )}

                    {/* Rincian Mata Kuliah Terpilih */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Paket Terpilih:</span>
                        <span className="font-bold text-[#002B49]">
                          {SKS_MK_DATA[selectedSksChoice]?.label || `${selectedSksChoice} SKS`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        {SKS_MK_DATA[selectedSksChoice]?.kategori}
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                          <span>Mata Kuliah Konversi:</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            Total: {selectedSksChoice} SKS
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                          {SKS_MK_DATA[selectedSksChoice]?.mkList.map((mk, i) => (
                            <div
                              key={i}
                              className="flex items-start justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-200 gap-1.5"
                            >
                              <div className="flex items-start gap-1.5 min-w-0">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-slate-800 font-semibold block leading-tight">
                                    {mk.nama}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-400">
                                    {mk.kode}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-900 rounded shrink-0 border border-blue-200">
                                {mk.sks} SKS
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOX 3: Nilai KLK */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        <span>Nilai KLK</span>
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#002B49] border border-blue-200">
                        {detailModalKlk.status === 'Selesai & Dinilai' ? 'Selesai Dinilai' : 'Evaluasi Akhir'}
                      </span>
                    </div>

                    {/* Ringkasan Nilai Akhir */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold">
                          Nilai Akhir Huruf
                        </span>
                        <span className="text-3xl font-black text-[#002B49] tracking-tight">
                          {detailModalKlk.nilaiAkhirHuruf || modalNilaiHuruf || 'A'}
                        </span>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          Lulus Sangat Memuaskan
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] font-semibold">
                          Nilai Angka Rata-rata
                        </span>
                        <span className="text-xl font-bold font-mono text-slate-800">
                          {(
                            ((detailModalKlk.nilaiIndustri || modalNilaiIndustri) * 0.4) +
                            ((detailModalKlk.nilaiDosen || modalNilaiDosen) * 0.3) +
                            ((((detailModalKlk.nilaiIndustri || modalNilaiIndustri) + (detailModalKlk.nilaiDosen || modalNilaiDosen)) / 2) * 0.3)
                          ).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">/ 100</span>
                      </div>
                    </div>

                    {/* Rincian Komponen Nilai */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 text-[11px]">
                          Pembimbing Industri (40%)
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {detailModalKlk.nilaiIndustri || modalNilaiIndustri}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 text-[11px]">
                          Dosen Pembimbing (30%)
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {detailModalKlk.nilaiDosen || modalNilaiDosen}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 text-[11px]">
                          Ujian Seminar (30%)
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {Math.round(((detailModalKlk.nilaiIndustri || modalNilaiIndustri) + (detailModalKlk.nilaiDosen || modalNilaiDosen)) / 2)}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Input/Ubah Nilai KLK */}
                    {!isEditingNilaiInModal ? (
                      <button
                        type="button"
                        id="btn-edit-nilai-klk"
                        onClick={() => setIsEditingNilaiInModal(true)}
                        className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-[#002B49] rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Input / Ubah Nilai KLK</span>
                      </button>
                    ) : (
                      <form onSubmit={handleSaveNilaiInModal} className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2 mt-2 animate-in fade-in duration-150">
                        <div className="font-bold text-xs text-[#002B49] mb-1">
                          Form Input Nilai KLK
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-600 block font-semibold mb-0.5">
                              Nilai Industri
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={modalNilaiIndustri}
                              onChange={(e) => setModalNilaiIndustri(Number(e.target.value))}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-600 block font-semibold mb-0.5">
                              Nilai Dosen
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={modalNilaiDosen}
                              onChange={(e) => setModalNilaiDosen(Number(e.target.value))}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-600 block font-semibold mb-0.5">
                            Nilai Akhir Huruf
                          </label>
                          <select
                            value={modalNilaiHuruf}
                            onChange={(e) => setModalNilaiHuruf(e.target.value as any)}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold"
                          >
                            <option value="A">A (Sangat Baik / 80-100)</option>
                            <option value="B+">B+ (75 - 79.9)</option>
                            <option value="B">B (Baik / 70 - 74.9)</option>
                            <option value="C+">C+ (Cukup Baik / 65 - 69.9)</option>
                            <option value="C">C (Cukup / 55 - 64.9)</option>
                          </select>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingNilaiInModal(false)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-[#002B49] text-white rounded text-[11px] font-bold hover:bg-[#003B66]"
                          >
                            Simpan Nilai
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* ============================================================== */}
                {/* KOLOM KANAN: DETAIL DATA PENDAFTARAN MAHASISWA & UJIAN KLK    */}
                {/* ============================================================== */}
                <div className="lg:col-span-8 xl:col-span-8 space-y-4">
                  {/* 1. DATA MAHASISWA & SEMESTER */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#002B49]" />
                        <span>Data Mahasiswa Pemohon & Semester Akademik</span>
                      </span>
                      <span className="text-[10px] font-semibold text-[#002B49] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        S1 Kimia FSTeM UB
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nama Mahasiswa</span>
                        <span className="font-bold text-slate-900 text-sm">{detailModalKlk.mahasiswaNama}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">NIM</span>
                        <span className="font-mono font-bold text-slate-800">{detailModalKlk.nim}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Semester Mahasiswa</span>
                        <span className="font-semibold text-slate-800">Semester {detailModalKlk.semester}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Semester Akademik</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#002B49] text-white">
                          {detailModalKlk.namaSemester || 'Ganjil 2026 / 2027'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. SKEMA & MITRA INDUSTRI / RISET */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Info Skema & SKS */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Briefcase className="w-4 h-4 text-[#002B49]" />
                        <span>Skema & Beban SKS</span>
                      </span>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Skema Pilihan</span>
                        <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-900 font-bold rounded-md text-xs mt-0.5">
                          {detailModalKlk.skema}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Beban SKS Diakui</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {detailModalKlk.sksDiakui} SKS Konversi Mata Kuliah
                        </span>
                      </div>
                    </div>

                    {/* Info Mitra & Lokasi */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Building2 className="w-4 h-4 text-[#002B49]" />
                        <span>Mitra Industri / Riset</span>
                      </span>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nama Mitra</span>
                        <span className="font-bold text-slate-900 text-xs">{detailModalKlk.namaMitra}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Alamat Mitra</span>
                        <span className="text-slate-700 text-xs flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{detailModalKlk.alamatMitra || 'Kantor / Fasilitas Mitra'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. BIDANG PEKERJAAN & PERIODE & PEMBIMBING */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Layers className="w-4 h-4 text-[#002B49]" />
                      <span>Bidang Pekerjaan, Periode & Pembimbing</span>
                    </span>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Bidang Pekerjaan / Laboratorium Analisis</span>
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-medium text-xs border border-slate-200 mt-1">
                        {detailModalKlk.bidangPekerjaan}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Periode Pelaksanaan</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{detailModalKlk.tanggalMulai} s.d. {detailModalKlk.tanggalSelesai}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Dosen Pembimbing KLK</span>
                        <div className="font-bold text-slate-800 mt-0.5">{detailModalKlk.dosenPembimbingKLK}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Mentor Lapangan / Industri</span>
                        <div className="font-semibold text-slate-800 mt-0.5">{detailModalKlk.mentorIndustri}</div>
                        <div className="text-[11px] text-slate-500">{detailModalKlk.kontakMentor}</div>
                      </div>
                    </div>
                  </div>

                  {/* 4. FIELD PELAKSANAAN WAKTU UJIAN & RUANG UJIAN */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-amber-50/50 p-4 sm:p-5 rounded-xl border-2 border-[#002B49]/20 shadow-xs">
                    <div className="flex items-center justify-between border-b border-blue-200/70 pb-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#002B49]">
                            Pelaksanaan Waktu Ujian & Ruang Ujian
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Jadwal seminar / ujian evaluasi KLK mahasiswa Kimia UB
                          </p>
                        </div>
                      </div>

                      <button
                        id="btn-edit-jadwal-modal-klk"
                        type="button"
                        onClick={() => setIsEditingUjianInModal(!isEditingUjianInModal)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{isEditingUjianInModal ? 'Batal Ubah' : 'Atur / Edit Jadwal Ujian'}</span>
                      </button>
                    </div>

                    {!isEditingUjianInModal ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Waktu Ujian (Tanggal & Pukul) */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[11px] font-medium">
                            Pelaksanaan Waktu Ujian (Tanggal dan Pukul)
                          </span>
                          {detailModalKlk.tanggalUjian ? (
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <Calendar className="w-4 h-4 text-[#002B49]" />
                                <span>{detailModalKlk.tanggalUjian}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>{detailModalKlk.pukulUjian || 'Waktu Menyesuaikan'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1.5 flex items-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs font-semibold">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Belum Terjadwal (Klik tombol "Atur / Edit Jadwal Ujian" di kanan atas)</span>
                            </div>
                          )}
                        </div>

                        {/* Ruang Ujian */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[11px] font-medium">
                            Ruang Ujian
                          </span>
                          {detailModalKlk.ruangUjian ? (
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                                <DoorOpen className="w-4 h-4 text-emerald-700" />
                                <span>{detailModalKlk.ruangUjian}</span>
                              </div>
                              {(() => {
                                const rMatch = ruanganOptions.find(
                                  (r) => r.namaRuangan === detailModalKlk.ruangUjian
                                );
                                if (rMatch) {
                                  return (
                                    <div className="text-[11px] text-slate-600">
                                      Kategori: <strong>{rMatch.kategori}</strong> • Kapasitas: <strong>{rMatch.kapasitas} Kursi</strong> • {rMatch.lokasiGedung || 'Gedung Kimia FSTeM'}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          ) : (
                            <div className="mt-1.5 flex items-center gap-2 text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs italic">
                              <DoorOpen className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Belum Ditentukan Ruang Ujian</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Form Edit Jadwal Ujian */
                      <form onSubmit={handleSaveUjianInModal} className="bg-white p-4 rounded-xl border border-blue-300 space-y-3">
                        <div className="font-bold text-xs text-[#002B49] flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Form Pengaturan Waktu & Ruang Ujian KLK</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Tanggal Ujian <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={modalTglUjian}
                              onChange={(e) => setModalTglUjian(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Pukul / Waktu Ujian <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={modalPukulUjian}
                              onChange={(e) => setModalPukulUjian(e.target.value)}
                              placeholder="Contoh: 09:00 - 10:30 WIB"
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Ruang Ujian <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={modalRuangUjian}
                              onChange={(e) => setModalRuangUjian(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49]"
                            >
                              <option value="">-- Pilih Ruang Ujian --</option>
                              {ruanganOptions
                                .filter((r) => r.status === 'Aktif')
                                .map((r) => (
                                  <option key={r.id} value={r.namaRuangan}>
                                    {r.namaRuangan} ({r.kategori} - Kapasitas {r.kapasitas})
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setIsEditingUjianInModal(false)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-lg text-xs font-bold shadow-xs"
                          >
                            Simpan Jadwal Ujian
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* 5. BOX STATUS PENDAFTARAN & PENILAI */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                    {/* Header Box Status Pendaftaran */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            Status Pendaftaran
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Validasi administratif dan penunjukan tim penilai KLK
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#002B49] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {detailModalKlk.status}
                      </span>
                    </div>

                    {/* Informasi Status Pendaftaran, Nomor Surat Tugas, Dokumen LoA */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 p-3 rounded-lg border border-slate-200/70">
                      <div>
                        <span className="text-slate-400 block text-[11px] font-medium">Status Pendaftaran</span>
                        <div className="mt-1">
                          {(detailModalKlk.status === 'Disetujui' || detailModalKlk.status === 'Disetujui / Sedang Berjalan') && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {(detailModalKlk.status === 'Diproses' || detailModalKlk.status === 'Menunggu Persetujuan Dept') && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Diproses</span>
                            </span>
                          )}
                          {detailModalKlk.status === 'Ditolak' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 border border-rose-300">
                              <X className="w-3.5 h-3.5 text-rose-700" />
                              <span>Ditolak</span>
                            </span>
                          )}
                          {detailModalKlk.status === 'Selesai & Dinilai' && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg font-bold text-xs inline-flex items-center gap-1 border border-blue-300">
                              <Award className="w-3.5 h-3.5 text-blue-700" />
                              <span>Selesai (Nilai {detailModalKlk.nilaiAkhirHuruf})</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px] font-medium">Nomor Surat Tugas</span>
                        <span className="font-mono font-bold text-slate-800 text-xs mt-1 block">
                          {detailModalKlk.nomorSuratTugas || 'Menunggu Penerbitan Surat Tugas'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px] font-medium">Dokumen Letter of Acceptance (LoA)</span>
                        <span className="font-medium text-blue-700 text-xs mt-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{detailModalKlk.dokumenLoA || 'Berkas_LoA.pdf'}</span>
                        </span>
                      </div>
                    </div>

                    {/* BOX TULISAN JUDUL : PENILAI */}
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#002B49]" />
                          <h5 className="font-bold text-slate-900 text-sm">
                            Penilai
                          </h5>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Tim Penilai Evaluasi KLK (Internal & Mitra Lapangan)
                        </span>
                      </div>

                      {/* Tabel / Fields: Penilai dan Aksi */}
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#002B49] text-white">
                            <tr>
                              <th scope="col" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-r border-blue-900 w-2/3">
                                Penilai
                              </th>
                              <th scope="col" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-right w-1/3">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {/* Row 1: Dosen Pembimbing */}
                            <tr className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002B49] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    DP
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                        Dosen Pembimbing
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                        Internal Departemen
                                      </span>
                                    </div>
                                    <div className="text-slate-800 font-semibold text-xs mt-0.5">
                                      {detailModalKlk.dosenPembimbingKLK || 'Belum Ditentukan'}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Departemen Kimia FSTeM Universitas Brawijaya &bull; Bobot Penilaian: 30% Pembimbingan + 30% Seminar
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right align-middle">
                                <button
                                  type="button"
                                  id="btn-detail-dosen-pembimbing"
                                  onClick={() => handleOpenDetailPenilai('dosen')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                                  title="Lihat Detail Dosen Pembimbing"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <span>Detail</span>
                                </button>
                              </td>
                            </tr>

                            {/* Row 2: Pembimbing Lapangan */}
                            <tr className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    PL
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                        Pembimbing Lapangan
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                        Mitra Industri / Riset
                                      </span>
                                    </div>
                                    <div className="text-slate-800 font-semibold text-xs mt-0.5">
                                      {detailModalKlk.mentorIndustri || 'Belum Ditentukan'}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {detailModalKlk.namaMitra} {detailModalKlk.kontakMentor ? `(${detailModalKlk.kontakMentor})` : ''} &bull; Bobot Penilaian: 40% Kinerja Lapangan
                                    </p>
                                    {linkPembimbingLapangan && (
                                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Link form penilaian online telah siap dibagikan</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right align-middle">
                                <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                                  <button
                                    type="button"
                                    id="btn-generate-link-pembimbing-lapangan"
                                    onClick={handleGenerateLinkPembimbing}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                                    title="Generate Link Penilaian Online untuk Pembimbing Lapangan"
                                  >
                                    <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Generate Link</span>
                                  </button>
                                  <button
                                    type="button"
                                    id="btn-detail-pembimbing-lapangan"
                                    onClick={() => handleOpenDetailPenilai('lapangan')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                                    title="Lihat Detail Pembimbing Lapangan"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Detail</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedKlkId(detailModalKlk.id);
                  setSubTab('form-klk-cetak');
                  setDetailModalKlk(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" />
                <span>Buka Lembar Form KLK Resmi</span>
              </button>

              <button
                id="btn-close-detail-modal-bottom"
                type="button"
                onClick={() => setDetailModalKlk(null)}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL FORM KARTU BIMBINGAN KLK MAHASISWA                */}
      {/* ======================================================= */}
      {modalBimbinganKlkOpen && detailModalKlk && (
        <div
          id="modal-bimbingan-klk"
          className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal Kartu Bimbingan */}
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                    Kartu Bimbingan
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Departemen Kimia FSTeM Universitas Brawijaya &bull; Formulir Kartu Kendali & Sesi Bimbingan KLK Mahasiswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalBimbinganKlkOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tutup Kartu Bimbingan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Kartu Bimbingan */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs bg-slate-50">
              {/* Ringkasan Mahasiswa & Dosen */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mahasiswa</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block">{detailModalKlk.mahasiswaNama}</span>
                  <span className="font-mono text-[10px] text-slate-500 block">NIM: {detailModalKlk.nim}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dosen Pembimbing KLK</span>
                  <span className="font-bold text-[#002B49] text-xs sm:text-sm block">{detailModalKlk.dosenPembimbingKLK}</span>
                  <span className="text-[10px] text-slate-500 block">Departemen Kimia FSTeM UB</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Sesi Bimbingan</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{bimbinganSesiList.length} Sesi Terpenuhi</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Wajib minimal 6 sesi konsultasi</span>
                </div>
              </div>

              {/* Alert Notifikasi Sukses Simpan */}
              {bimbinganSavedSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{bimbinganSavedMessage}</span>
                </div>
              )}

              {/* FORM PENGISIAN KARTU BIMBINGAN */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Edit3 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Form Kartu Bimbingan Mahasiswa
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Input manual data sesi pembimbingan bersama Dosen Pembimbing KLK
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Form Input Aktif
                  </span>
                </div>

                <form onSubmit={handleSaveKartuBimbingan} className="space-y-3.5">
                  {/* Field 1: Tanggal Bimbingan (input tanggal) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Tanggal Bimbingan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={formKartuBimbingan.tanggalBimbingan}
                        onChange={(e) =>
                          setFormKartuBimbingan({ ...formKartuBimbingan, tanggalBimbingan: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white shadow-2xs cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Tentukan tanggal pelaksanaan konsultasi atau diskusi bimbingan KLK
                    </span>
                  </div>

                  {/* Field 2: Detail Bimbingan (input tulis manual) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Detail Bimbingan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formKartuBimbingan.detailBimbingan}
                      onChange={(e) =>
                        setFormKartuBimbingan({ ...formKartuBimbingan, detailBimbingan: e.target.value })
                      }
                      placeholder="Tulis manual detail bimbingan: materi pembahasan, kemajuan analisis kimia di industri mitra, telaah bab laporan akhir, catatan kendala instrumen, atau arahan revisi dari dosen pembimbing..."
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white shadow-2xs leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Input tulis manual rincian materi, progres kegiatan, dan saran pembimbing
                    </span>
                  </div>

                  {/* Field 3: Link Folder dalam Google Drive *Pastikan bisa diakses public (input link manual) */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Link Folder dalam Google Drive</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>*Pastikan bisa diakses public</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={formKartuBimbingan.linkGoogleDrive}
                        onChange={(e) =>
                          setFormKartuBimbingan({ ...formKartuBimbingan, linkGoogleDrive: e.target.value })
                        }
                        placeholder="https://drive.google.com/drive/folders/..."
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white shadow-2xs"
                      />
                    </div>
                    <div className="mt-1.5 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-950 font-bold">*Catatan Penting Google Drive:</strong> Pastikan setelan berbagi (share permission) folder Google Drive telah diatur ke mode <strong>&quot;Siapa saja yang memiliki link (Anyone with the link)&quot;</strong> agar Dosen Pembimbing dan Tim Penguji dapat membuka draf laporan serta lampiran data penelitian KLK tanpa perlu meminta izin akses manual.
                      </div>
                    </div>
                  </div>

                  {/* Field 4: Status Detail Bimbingan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Status Detail Bimbingan <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        id="btn-form-status-diproses"
                        onClick={() => setFormKartuBimbingan({ ...formKartuBimbingan, status: 'Diproses' })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                          formKartuBimbingan.status === 'Diproses'
                            ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-500/40 font-extrabold'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Diproses</span>
                      </button>
                      <button
                        type="button"
                        id="btn-form-status-disetujui"
                        onClick={() => setFormKartuBimbingan({ ...formKartuBimbingan, status: 'Disetujui' })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                          formKartuBimbingan.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/40 font-extrabold'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Disetujui</span>
                      </button>
                      <button
                        type="button"
                        id="btn-form-status-ditolak"
                        onClick={() => setFormKartuBimbingan({ ...formKartuBimbingan, status: 'Ditolak' })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                          formKartuBimbingan.status === 'Ditolak'
                            ? 'bg-red-100 text-red-900 border-red-400 ring-2 ring-red-500/40 font-extrabold'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Ditolak</span>
                      </button>
                      <span className="text-[10px] text-slate-500 ml-1">
                        Pilih status awal verifikasi untuk sesi pembimbingan ini
                      </span>
                    </div>
                  </div>

                  {/* Action Button Simpan */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      id="btn-simpan-kartu-bimbingan"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Kartu Bimbingan</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* DAFTAR RIWAYAT SESI KARTU BIMBINGAN */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-emerald-700" />
                    <span>Daftar Sesi Pembimbingan Akademik ({bimbinganSesiList.length} Sesi Terdaftar)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Total: {bimbinganSesiList.length} sesi resmi
                  </span>
                </div>

                {bimbinganSesiList.length === 0 ? (
                  <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs space-y-1">
                    <p className="font-bold text-slate-700">Belum ada sesi pembimbingan akademik yang terdaftar.</p>
                    <p>Gunakan formulir di atas untuk mencatat sesi bimbingan baru mahasiswa.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {bimbinganSesiList.map((sesi) => (
                      <div
                        key={sesi.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors space-y-2.5"
                      >
                        {/* Header Bar Sesi */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#002B49] text-white font-mono font-bold text-[10px]">
                              Sesi {sesi.id}
                            </span>
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{sesi.tanggal}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Status Detail Bimbingan */}
                            <div className="inline-flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                                Status:
                              </span>
                              {sesi.status === 'Diproses' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Diproses</span>
                                </span>
                              )}
                              {sesi.status === 'Disetujui' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Disetujui</span>
                                </span>
                              )}
                              {sesi.status === 'Ditolak' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1 shadow-2xs">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  <span>Ditolak</span>
                                </span>
                              )}
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Diparaf Pembimbing</span>
                            </span>
                          </div>
                        </div>

                        {/* Status Detail Bimbingan Row (Jelas & Terstruktur) */}
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">Status Detail Bimbingan:</span>
                            {sesi.status === 'Diproses' && (
                              <span className="font-bold text-amber-700 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Diproses</span>
                              </span>
                            )}
                            {sesi.status === 'Disetujui' && (
                              <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Disetujui</span>
                              </span>
                            )}
                            {sesi.status === 'Ditolak' && (
                              <span className="font-bold text-red-600 inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {sesi.status === 'Diproses' && 'Materi bimbingan sedang diproses & ditinjau oleh Dosen Pembimbing'}
                            {sesi.status === 'Disetujui' && 'Konsultasi materi bimbingan telah disetujui Dosen Pembimbing'}
                            {sesi.status === 'Ditolak' && 'Materi bimbingan ditolak / memerlukan revisi perbaikan'}
                          </span>
                        </div>

                        {/* Detail Bimbingan */}
                        <div className="text-slate-800 text-xs font-medium leading-relaxed pl-1">
                          <strong className="text-slate-900 block font-bold mb-0.5">Detail Bimbingan:</strong>
                          <p className="text-slate-700">{sesi.pokokBahasan}</p>
                        </div>

                        {/* Catatan / Rekomendasi Dosen */}
                        {sesi.catatanDosen && (
                          <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-slate-700 text-[11px] leading-relaxed">
                            <span className="font-bold text-emerald-950 block">Arahan / Rekomendasi Dosen:</span>
                            {sesi.catatanDosen}
                          </div>
                        )}

                        {/* Link Folder Google Drive */}
                        {sesi.linkGoogleDrive && (
                          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                            <div className="flex items-center gap-1.5 overflow-hidden text-slate-600 font-mono">
                              <FolderOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">{sesi.linkGoogleDrive}</span>
                            </div>
                            <a
                              href={sesi.linkGoogleDrive}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 font-bold text-[10px] rounded-md border border-slate-200 shrink-0 transition-colors shadow-2xs"
                              title="Buka Folder Google Drive di Tab Baru"
                            >
                              <span>Buka Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* BARIS AKSI BUTTON: DIPROSES (KUNING), DISETUJUI (HIJAU), DITOLAK (MERAH), HAPUS (MERAH TUA) */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-700 mr-0.5">Aksi:</span>

                            {/* Button Diproses berwarna kuning */}
                            <button
                              type="button"
                              id={`btn-diproses-sesi-${sesi.id}`}
                              onClick={() => handleSetStatusBimbingan(sesi.id, 'Diproses')}
                              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                                sesi.status === 'Diproses'
                                  ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-500/50 font-extrabold'
                                  : 'bg-amber-300 hover:bg-amber-400 active:bg-amber-500 text-amber-950 border-amber-400'
                              }`}
                              title="Tandai status bimbingan ini: Diproses"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-950" />
                              <span>Diproses</span>
                            </button>

                            {/* Button Disetujui warna hijau */}
                            <button
                              type="button"
                              id={`btn-disetujui-sesi-${sesi.id}`}
                              onClick={() => handleSetStatusBimbingan(sesi.id, 'Disetujui')}
                              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                                sesi.status === 'Disetujui'
                                  ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/50 font-extrabold'
                                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-700'
                              }`}
                              title="Tandai status bimbingan ini: Disetujui"
                            >
                              <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                              <span>Disetujui</span>
                            </button>

                            {/* Button Ditolak warna merah */}
                            <button
                              type="button"
                              id={`btn-ditolak-sesi-${sesi.id}`}
                              onClick={() => handleSetStatusBimbingan(sesi.id, 'Ditolak')}
                              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                                sesi.status === 'Ditolak'
                                  ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-500/50 font-extrabold'
                                  : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-600'
                              }`}
                              title="Tandai status bimbingan ini: Ditolak"
                            >
                              <XCircle className="w-3.5 h-3.5 text-white" />
                              <span>Ditolak</span>
                            </button>

                            {/* Button Hapus berwarna merah tua */}
                            {deletingBimbinganId === sesi.id ? (
                              <div className="inline-flex items-center gap-1.5 p-1 bg-red-50 border border-red-300 rounded-lg animate-in fade-in">
                                <span className="text-[10px] text-red-900 font-bold px-1">
                                  Hapus Sesi #{sesi.id}?
                                </span>
                                <button
                                  type="button"
                                  id={`btn-konfirmasi-hapus-${sesi.id}`}
                                  onClick={() => handleDeleteBimbingan(sesi.id)}
                                  className="px-2 py-1 bg-red-900 hover:bg-red-950 text-white text-[10px] font-bold rounded cursor-pointer transition-colors shadow-2xs"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingBimbinganId(null)}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded cursor-pointer transition-colors"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                id={`btn-hapus-sesi-${sesi.id}`}
                                onClick={() => setDeletingBimbinganId(sesi.id)}
                                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-900 hover:bg-red-950 active:bg-black text-white font-bold text-xs rounded-lg border border-red-950 shadow-2xs transition-all cursor-pointer"
                                title="Hapus sesi bimbingan ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span>Status:</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                sesi.status === 'Diproses'
                                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                  : sesi.status === 'Disetujui'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              {sesi.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal Kartu Bimbingan */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc('kartu_bimbingan')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Kartu Bimbingan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKlkId(detailModalKlk.id);
                    setSubTab('logbook-mingguan');
                    setModalBimbinganKlkOpen(false);
                    setDetailModalKlk(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Buka Logbook Mingguan</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalBimbinganKlkOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL EDIT DATA PENDAFTARAN KLK MAHASISWA               */}
      {/* ======================================================= */}
      {modalEditKlkOpen && detailModalKlk && (
        <div
          id="modal-edit-klk"
          className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal Edit */}
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Edit Data Pendaftaran KLK Mahasiswa
                  </h3>
                  <p className="text-xs text-blue-200">
                    Departemen Kimia FSTeM Universitas Brawijaya &bull; Perbarui Data Usulan & Mitra
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEditKlkOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Batal dan Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Edit */}
            <form onSubmit={handleSaveEditKlk} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 text-xs bg-slate-50">
                {/* Identitas Mahasiswa Readonly */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Mahasiswa:</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{detailModalKlk.mahasiswaNama}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIM:</span>
                    <span className="font-mono font-bold text-slate-800">{detailModalKlk.nim}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kode Pendaftaran:</span>
                    <span className="font-mono font-bold text-[#002B49]">{detailModalKlk.kodePendaftaran}</span>
                  </div>
                </div>

                {/* Status Pendaftaran KLK Mahasiswa (Diproses, Disetujui, Ditolak) */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="font-bold text-slate-800 block text-xs">
                        Status Pendaftaran KLK Mahasiswa <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Tentukan status penetapan usulan pendaftaran KLK mahasiswa
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Status Terpilih:</span>
                      {editKlkForm.status === 'Diproses' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Diproses</span>
                        </span>
                      )}
                      {editKlkForm.status === 'Disetujui' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disetujui</span>
                        </span>
                      )}
                      {editKlkForm.status === 'Ditolak' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1 shadow-2xs">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Pilihan Card/Button: Diproses, Disetujui, Ditolak */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1. Diproses */}
                    <button
                      type="button"
                      id="btn-edit-status-diproses"
                      onClick={() => setEditKlkForm({ ...editKlkForm, status: 'Diproses' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        editKlkForm.status === 'Diproses'
                          ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500/40 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          editKlkForm.status === 'Diproses'
                            ? 'bg-amber-400 text-amber-950 font-bold'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-xs ${
                              editKlkForm.status === 'Diproses' ? 'text-amber-950 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            Diproses
                          </span>
                          {editKlkForm.status === 'Diproses' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Usulan ditelaah dan diverifikasi oleh Departemen Kimia
                        </p>
                      </div>
                    </button>

                    {/* 2. Disetujui */}
                    <button
                      type="button"
                      id="btn-edit-status-disetujui"
                      onClick={() => setEditKlkForm({ ...editKlkForm, status: 'Disetujui' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        editKlkForm.status === 'Disetujui'
                          ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/40 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          editKlkForm.status === 'Disetujui'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-xs ${
                              editKlkForm.status === 'Disetujui' ? 'text-emerald-950 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            Disetujui
                          </span>
                          {editKlkForm.status === 'Disetujui' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Usulan pendaftaran disetujui untuk dilaksanakan
                        </p>
                      </div>
                    </button>

                    {/* 3. Ditolak */}
                    <button
                      type="button"
                      id="btn-edit-status-ditolak"
                      onClick={() => setEditKlkForm({ ...editKlkForm, status: 'Ditolak' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        editKlkForm.status === 'Ditolak'
                          ? 'bg-red-50/90 border-red-400 ring-2 ring-red-500/40 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          editKlkForm.status === 'Ditolak'
                            ? 'bg-red-600 text-white font-bold'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-xs ${
                              editKlkForm.status === 'Ditolak' ? 'text-red-950 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            Ditolak
                          </span>
                          {editKlkForm.status === 'Ditolak' && (
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Usulan pendaftaran ditolak atau perlu perbaikan
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Dropdown Select Status */}
                  <div className="flex items-center gap-2 pt-1">
                    <label htmlFor="select-status-pendaftaran-klk" className="text-[11px] font-semibold text-slate-600">
                      Pilihan Dropdown:
                    </label>
                    <select
                      id="select-status-pendaftaran-klk"
                      value={editKlkForm.status}
                      onChange={(e) =>
                        setEditKlkForm({
                          ...editKlkForm,
                          status: e.target.value as 'Diproses' | 'Disetujui' | 'Ditolak'
                        })
                      }
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#002B49] cursor-pointer"
                    >
                      <option value="Diproses">Diproses</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Nama Instansi / Perusahaan / Mitra <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editKlkForm.namaMitra}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, namaMitra: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                        placeholder="Contoh: PT Petrokimia Gresik / Balai Riset Standarisasi Industri"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Alamat Instansi Mitra <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editKlkForm.alamatMitra}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, alamatMitra: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                        placeholder="Contoh: Jl. Jend. A. Yani, Gresik, Jawa Timur"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Bidang Pekerjaan / Laboratorium Analisis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={editKlkForm.bidangPekerjaan}
                      onChange={(e) => setEditKlkForm({ ...editKlkForm, bidangPekerjaan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                      placeholder="Contoh: Analisis Kualitas Produk & Pengendalian Mutu Menggunakan Spektrofotometri dan Kromatografi Gas"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Skema Pilihan KLK <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editKlkForm.skema}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, skema: e.target.value as SkemaKLK })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49]"
                      >
                        <option value="PKL">PKL</option>
                        <option value="Magang Berdampak (Prodi)">Magang Berdampak (Prodi)</option>
                        <option value="Magang Berdampak (Fakultas)">Magang Berdampak (Fakultas)</option>
                        <option value="Magang Industri Kimia">Magang Industri Kimia</option>
                        <option value="Riset Laboratorium Mitra">Riset Laboratorium Mitra</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Beban SKS Diakui <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editKlkForm.sksDiakui}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, sksDiakui: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49]"
                      >
                        <option value={3}>3 SKS (Mata Kuliah KLK Inti)</option>
                        <option value={7}>7 SKS (KLK + Pengayaan Pengetahuan)</option>
                        <option value={10}>10 SKS (KLK + 2 MK Terapan)</option>
                        <option value={13}>13 SKS (KLK + 3 MK Terapan)</option>
                        <option value={16}>16 SKS (KLK + 4 MK Terapan)</option>
                        <option value={20}>20 SKS (Full Semester)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Semester Mahasiswa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={14}
                        required
                        value={editKlkForm.semester}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, semester: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Tanggal Mulai Kegiatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editKlkForm.tanggalMulai}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, tanggalMulai: e.target.value })}
                        placeholder="Contoh: 01 Februari 2026"
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Tanggal Selesai Kegiatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editKlkForm.tanggalSelesai}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, tanggalSelesai: e.target.value })}
                        placeholder="Contoh: 30 Juni 2026"
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Dosen Pembimbing KLK <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editKlkForm.dosenPembimbingKLK}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, dosenPembimbingKLK: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49]"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={d.nama}>
                            {d.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Nama Pembimbing Lapangan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editKlkForm.mentorIndustri}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, mentorIndustri: e.target.value })}
                        placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Kontak Pembimbing Lapangan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editKlkForm.kontakMentor}
                        onChange={(e) => setEditKlkForm({ ...editKlkForm, kontakMentor: e.target.value })}
                        placeholder="Contoh: 0812-3456-7890"
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Form Edit */}
              <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalEditKlkOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span>Simpan Perubahan KLK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL PREVIEW DOKUMEN BERKAS KLK (PREVIEW DARI FORM UNGGAH) */}
      {/* ======================================================= */}
      {previewDocData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal Preview */}
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D4AF37] flex items-center justify-center border border-white/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Pratinjau Dokumen: {previewDocData.label}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#002B49]">
                      Preview
                    </span>
                  </div>
                  <p className="text-xs text-blue-200">
                    {previewDocData.category} &bull; Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-preview-doc"
                onClick={() => setPreviewDocData(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
              {/* Info File Card */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Berkas</span>
                  <span
                    className="font-bold text-slate-800 font-mono text-[11px] truncate block"
                    title={previewDocData.fileName}
                  >
                    {previewDocData.fileName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ukuran File</span>
                  <span className="font-bold text-slate-800">
                    {previewDocData.fileSize || '500 KB'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Unggah</span>
                  <span className="font-bold text-slate-800">
                    {previewDocData.uploadedAt || 'Terkini'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Dokumen</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Terverifikasi
                  </span>
                </div>
              </div>

              {/* Simulated Paper Document Viewer */}
              <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs font-serif text-slate-800 space-y-4 relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] rotate-[-25deg]">
                  <span className="text-6xl font-black tracking-widest text-[#002B49]">
                    KIMIA UB OFFICIAL
                  </span>
                </div>

                {/* Kop Surat Header */}
                <div className="text-center pb-3 border-b-2 border-slate-900 leading-snug">
                  <h4 className="font-bold text-xs uppercase tracking-wide">
                    KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                  </h4>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#002B49]">
                    UNIVERSITAS BRAWIJAYA &bull; FAKULTAS MIPA
                  </h3>
                  <p className="font-bold text-xs">DEPARTEMEN KIMIA - PROGRAM STUDI SARJANA KIMIA</p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">
                    Jl. Veteran Malang 65145, Telp: (0341) 575838, Email: kimia@ub.ac.id
                  </p>
                </div>

                {/* Document Title */}
                <div className="text-center pt-2">
                  <h2 className="text-sm sm:text-base font-bold underline uppercase tracking-wide">
                    {previewDocData.label}
                  </h2>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Nomor Arsip: REG-KLK/FSTeM-UB/{detailModalKlk?.nim || '2026'}/
                    {new Date().getFullYear()}
                  </p>
                </div>

                {/* Student Info Box in Document */}
                <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 text-xs font-sans space-y-1.5">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Nama Mahasiswa:</span>
                    <span className="col-span-2 font-bold text-slate-900">
                      {detailModalKlk?.mahasiswaNama || 'Mahasiswa Kimia'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">NIM:</span>
                    <span className="col-span-2 font-mono font-semibold text-slate-900">
                      {detailModalKlk?.nim || '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Instansi / Mitra KLK:</span>
                    <span className="col-span-2 font-semibold text-slate-900">
                      {detailModalKlk?.namaMitra || '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Dosen Pembimbing:</span>
                    <span className="col-span-2 text-slate-800">
                      {detailModalKlk?.dosenPembimbingKLK || '-'}
                    </span>
                  </div>
                </div>

                {/* Document Description / Text Body */}
                <div className="text-xs font-sans text-slate-700 leading-relaxed space-y-2 pt-1">
                  <p>
                    <strong>Keterangan Berkas:</strong> {previewDocData.description}
                  </p>
                  <p className="text-slate-600 italic">
                    Dokumen ini telah melalui proses unggah berkas resmi (Browse & Submit) pada portal SIM
                    Kuliah Lapangan Kimia (KLK) Departemen Kimia FSTeM Universitas Brawijaya dan dinyatakan
                    sah serta memenuhi syarat kelengkapan administrasi akademik.
                  </p>
                </div>

                {/* Tanda Tangan & QR Verification */}
                <div className="pt-4 flex items-end justify-between text-xs font-sans border-t border-slate-200">
                  <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200 text-[10px]">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Validasi Digital</div>
                      <div className="text-slate-500 font-mono">UB-VERIFIED-DOC</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">
                      Malang, {previewDocData.uploadedAt || '17 Sep 2026'}
                    </p>
                    <p className="font-bold text-[11px] text-[#002B49] mt-0.5">Pengelola Akademik KLK</p>
                    <div className="h-10 flex items-center justify-end">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        [ Ditandatangani & Diverifikasi Secara Digital ]
                      </span>
                    </div>
                    <p className="font-bold text-xs underline">Departemen Kimia FSTeM UB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal Preview */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                id="btn-download-from-preview"
                onClick={handleDownloadPreviewDoc}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Unduh Dokumen Berkas</span>
              </button>

              <button
                type="button"
                id="btn-close-preview-footer"
                onClick={() => setPreviewDocData(null)}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL GENERATE SURAT PENGANTAR KLK */}
      {/* ======================================================= */}
      {modalSuratPengantarOpen && detailModalKlk && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D4AF37] flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Surat Pengantar Resmi KLK (Generated)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#002B49]">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Departemen Kimia FSTeM Universitas Brawijaya &bull; No: B/1429/UN10.F09.04/KM.01.00/{new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-generate-surat-modal"
                onClick={() => setModalSuratPengantarOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Surat */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Surat Pengantar berhasil digenerate dan otomatis tersimpan ke Berkas Pendaftaran!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalSuratPengantarOpen(false);
                    setModalLampiranSuratOpen(true);
                  }}
                  className="font-bold underline text-emerald-900 hover:text-emerald-950 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Lihat Lampiran</span>
                </button>
              </div>

              {/* Tampilan Lembar Dokumen Surat Pengantar */}
              <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs font-serif text-slate-800 space-y-4 relative">
                {/* Kop Surat Header */}
                <div className="text-center pb-3 border-b-2 border-slate-900 leading-snug">
                  <h4 className="font-bold text-xs uppercase tracking-wide">
                    KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                  </h4>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#002B49]">
                    UNIVERSITAS BRAWIJAYA &bull; FAKULTAS MIPA
                  </h3>
                  <p className="font-bold text-xs">DEPARTEMEN KIMIA - PROGRAM STUDI SARJANA KIMIA</p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">
                    Jl. Veteran Malang 65145, Telp: (0341) 575838, Email: kimia@ub.ac.id | kimia.ub.ac.id
                  </p>
                </div>

                {/* Info Nomor & Hal */}
                <div className="grid grid-cols-2 text-xs font-sans gap-2 pt-1">
                  <div>
                    <p><span className="w-20 inline-block text-slate-500">Nomor</span>: B/1429/UN10.F09.04/KM.01.00/{new Date().getFullYear()}</p>
                    <p><span className="w-20 inline-block text-slate-500">Lampiran</span>: 1 (satu) berkas</p>
                    <p><span className="w-20 inline-block text-slate-500">Hal</span>: <strong className="text-slate-900">Permohonan Izin & Pengantar KLK</strong></p>
                  </div>
                  <div className="text-right text-slate-600">
                    Malang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Tujuan Surat */}
                <div className="text-xs font-sans pt-2">
                  <p>Kepada Yth.</p>
                  <p className="font-bold text-slate-900 text-sm">Pimpinan / Direktur / HRD</p>
                  <p className="font-semibold text-slate-800">{detailModalKlk.namaMitra}</p>
                  <p className="text-slate-500 text-[11px]">{detailModalKlk.alamatMitra || 'Di Tempat'}</p>
                </div>

                {/* Paragraf Pembuka */}
                <div className="text-xs font-sans text-slate-700 leading-relaxed space-y-2 pt-1">
                  <p>Dengan hormat,</p>
                  <p>
                    Sehubungan dengan pelaksanaan kurikulum Program Studi Sarjana (S1) Kimia Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya yang mewajibkan mahasiswa menempuh mata kuliah <strong>Kuliah Lapangan Kimia (KLK)</strong> sebagai sarana penerapan keilmuan kimia analitik, kimia fisik, kimia organik, anorganik, dan biokimia pada lingkungan industri, dengan ini kami mengajukan permohonan izin untuk mahasiswa:
                  </p>
                </div>

                {/* Box Data Mahasiswa */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs font-sans space-y-1.5">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Nama Lengkap:</span>
                    <span className="col-span-2 font-bold text-slate-900">{detailModalKlk.mahasiswaNama}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">NIM:</span>
                    <span className="col-span-2 font-mono font-semibold text-slate-900">{detailModalKlk.nim}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Bidang Pekerjaan:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{detailModalKlk.bidangPekerjaan || 'Analisis Kimia & Quality Control'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Dosen Pembimbing KLK:</span>
                    <span className="col-span-2 text-slate-800">{detailModalKlk.dosenPembimbingKLK || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Rencana Periode:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{detailModalKlk.tanggalMulai} s.d. {detailModalKlk.tanggalSelesai}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Beban Pengakuan SKS:</span>
                    <span className="col-span-2 font-bold text-[#002B49]">{detailModalKlk.sksDiakui || 7} SKS</span>
                  </div>
                </div>

                {/* Paragraf Penutup */}
                <div className="text-xs font-sans text-slate-700 leading-relaxed space-y-2 pt-1">
                  <p>
                    Besar harapan kami Bapak/Ibu dapat memberikan kesempatan kepada mahasiswa bersangkutan untuk melaksanakan kegiatan kuliah lapangan pada instansi yang Bapak/Ibu pimpin. Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="pt-4 flex items-end justify-between text-xs font-sans border-t border-slate-200">
                  <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200 text-[10px]">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Dokumen Resmi FSTeM UB</div>
                      <div className="text-slate-500 font-mono">AUTOGEN-SP-KLK</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[11px] text-[#002B49]">Ketua Departemen Kimia FSTeM UB</p>
                    <div className="h-10 flex items-center justify-end">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        [ Tanda Tangan & Cap Digital Sah ]
                      </span>
                    </div>
                    <p className="font-bold text-xs underline">Prof. Dr. Dra. Hermin Sulistyarti</p>
                    <p className="text-[10px] text-slate-500">NIP. 196307181989032001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal Generate */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-download-generated-surat"
                  onClick={handleDownloadSuratPengantar}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Unduh Surat Pengantar</span>
                </button>
                <button
                  type="button"
                  id="btn-open-lampiran-from-surat"
                  onClick={() => {
                    setModalSuratPengantarOpen(false);
                    setModalLampiranSuratOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Buka Lampiran</span>
                </button>
              </div>

              <button
                type="button"
                id="btn-close-surat-modal-footer"
                onClick={() => setModalSuratPengantarOpen(false)}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL LAMPIRAN SURAT PENGANTAR KLK */}
      {/* ======================================================= */}
      {modalLampiranSuratOpen && detailModalKlk && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal Lampiran */}
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Lampiran Surat Pengantar KLK
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950">
                      Lampiran I
                    </span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Daftar Mahasiswa Peserta & Spesifikasi Capaian Kompetensi KLK
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-lampiran-surat-modal"
                onClick={() => setModalLampiranSuratOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Lampiran"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Lampiran */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
              <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs font-serif text-slate-800 space-y-4">
                {/* Kop Surat Header */}
                <div className="text-center pb-3 border-b-2 border-slate-900 leading-snug">
                  <h4 className="font-bold text-xs uppercase tracking-wide">
                    KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                  </h4>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#002B49]">
                    UNIVERSITAS BRAWIJAYA &bull; FAKULTAS MIPA
                  </h3>
                  <p className="font-bold text-xs">DEPARTEMEN KIMIA</p>
                </div>

                {/* Judul Lampiran */}
                <div className="text-center pt-1 font-sans">
                  <h2 className="text-sm font-bold uppercase tracking-wide underline">
                    LAMPIRAN SURAT PENGANTAR KULIAH LAPANGAN KIMIA (KLK)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nomor: B/1429/UN10.F09.04/KM.01.00/{new Date().getFullYear()} &bull; Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Bagian I: Tabel Daftar Mahasiswa */}
                <div className="font-sans space-y-2 pt-2">
                  <h4 className="font-bold text-xs text-[#002B49]">
                    I. DAFTAR MAHASISWA PESERTA KLK:
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-[#002B49] text-white">
                        <tr>
                          <th className="p-2 border-r border-blue-900">No</th>
                          <th className="p-2 border-r border-blue-900">Nama Mahasiswa</th>
                          <th className="p-2 border-r border-blue-900">NIM</th>
                          <th className="p-2 border-r border-blue-900">Program Studi</th>
                          <th className="p-2 border-r border-blue-900">SKS</th>
                          <th className="p-2">Dosen Pembimbing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        <tr>
                          <td className="p-2 font-mono text-center">1</td>
                          <td className="p-2 font-bold text-slate-900">{detailModalKlk.mahasiswaNama}</td>
                          <td className="p-2 font-mono">{detailModalKlk.nim}</td>
                          <td className="p-2">S1 Kimia FSTeM UB</td>
                          <td className="p-2 font-bold text-[#002B49] text-center">{detailModalKlk.sksDiakui || 7} SKS</td>
                          <td className="p-2">{detailModalKlk.dosenPembimbingKLK || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bagian II: Rincian Target Kerja dan Modul Laboratorium */}
                <div className="font-sans space-y-2 pt-2">
                  <h4 className="font-bold text-xs text-[#002B49]">
                    II. KOMPETENSI DAN TARGET KERJA LABORATORIUM KIMIA:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <p className="font-bold text-slate-900">1. K3 & Manajemen Laboratorium</p>
                      <p className="text-slate-600 text-[10px]">
                        Standar penanganan bahan kimia berbahaya, MSDS, dan pengolahan limbah B3 industri.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <p className="font-bold text-slate-900">2. Instrumentasi Analisis</p>
                      <p className="text-slate-600 text-[10px]">
                        Pengoperasian instrumen analitik (GC-MS, HPLC, AAS, Spektrofotometer UV-Vis).
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <p className="font-bold text-slate-900">3. Validasi & Quality Control</p>
                      <p className="text-slate-600 text-[10px]">
                        Metode sampling, verifikasi akurasi/presisi, limit deteksi, dan sistem mutu ISO/IEC 17025.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <p className="font-bold text-slate-900">4. Logbook & Laporan Akhir</p>
                      <p className="text-slate-600 text-[10px]">
                        Pencatatan kegiatan harian, bimbingan berkala, penyusunan draft laporan, dan seminar evaluasi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pengesahan */}
                <div className="pt-4 flex items-end justify-between text-xs font-sans border-t border-slate-200">
                  <div className="text-slate-500 text-[10px]">
                    Dokumen Lampiran Sah Departemen Kimia UB
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[11px] text-[#002B49]">Ketua Departemen Kimia FSTeM UB</p>
                    <div className="h-8 flex items-center justify-end">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        [ Terverifikasi Resmi ]
                      </span>
                    </div>
                    <p className="font-bold text-xs underline">Prof. Dr. Dra. Hermin Sulistyarti</p>
                    <p className="text-[10px] text-slate-500">NIP. 196307181989032001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal Lampiran */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                id="btn-download-lampiran-file"
                onClick={handleDownloadLampiranSurat}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Unduh Lampiran Resmi</span>
              </button>

              <button
                type="button"
                id="btn-close-lampiran-footer"
                onClick={() => setModalLampiranSuratOpen(false)}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup Lampiran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL KHUSUS: NILAI DOSEN PEMBIMBING KLK */}
      {/* ======================================================= */}
      {modalNilaiDosenOpen && detailModalKlk && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D4AF37] flex items-center justify-center border border-white/20 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Nilai Dosen Pembimbing KLK
                  </h3>
                  <p className="text-xs text-blue-200">
                    Departemen Kimia FSTeM Universitas Brawijaya &bull; Evaluasi Pembimbingan & Akademik KLK
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-modal-nilai-dosen"
                onClick={() => {
                  setModalNilaiDosenOpen(false);
                  setActiveNilaiDosenSection(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/70 flex-1">
              {/* Toast Feedback Simpan */}
              {toastNilaiDosen && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{toastNilaiDosen}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToastNilaiDosen(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Identity Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                      Dosen Pembimbing
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {detailModalKlk.dosenPembimbingKLK || 'Dosen Pembimbing KLK'}
                    </span>
                    <span className="text-[10px] text-slate-500">Departemen Kimia FSTeM UB</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                      Mahasiswa Bimbingan
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {detailModalKlk.mahasiswaNama || detailModalKlk.namaMahasiswa}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">NIM: {detailModalKlk.nim}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                      Instansi / Mitra KLK
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {detailModalKlk.namaMitra}
                    </span>
                    <span className="text-[10px] text-slate-500">{detailModalKlk.kotaMitra}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                      Beban SKS & Bobot
                    </span>
                    <span className="font-bold text-emerald-700 block mt-0.5">
                      {detailModalKlk.sksDiakui || 7} SKS Terakui
                    </span>
                    <span className="text-[10px] text-slate-500">Bobot Dosen: 60% (Laporan & Seminar)</span>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* FIELD 1: LEMBAR PENILAIAN */}
              {/* ================================================= */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#002B49] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Lembar Penilaian
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Format instrumen penilaian, aksi input nilai, dan penayangan nilai dosen pembimbing
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    2 Komponen Penilaian
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* 1. Laporan Akhir Program */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#002B49] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          1
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                          Laporan Akhir Program
                        </h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                          Bobot 30%
                        </span>
                        <button
                          type="button"
                          id="btn-lembar-laporan-preview"
                          onClick={() =>
                            setActiveNilaiDosenSection({ mode: 'lembar', type: 'laporan' })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Rubrik & Format</span>
                        </button>
                        <button
                          type="button"
                          id="btn-lembar-laporan-unduh"
                          onClick={() => handleDownloadLembarPenilaian('laporan')}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Unduh Format Lembar Penilaian Laporan (.txt)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">
                      Rubrik evaluasi sistematika penulisan karya ilmiah, metodologi analisis kimia, dan interpretasi instrumen laboratorium (FTIR, GC-MS, HPLC, AAS).
                    </p>

                    {/* Actions inside Lembar Penilaian: Input Nilai & Tampil Nilai */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 min-w-[70px]">Input Nilai:</span>
                        <button
                          type="button"
                          id="btn-lembar-input-laporan"
                          onClick={() =>
                            setActiveNilaiDosenSection({ mode: 'input', type: 'laporan' })
                          }
                          className={`flex-1 inline-flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            activeNilaiDosenSection?.mode === 'input' && activeNilaiDosenSection.type === 'laporan'
                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm'
                              : 'bg-white hover:bg-blue-50/50 text-[#002B49] border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Laporan Akhir Program
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            Form
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 min-w-[70px]">Tampil Nilai:</span>
                        <button
                          type="button"
                          id="btn-lembar-tampil-laporan"
                          onClick={() =>
                            setActiveNilaiDosenSection({ mode: 'tampil', type: 'laporan' })
                          }
                          className={`flex-1 inline-flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            activeNilaiDosenSection?.mode === 'tampil' && activeNilaiDosenSection.type === 'laporan'
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                              : 'bg-white hover:bg-emerald-50/50 text-emerald-900 border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            Laporan Akhir Program
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">
                            {calculateTotalSkorLaporan(nilaiLaporanData.answers)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Mata Kuliah 1: Kemandirian Pengayaan Pengetahuan */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          2
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-[#002B49] uppercase tracking-wider bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                              Mata Kuliah 1
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                              Bobot 30%
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                            Kemandirian Pengayaan Pengetahuan
                          </h5>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="btn-lembar-kemandirian-preview"
                          onClick={() =>
                            setActiveNilaiDosenSection({ mode: 'lembar', type: 'kemandirian' })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-[#002B49] font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Rubrik & Format</span>
                        </button>
                        <button
                          type="button"
                          id="btn-lembar-kemandirian-unduh"
                          onClick={() => handleDownloadLembarPenilaian('kemandirian')}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Unduh Format Lembar Penilaian Kemandirian (.txt)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">
                      Evaluasi 3 butir kompetensi: perencanaan & pelaksanaan riset ilmiah mandiri, pemanfaatan sumber informasi ilmiah, dan analisis kritis literatur.
                    </p>

                    {/* Actions inside Lembar Penilaian: Input Nilai & Tampil Nilai */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 min-w-[70px]">Input Nilai:</span>
                        <button
                          type="button"
                          id="btn-lembar-input-kemandirian"
                          onClick={() =>
                            setActiveNilaiDosenSection({ mode: 'input', type: 'kemandirian' })
                          }
                          className={`flex-1 inline-flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            activeNilaiDosenSection?.mode === 'input' && activeNilaiDosenSection.type === 'kemandirian'
                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm'
                              : 'bg-white hover:bg-blue-50/50 text-[#002B49] border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="truncate">Kemandirian Pengayaan Pengetahuan</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                            3 Butir
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 min-w-[70px]">Tampil Nilai:</span>
                        <button
                          type="button"
                          id="btn-lembar-tampil-kemandirian"
                          onClick={() =>
                            setActiveNilaiDosenSection({ mode: 'tampil', type: 'kemandirian' })
                          }
                          className={`flex-1 inline-flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            activeNilaiDosenSection?.mode === 'tampil' && activeNilaiDosenSection.type === 'kemandirian'
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                              : 'bg-white hover:bg-emerald-50/50 text-emerald-900 border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">Kemandirian Pengayaan Pengetahuan</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold shrink-0">
                            {calculateTotalSkorKemandirian(nilaiKemandirianData.answers)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* INTERACTIVE PANEL: ACTIVE SECTION */}
              {/* ================================================= */}
              {activeNilaiDosenSection && (
                <div className="bg-white p-5 rounded-2xl border-2 border-[#002B49]/20 shadow-md space-y-4 animate-in fade-in">
                  {/* Mode: INPUT NILAI LAPORAN */}
                  {activeNilaiDosenSection.mode === 'input' && activeNilaiDosenSection.type === 'laporan' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                            Formulir Penilaian Dosen Pembimbing
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            Input Nilai: Laporan Akhir Program (13 Butir Pertanyaan)
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNilaiDosenSection(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                        >
                          Tutup Form ✕
                        </button>
                      </div>

                      {/* Pedoman Pembobotan Jawaban */}
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#002B49] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                            Pedoman Bobot Jawaban Penilaian:
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Skala Likert (Skor 20 - 100)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-0.5">
                          {OPSI_BOBOT_JAWABAN.map((opt) => (
                            <div
                              key={opt.bobot}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-100 shadow-2xs flex flex-col items-center text-center"
                            >
                              <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                              <span className="text-[10px] font-semibold text-[#002B49] mt-0.5">
                                Bobot {opt.bobot}{' '}
                                <span className="text-slate-600 font-normal">
                                  (Skor {opt.skor})
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 13 Pertanyaan Penilaian */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                          <span className="font-bold text-slate-800">
                            Daftar 13 Butir Evaluasi Capaian Pembelajaran & Kinerja:
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            Pilih salah satu opsi bobot jawaban untuk setiap butir
                          </span>
                        </div>

                        {DAFTAR_PERTANYAAN_LAPORAN.map((item) => {
                          const currentBobot = nilaiLaporanData.answers[item.id] ?? 4;
                          const currentOpt =
                            OPSI_BOBOT_JAWABAN.find((o) => o.bobot === currentBobot) ||
                            OPSI_BOBOT_JAWABAN[3];

                          return (
                            <div
                              key={item.id}
                              className="p-3 sm:p-3.5 bg-slate-50/90 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors space-y-2.5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs">
                                    {item.id}
                                  </span>
                                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                                    {item.pertanyaan}
                                  </p>
                                </div>
                                <div className="shrink-0 self-end sm:self-start">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#002B49] px-2 py-0.5 rounded-md bg-blue-100/70 border border-blue-200">
                                    <span>Pilihan:</span>
                                    <span className="font-extrabold text-[#D4AF37]">
                                      {currentOpt.label}
                                    </span>
                                    <span className="text-slate-500">
                                      (B: {currentOpt.bobot} | {currentOpt.skor})
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Pilihan Opsi 1..5 */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-0.5">
                                {OPSI_BOBOT_JAWABAN.map((opt) => {
                                  const isSelected = currentBobot === opt.bobot;
                                  return (
                                    <button
                                      key={opt.bobot}
                                      type="button"
                                      id={`btn-laporan-q${item.id}-b${opt.bobot}`}
                                      onClick={() =>
                                        setNilaiLaporanData((prev) => ({
                                          ...prev,
                                          answers: {
                                            ...prev.answers,
                                            [item.id]: opt.bobot
                                          }
                                        }))
                                      }
                                      className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <span className="flex items-center gap-1">
                                        {isSelected && (
                                          <CheckCircle2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                                        )}
                                        <span>{opt.label}</span>
                                      </span>
                                      <span
                                        className={`text-[9px] mt-0.5 font-normal ${
                                          isSelected ? 'text-[#D4AF37]' : 'text-slate-600'
                                        }`}
                                      >
                                        Bobot {opt.bobot} • Skor {opt.skor}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Catatan / Feedback */}
                      <div className="space-y-1.5 pt-1">
                        <label
                          htmlFor="input-laporan-catatan"
                          className="font-bold text-slate-800 text-xs"
                        >
                          Catatan & Evaluasi Dosen Pembimbing untuk Mahasiswa:
                        </label>
                        <textarea
                          id="input-laporan-catatan"
                          rows={3}
                          value={nilaiLaporanData.catatan}
                          onChange={(e) =>
                            setNilaiLaporanData({
                              ...nilaiLaporanData,
                              catatan: e.target.value
                            })
                          }
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                          placeholder="Tuliskan catatan perbaikan atau feedback untuk laporan akhir mahasiswa..."
                        />
                      </div>

                      {/* Summary Score & Action */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs text-slate-500 font-semibold">
                            Kalkulasi Nilai Akhir Laporan (13 Butir):
                          </span>
                          <span className="text-base font-extrabold text-[#002B49]">
                            {calculateTotalSkorLaporan(nilaiLaporanData.answers)} / 100
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37] text-[#002B49]">
                            Nilai Huruf: {getGradeHuruf(calculateTotalSkorLaporan(nilaiLaporanData.answers))}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            (13 dari 13 butir dinilai)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            id="btn-simpan-nilai-laporan"
                            onClick={() => {
                              const dateNow = new Date().toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              });
                              setNilaiLaporanData({
                                ...nilaiLaporanData,
                                isSaved: true,
                                updatedAt: dateNow
                              });
                              setToastNilaiDosen(
                                'Nilai Laporan Akhir Program (13 butir pertanyaan) berhasil disimpan dan tervalidasi!'
                              );
                              setTimeout(() => setToastNilaiDosen(null), 5000);
                            }}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Simpan Nilai Laporan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode: INPUT NILAI KEMANDIRIAN (MATA KULIAH 1) */}
                  {activeNilaiDosenSection.mode === 'input' && activeNilaiDosenSection.type === 'kemandirian' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#002B49] text-[#D4AF37] text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            Mata Kuliah 1
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            Mata Kuliah 1 : Kemandirian Pengayaan Pengetahuan
                          </h5>
                          <p className="text-xs text-slate-500">
                            Formulir Penilaian 3 Butir Sikap Kemandirian & Pengayaan Keilmuan Mahasiswa
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNilaiDosenSection(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          Tutup Form ✕
                        </button>
                      </div>

                      {/* Pedoman Bobot Jawaban Penilaian */}
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#002B49] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                            Pedoman Bobot Jawaban Penilaian - Mata Kuliah 1:
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Skala Likert (Skor 20 - 100)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {OPSI_BOBOT_JAWABAN.map((opt) => (
                            <div
                              key={opt.bobot}
                              className="p-2 bg-white rounded-lg border border-blue-100 text-center shadow-2xs"
                            >
                              <div className="font-bold text-xs text-slate-900">{opt.label}</div>
                              <div className="text-[11px] text-[#002B49] font-semibold mt-0.5">
                                Bobot {opt.bobot}{' '}
                                <span className="text-slate-500 font-normal">({opt.skor} poin)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3 Butir Pertanyaan Penilaian */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="font-bold text-slate-800">
                            Daftar 3 Butir Pertanyaan Evaluasi Mata Kuliah 1:
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Pilih salah satu opsi bobot jawaban untuk setiap butir
                          </span>
                        </div>

                        <div className="space-y-3">
                          {DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) => {
                            const currentBobot = nilaiKemandirianData.answers[q.id] ?? 4;
                            return (
                              <div
                                key={q.id}
                                className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-[#002B49] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                                    {q.id}
                                  </span>
                                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed flex-1">
                                    {q.pertanyaan}
                                  </p>
                                </div>

                                {/* Opsi Jawaban: Tidak Tampak, Kurang, Cukup, Baik, Sangat Baik */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 pl-0 sm:pl-8">
                                  {OPSI_BOBOT_JAWABAN.map((opt) => {
                                    const isSelected = currentBobot === opt.bobot;
                                    return (
                                      <button
                                        key={opt.bobot}
                                        type="button"
                                        onClick={() => {
                                          setNilaiKemandirianData({
                                            ...nilaiKemandirianData,
                                            answers: {
                                              ...nilaiKemandirianData.answers,
                                              [q.id]: opt.bobot
                                            }
                                          });
                                        }}
                                        className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer border ${
                                          isSelected
                                            ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs ring-1 ring-[#002B49]'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                      >
                                        <span className="text-[11px] leading-tight text-center">{opt.label}</span>
                                        <span
                                          className={`text-[10px] mt-0.5 ${
                                            isSelected ? 'text-[#D4AF37] font-bold' : 'text-slate-500'
                                          }`}
                                        >
                                          Bobot {opt.bobot} ({opt.skor})
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Catatan / Feedback */}
                      <div className="space-y-1.5 pt-1">
                        <label htmlFor="input-kemandirian-catatan" className="font-bold text-slate-800 text-xs">
                          Catatan & Evaluasi Kemandirian oleh Dosen Pembimbing:
                        </label>
                        <textarea
                          id="input-kemandirian-catatan"
                          rows={3}
                          value={nilaiKemandirianData.catatan}
                          onChange={(e) =>
                            setNilaiKemandirianData({
                              ...nilaiKemandirianData,
                              catatan: e.target.value
                            })
                          }
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                          placeholder="Tuliskan catatan apresiasi atau evaluasi kemandirian mahasiswa di industri..."
                        />
                      </div>

                      {/* Summary Score & Action */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 font-semibold">
                            Rata-rata Skor Kemandirian:
                          </span>
                          <span className="text-base font-extrabold text-emerald-800">
                            {calculateTotalSkorKemandirian(nilaiKemandirianData.answers)} / 100
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37] text-[#002B49]">
                            Nilai Huruf: {getGradeHuruf(calculateTotalSkorKemandirian(nilaiKemandirianData.answers))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            id="btn-simpan-nilai-kemandirian"
                            onClick={() => {
                              const dateNow = new Date().toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              });
                              setNilaiKemandirianData({
                                ...nilaiKemandirianData,
                                isSaved: true,
                                updatedAt: dateNow
                              });
                              setToastNilaiDosen(
                                'Nilai Mata Kuliah 1: Kemandirian Pengayaan Pengetahuan (3 butir) berhasil disimpan dan tervalidasi!'
                              );
                              setTimeout(() => setToastNilaiDosen(null), 5000);
                            }}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Simpan Nilai Kemandirian
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode: TAMPIL NILAI LAPORAN */}
                  {activeNilaiDosenSection.mode === 'tampil' && activeNilaiDosenSection.type === 'laporan' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                            Rekapitulasi Penilaian Dosen Pembimbing
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            Tampil Nilai: Laporan Akhir Program (13 Butir Pertanyaan)
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNilaiDosenSection(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                        >
                          Tutup Tampilan ✕
                        </button>
                      </div>

                      {/* Hero Score Badge */}
                      {(() => {
                        const totalSkor = calculateTotalSkorLaporan(nilaiLaporanData.answers);
                        const gradeHuruf = getGradeHuruf(totalSkor);
                        const predikat =
                          totalSkor >= 80
                            ? 'Sangat Baik'
                            : totalSkor >= 70
                            ? 'Baik'
                            : totalSkor >= 60
                            ? 'Cukup'
                            : 'Kurang';

                        return (
                          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-[#002B49] text-white flex flex-col items-center justify-center font-extrabold shadow-sm shrink-0">
                                <span className="text-xl leading-none text-[#D4AF37]">{gradeHuruf}</span>
                                <span className="text-[9px] text-blue-200 font-normal mt-0.5">{predikat}</span>
                              </div>
                              <div>
                                <span className="text-[11px] text-slate-500 font-semibold block">Total Skor Akhir (13 Butir):</span>
                                <div className="text-2xl font-black text-slate-900">
                                  {totalSkor}{' '}
                                  <span className="text-sm font-medium text-slate-500">/ 100</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right sm:border-l sm:border-blue-200 sm:pl-4 space-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tervalidasi Dosen Pembimbing</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Terakhir diupdate: {nilaiLaporanData.updatedAt}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Criteria breakdown table - 13 Questions */}
                      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#002B49] text-white font-bold">
                            <tr>
                              <th className="px-3 py-2.5 w-10 text-center">No</th>
                              <th className="px-3 py-2.5">Pertanyaan & Aspek Evaluasi Laporan</th>
                              <th className="px-3 py-2.5 text-center w-28">Jawaban</th>
                              <th className="px-3 py-2.5 text-center w-16">Bobot</th>
                              <th className="px-3 py-2.5 text-right w-16">Skor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {DAFTAR_PERTANYAAN_LAPORAN.map((q) => {
                              const bobot = nilaiLaporanData.answers[q.id] ?? 4;
                              const opt =
                                OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) ||
                                OPSI_BOBOT_JAWABAN[3];

                              return (
                                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-3 py-2.5 text-slate-500 text-center font-bold">
                                    {q.id}
                                  </td>
                                  <td className="px-3 py-2.5 font-medium text-slate-800 leading-relaxed">
                                    {q.pertanyaan}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        bobot === 5
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : bobot === 4
                                          ? 'bg-blue-100 text-blue-800'
                                          : bobot === 3
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {opt.label}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-700">
                                    {opt.bobot}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono font-bold text-[#002B49]">
                                    {opt.skor}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200">
                            <tr>
                              <td colSpan={3} className="px-3 py-2.5 text-right">
                                Rata-rata Skor Akhir (13 Butir):
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono font-bold">
                                {(
                                  DAFTAR_PERTANYAAN_LAPORAN.reduce(
                                    (acc, q) => acc + (nilaiLaporanData.answers[q.id] ?? 4),
                                    0
                                  ) / 13
                                ).toFixed(1)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-sm font-extrabold text-[#002B49]">
                                {calculateTotalSkorLaporan(nilaiLaporanData.answers)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Evaluasi Notes */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 block mb-1">
                          Catatan Masukan Dosen Pembimbing:
                        </span>
                        <p className="text-slate-700 italic">
                          "{nilaiLaporanData.catatan}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          id="btn-unduh-rekap-laporan"
                          onClick={() => handleDownloadRekapNilai('laporan')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Unduh Rekap Laporan (.xlsx)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode: TAMPIL NILAI KEMANDIRIAN (MATA KULIAH 1) */}
                  {activeNilaiDosenSection.mode === 'tampil' && activeNilaiDosenSection.type === 'kemandirian' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#002B49] text-[#D4AF37] text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            Mata Kuliah 1
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            Tampil Nilai: Mata Kuliah 1 - Kemandirian Pengayaan Pengetahuan
                          </h5>
                          <p className="text-xs text-slate-500">
                            Rekapitulasi Penilaian 3 Butir Sikap Kemandirian Dosen Pembimbing KLK
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNilaiDosenSection(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          Tutup Tampilan ✕
                        </button>
                      </div>

                      {/* Hero Score Badge */}
                      {(() => {
                        const totalSkor = calculateTotalSkorKemandirian(nilaiKemandirianData.answers);
                        const gradeHuruf = getGradeHuruf(totalSkor);
                        return (
                          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
                                <span className="text-xl leading-none text-[#D4AF37]">{gradeHuruf}</span>
                                <span className="text-[9px] text-emerald-200 font-normal mt-0.5">
                                  {gradeHuruf === 'A' ? 'Sangat Baik' : gradeHuruf === 'B+' || gradeHuruf === 'B' ? 'Baik' : 'Cukup'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[11px] text-slate-500 font-semibold block">Total Rata-rata Skor Kemandirian:</span>
                                <div className="text-2xl font-black text-slate-900">
                                  {totalSkor}{' '}
                                  <span className="text-sm font-medium text-slate-500">/ 100</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4 space-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tervalidasi Dosen Pembimbing</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Terakhir diupdate: {nilaiKemandirianData.updatedAt}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 3 Questions breakdown table */}
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2.5 w-10 text-center">No</th>
                              <th className="px-3 py-2.5">Butir Pertanyaan Penilaian Mata Kuliah 1</th>
                              <th className="px-3 py-2.5 text-center">Opsi Terpilih</th>
                              <th className="px-3 py-2.5 text-center">Bobot</th>
                              <th className="px-3 py-2.5 text-right">Skor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) => {
                              const bobot = nilaiKemandirianData.answers[q.id] ?? 4;
                              const skor = bobot * 20;
                              const opt = OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot);
                              return (
                                <tr key={q.id} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-2.5 text-center font-bold text-slate-500">{q.id}</td>
                                  <td className="px-3 py-2.5 font-medium text-slate-900">{q.pertanyaan}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-100">
                                      {opt?.label ?? '-'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-slate-700 font-mono font-bold">
                                    {bobot}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-extrabold text-emerald-800">
                                    {skor}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                            <tr>
                              <td colSpan={4} className="px-3 py-2.5 text-right">
                                Rata-rata Skor Kemandirian (Mata Kuliah 1):
                              </td>
                              <td className="px-3 py-2.5 text-right font-black text-emerald-800 text-sm">
                                {calculateTotalSkorKemandirian(nilaiKemandirianData.answers)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Evaluasi Notes */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 block mb-1">
                          Catatan Apresiasi & Masukan Dosen Pembimbing:
                        </span>
                        <p className="text-slate-700 italic">
                          "{nilaiKemandirianData.catatan}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveNilaiDosenSection({ mode: 'input', type: 'kemandirian' })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Ubah / Edit Nilai</span>
                        </button>
                        <button
                          type="button"
                          id="btn-unduh-rekap-kemandirian"
                          onClick={() => handleDownloadRekapNilai('kemandirian')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Unduh Rekap Kemandirian (.xlsx)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode: LEMBAR PENILAIAN RUBRIK PREVIEW */}
                  {activeNilaiDosenSection.mode === 'lembar' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                            Format Rubrik Resmi Departemen Kimia UB
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            Lembar Penilaian:{' '}
                            {activeNilaiDosenSection.type === 'laporan'
                              ? 'Laporan Akhir Program'
                              : 'Kemandiriaan Pengayaan Pengetahuan'}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNilaiDosenSection(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          Tutup Rubrik ✕
                        </button>
                      </div>

                      {activeNilaiDosenSection.type === 'laporan' ? (
                        <div className="space-y-3.5 text-xs text-slate-700">
                          {/* Skala Penilaian */}
                          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2">
                            <span className="font-bold text-[#002B49] block">
                              Skala & Bobot Pilihan Jawaban:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {OPSI_BOBOT_JAWABAN.map((opt) => (
                                <div
                                  key={opt.bobot}
                                  className="p-2 bg-white rounded-lg border border-blue-100 text-center"
                                >
                                  <div className="font-bold text-slate-900">{opt.label}</div>
                                  <div className="text-[10px] text-[#002B49] font-medium">
                                    Bobot {opt.bobot} (Skor {opt.skor})
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 13 Butir Pertanyaan */}
                          <div className="space-y-2">
                            <span className="font-bold text-slate-800 block text-xs">
                              Daftar 13 Butir Pertanyaan Penilaian Laporan Akhir Program:
                            </span>
                            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                              {DAFTAR_PERTANYAAN_LAPORAN.map((q) => (
                                <div
                                  key={q.id}
                                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5"
                                >
                                  <span className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                    {q.id}
                                  </span>
                                  <p className="text-xs text-slate-800 leading-relaxed">
                                    {q.pertanyaan}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveNilaiDosenSection({ mode: 'input', type: 'laporan' })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Mulai Input Nilai (13 Butir)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadLembarPenilaian('laporan')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Unduh Lembar Rubrik</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs text-slate-700">
                          {/* Heading & Scale info */}
                          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-[#002B49] uppercase tracking-wider bg-white border border-blue-200 px-2 py-0.5 rounded">
                                Mata Kuliah 1
                              </span>
                              <span className="font-bold text-slate-900 text-xs">
                                Rubrik Penilaian Kemandirian Pengayaan Pengetahuan (3 Butir)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Penilaian menggunakan Skala Likert 5 Tingkat dengan bobot nilai terkonversi:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-0.5">
                              {OPSI_BOBOT_JAWABAN.map((opt) => (
                                <div
                                  key={opt.bobot}
                                  className="p-1.5 bg-white rounded-lg border border-blue-100 text-center"
                                >
                                  <div className="font-bold text-[11px] text-slate-900">{opt.label}</div>
                                  <div className="text-[10px] text-[#002B49] font-medium">
                                    Bobot {opt.bobot} ({opt.skor} poin)
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3 Questions list */}
                          <div className="space-y-2">
                            {DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) => (
                              <div
                                key={q.id}
                                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  {q.id}
                                </span>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-800 text-xs leading-relaxed">
                                    {q.pertanyaan}
                                  </p>
                                  <span className="text-[10px] text-slate-500 mt-1 block">
                                    Opsi Jawaban: Tidak Tampak (1) &bull; Kurang (2) &bull; Cukup (3) &bull; Baik (4) &bull; Sangat Baik (5)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveNilaiDosenSection({ mode: 'input', type: 'kemandirian' })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Mulai Input Nilai (3 Butir)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadLembarPenilaian('kemandirian')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Unduh Lembar Rubrik</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadLembarPenilaian(activeNilaiDosenSection.type)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Unduh Format Lembar Ini</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Departemen Kimia FSTeM &bull; Universitas Brawijaya
              </div>
              <button
                type="button"
                id="btn-close-modal-nilai-dosen-footer"
                onClick={() => {
                  setModalNilaiDosenOpen(false);
                  setActiveNilaiDosenSection(null);
                }}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL KHUSUS: NILAI PEMBIMBING LAPANG KLK                */}
      {/* ======================================================= */}
      {modalNilaiPembimbingLapangOpen && detailModalKlk && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-bold shadow-sm">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Nilai Pembimbing Lapang KLK
                  </h3>
                  <p className="text-xs text-slate-200">
                    Departemen Kimia FSTeM Universitas Brawijaya &bull; Evaluasi Praktik Industri & Pembimbingan Lapangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-modal-nilai-lapang"
                onClick={() => setModalNilaiPembimbingLapangOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notification Toast */}
            {toastNilaiLapang && (
              <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center justify-between shadow-inner shrink-0">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{toastNilaiLapang}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setToastNilaiLapang(null)}
                  className="text-white hover:text-emerald-100 text-xs font-bold ml-4 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
              {/* Identity & Context Banner */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    Pembimbing Lapangan / Mitra
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {detailModalKlk.mentorIndustri || 'Pembimbing Lapangan'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {detailModalKlk.namaMitra} ({detailModalKlk.kotaMitra})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    Mahasiswa Bimbingan
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {detailModalKlk.namaMahasiswa}
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    NIM: {detailModalKlk.nim} &bull; S1 Kimia
                  </p>
                </div>
                <div className="sm:border-l sm:border-slate-200 sm:pl-4 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    Bobot Penilaian Lapangan
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#002B49] text-white">
                      Bobot 40%
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Nilai Saat Ini: {detailModalKlk.nilaiIndustri || modalNilaiIndustri || 85} ({detailModalKlk.nilaiAkhirHuruf || 'A'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs for Modal Sections */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl border border-slate-300/80 text-xs font-bold overflow-x-auto">
                <button
                  type="button"
                  id="tab-lapang-semua"
                  onClick={() => setActiveTabLapang('semua')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                    activeTabLapang === 'semua'
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Semua Field
                </button>
                <button
                  type="button"
                  id="tab-lapang-lembar"
                  onClick={() => setActiveTabLapang('lembar')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                    activeTabLapang === 'lembar'
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Lembar Penilaian
                </button>
                <button
                  type="button"
                  id="tab-lapang-tampil"
                  onClick={() => setActiveTabLapang('tampil')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                    activeTabLapang === 'tampil'
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Tampil Nilai
                </button>
              </div>

              {/* ================================================= */}
              {/* FIELD 1: LEMBAR PENILAIAN                         */}
              {/* ================================================= */}
              {(activeTabLapang === 'semua' || activeTabLapang === 'lembar') && (
                <div id="field-lembar-penilaian" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider block">
                        Field Penilaian 1
                      </span>
                      <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#002B49]" />
                        <span>Lembar Penilaian</span>
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      Instrumen Evaluasi Capaian Kinerja & Praktik Industri
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Item 1: Laporan Akhir Program */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-3 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#002B49] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            1. Laporan Akhir Program
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Evaluasi 13 butir capaian kerja industri, ketelitian analisis, kepatuhan K3 laboratorium, dan laporan teknis
                          </p>
                        </div>
                      </div>

                      {/* Grid 4 Field untuk 1. Laporan Akhir Program */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200">
                        {/* 1. Field Unduh Template */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200/90 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                              Field Unduh Template
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Format Baku Dokumen
                            </p>
                          </div>
                          <button
                            type="button"
                            id="link-unduh-lapang-laporan"
                            onClick={() => handleDownloadLembarPenilaianLapang('laporan')}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100 rounded-xl border border-blue-200 cursor-pointer transition-colors shadow-2xs"
                            title="Unduh Lembar Penilaian Laporan Akhir Program"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>Unduh Di Sini</span>
                          </button>
                        </div>

                        {/* 2. Field File Penilaian */}
                        <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                              Field File Penilaian
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Kelola & Unggah Berkas
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-kuning-lapang-laporan"
                            onClick={() => setIsLaporanUploadOpen((prev) => !prev)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl border shadow-xs transition-all cursor-pointer ${
                              isLaporanUploadOpen
                                ? 'bg-amber-500 text-amber-950 border-amber-600 ring-2 ring-amber-400'
                                : 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 border-amber-500 hover:shadow-sm'
                            }`}
                            title="Tampilkan / Buka Laporan Akhir Program (Browse, Submit, Preview)"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-950" />
                            <span>Laporan Akhir Program</span>
                          </button>
                        </div>

                        {/* 3. Field Input Nilai */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                              Field Input Nilai
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Input 13 Butir Evaluasi
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-hijau-lapang-laporan"
                            onClick={() => {
                              setIsLaporanInputOpen((prev) => !prev);
                            }}
                            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl border shadow-xs transition-all cursor-pointer ${
                              isLaporanInputOpen
                                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-400'
                                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-700'
                            }`}
                            title="Buka / Tutup Formulir Input Nilai: Laporan Akhir Program"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-white" />
                            <span>Laporan Akhir Program</span>
                          </button>
                        </div>

                        {/* 4. Field Tampil Nilai */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
                              Field Tampil Nilai
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Rekap Skor & Rubrik
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-biru-lapang-laporan"
                            onClick={() => {
                              setActiveTabLapang('tampil');
                              setSubSectionLapangTampil('laporan');
                              const el = document.getElementById('field-tampil-nilai');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl border border-blue-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                            title="Buka Tampil Nilai: Laporan Akhir Program"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>Laporan Akhir Program</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Box: Laporan Akhir Program dengan Browse, Submit, Preview */}
                      {isLaporanUploadOpen && (
                        <div className="mt-3 p-4 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-3 animate-in fade-in duration-200 shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="font-extrabold text-slate-900 text-sm">
                                  Laporan Akhir Program
                                </h6>
                                <p className="text-[11px] text-amber-900 font-medium">
                                  Kelola dan unggah berkas lembar penilaian Laporan Akhir Program dari pembimbing lapangan
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{berkasFileLapangData.laporan.status}</span>
                            </span>
                          </div>

                          {/* Info File Saat Ini / Baru Terpilih */}
                          <div className="p-3 bg-white rounded-lg border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                                {selectedLaporanFile ? 'File Terpilih (Klik Submit untuk menyimpan):' : 'Berkas Terdaftar Saat Ini:'}
                              </span>
                              <span className="font-mono font-bold text-slate-900 block truncate text-xs sm:text-sm text-blue-900">
                                {selectedLaporanFile ? selectedLaporanFile.name : berkasFileLapangData.laporan.fileName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono shrink-0 sm:text-right">
                              <span>Ukuran: {selectedLaporanFile ? `${(selectedLaporanFile.size / 1024).toFixed(1)} KB` : berkasFileLapangData.laporan.fileSize}</span>
                              <span className="block text-[10px] text-slate-400">
                                Tanggal: {berkasFileLapangData.laporan.uploadDate}
                              </span>
                            </div>
                          </div>

                          {/* Hidden Input File untuk Browse */}
                          <input
                            type="file"
                            ref={laporanFileInputRef}
                            className="hidden"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleLaporanFileBrowse}
                          />

                          {/* Action Buttons: Browse, Submit, Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            {/* 1. BROWSE */}
                            <button
                              type="button"
                              id="btn-lapang-laporan-browse"
                              onClick={() => laporanFileInputRef.current?.click()}
                              className="py-2 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Pilih berkas Laporan Akhir Program (Browse)"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                              <span>Browse</span>
                            </button>

                            {/* 2. SUBMIT */}
                            <button
                              type="button"
                              id="btn-lapang-laporan-submit"
                              onClick={handleLaporanFileSubmit}
                              className="py-2 px-3 bg-[#002B49] hover:bg-[#003B66] active:bg-[#001D33] text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Unggah dan simpan berkas Laporan Akhir Program (Submit)"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Submit</span>
                            </button>

                            {/* 3. PREVIEW */}
                            <button
                              type="button"
                              id="btn-lapang-laporan-preview"
                              onClick={() =>
                                setPreviewFileLapangModal({
                                  title: 'File Lembar Penilaian Laporan Akhir Program',
                                  type: 'laporan'
                                })
                              }
                              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Pratinjau Berkas Laporan Akhir Program (Preview)"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expandable Box: Input Nilai Laporan Akhir Program (13 Butir) */}
                      {isLaporanInputOpen && (
                        <div className="mt-3 p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl space-y-4 animate-in fade-in duration-200 shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                                <Edit3 className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="font-extrabold text-slate-900 text-sm">
                                  Input Nilai: Laporan Akhir Program
                                </h6>
                                <p className="text-[11px] text-emerald-950 font-medium">
                                  Formulir penilaian 13 butir capaian kerja industri & laporan teknis (Skor 20 - 100)
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs font-mono">
                              Skor: {calculateTotalSkorLaporan(nilaiLaporanLapangData.answers)} / 100 ({getGradeHuruf(calculateTotalSkorLaporan(nilaiLaporanLapangData.answers))})
                            </span>
                          </div>

                          {/* Pedoman Pembobotan Jawaban */}
                          <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#002B49] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                                Pedoman Bobot Jawaban Pembimbing Lapang:
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Skala Likert (Skor 20 - 100)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-0.5">
                              {OPSI_BOBOT_JAWABAN.map((opt) => (
                                <div
                                  key={opt.bobot}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center text-center"
                                >
                                  <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                                  <span className="text-[10px] font-semibold text-[#002B49] mt-0.5">
                                    Bobot {opt.bobot} <span className="text-slate-600 font-normal">(Skor {opt.skor})</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 13 Pertanyaan Evaluasi Laporan */}
                          <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                              <span className="font-bold text-slate-800">
                                Daftar 13 Butir Evaluasi Capaian Praktik Industri & Laporan Akhir:
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">
                                Pilih bobot untuk setiap butir
                              </span>
                            </div>

                            {DAFTAR_PERTANYAAN_LAPORAN.map((item) => {
                              const currentBobot = nilaiLaporanLapangData.answers[item.id] ?? 4;
                              return (
                                <div
                                  key={item.id}
                                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                                    <div className="flex items-start gap-2.5">
                                      <span className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs">
                                        {item.id}
                                      </span>
                                      <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                                        {item.pertanyaan}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0 self-end sm:self-start font-mono">
                                      Skor: {currentBobot * 20}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                                    {OPSI_BOBOT_JAWABAN.map((opt) => {
                                      const isSelected = currentBobot === opt.bobot;
                                      return (
                                        <button
                                          type="button"
                                          key={opt.bobot}
                                          onClick={() => {
                                            setNilaiLaporanLapangData((prev) => ({
                                              ...prev,
                                              answers: {
                                                ...prev.answers,
                                                [item.id]: opt.bobot
                                              }
                                            }));
                                          }}
                                          className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                            isSelected
                                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs scale-[1.02]'
                                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          <span>{opt.label}</span>
                                          <span
                                            className={`text-[9px] font-medium ${
                                              isSelected ? 'text-[#D4AF37]' : 'text-slate-400'
                                            }`}
                                          >
                                            Bobot {opt.bobot} ({opt.skor})
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Catatan Feedback */}
                          <div className="space-y-1.5 pt-2">
                            <label className="block text-xs font-bold text-slate-800">
                              Catatan Masukan Pembimbing Lapang:
                            </label>
                            <textarea
                              rows={3}
                              value={nilaiLaporanLapangData.catatan}
                              onChange={(e) =>
                                setNilaiLaporanLapangData((prev) => ({
                                  ...prev,
                                  catatan: e.target.value
                                }))
                              }
                              placeholder="Tuliskan evaluasi kinerja teknis, kedisiplinan analisis laboratorium, dan kelayakan laporan industri..."
                              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white shadow-2xs"
                            />
                          </div>

                          {/* Simpan & Skor Summary */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-emerald-200">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-700">Skor Terhitung:</span>
                              <span className="text-base font-extrabold font-mono text-[#002B49]">
                                {calculateTotalSkorLaporan(nilaiLaporanLapangData.answers)} / 100
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37] text-[#002B49]">
                                Nilai Huruf: {getGradeHuruf(calculateTotalSkorLaporan(nilaiLaporanLapangData.answers))}
                              </span>
                            </div>
                            <button
                              type="button"
                              id="btn-simpan-lapang-laporan-drawer"
                              onClick={() => handleSimpanNilaiLapang('laporan')}
                              className="w-full sm:w-auto px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Simpan Nilai Laporan Akhir Program</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Item 2: Kemandiriaan Pengayaan Pengetahuan */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-3 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#002B49] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                            2. Kemandiriaan Pengayaan Pengetahuan
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Evaluasi kemandirian inisiatif riset/proyek, eksplorasi SOP ilmiah, dan analisis kritis pemecahan masalah laboratorium
                          </p>
                        </div>
                      </div>

                      {/* Grid 4 Field untuk 2. Kemandiriaan Pengayaan Pengetahuan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200">
                        {/* 1. Field Unduh Template */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200/90 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                              Field Unduh Template
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Format Baku Dokumen
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-unduh-di-sini-lapang-kemandirian"
                            onClick={() => handleDownloadLembarPenilaianLapang('kemandirian')}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100 rounded-xl border border-blue-200 cursor-pointer transition-colors shadow-2xs"
                            title="Unduh Lembar Penilaian Kemandiriaan Pengayaan Pengetahuan"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>Unduh Di Sini</span>
                          </button>
                        </div>

                        {/* 2. Field File Penilaian */}
                        <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                              Field File Penilaian
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Kelola & Unggah Berkas
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-kuning-lapang-kemandirian"
                            onClick={() => setIsKemandirianUploadOpen((prev) => !prev)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl border shadow-xs transition-all cursor-pointer ${
                              isKemandirianUploadOpen
                                ? 'bg-amber-500 text-amber-950 border-amber-600 ring-2 ring-amber-400'
                                : 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 border-amber-500 hover:shadow-sm'
                            }`}
                            title="Tampilkan / Buka Kemandiriaan Pengayaan Pengetahuan (Browse, Submit, Preview)"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-950" />
                            <span>Kemandiriaan Pengayaan Pengetahuan</span>
                          </button>
                        </div>

                        {/* 3. Field Input Nilai */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                              Field Input Nilai
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Input Butir Evaluasi MK1
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-hijau-lapang-kemandirian"
                            onClick={() => {
                              setIsKemandirianInputOpen((prev) => !prev);
                            }}
                            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl border shadow-xs transition-all cursor-pointer ${
                              isKemandirianInputOpen
                                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-400'
                                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-700'
                            }`}
                            title="Buka / Tutup Formulir Input Nilai: Kemandiriaan Pengayaan Pengetahuan"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-white" />
                            <span>Kemandiriaan Pengayaan Pengetahuan</span>
                          </button>
                        </div>

                        {/* 4. Field Tampil Nilai */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
                              Field Tampil Nilai
                            </span>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">
                              Rekap Skor & Rubrik
                            </p>
                          </div>
                          <button
                            type="button"
                            id="btn-biru-lapang-kemandirian"
                            onClick={() => {
                              setActiveTabLapang('tampil');
                              setSubSectionLapangTampil('kemandirian');
                              const el = document.getElementById('field-tampil-nilai');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl border border-blue-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                            title="Buka Tampil Nilai: Kemandiriaan Pengayaan Pengetahuan"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>Kemandiriaan Pengayaan Pengetahuan</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Box: Kemandiriaan Pengayaan Pengetahuan dengan Browse, Submit, Preview */}
                      {isKemandirianUploadOpen && (
                        <div className="mt-3 p-4 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-3 animate-in fade-in duration-200 shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="font-extrabold text-slate-900 text-sm">
                                  Kemandiriaan Pengayaan Pengetahuan
                                </h6>
                                <p className="text-[11px] text-amber-900 font-medium">
                                  Kelola dan unggah berkas lembar penilaian Kemandirian Pengayaan Pengetahuan dari pembimbing lapangan
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{berkasFileLapangData.kemandirian.status}</span>
                            </span>
                          </div>

                          {/* Info File Saat Ini / Baru Terpilih */}
                          <div className="p-3 bg-white rounded-lg border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                                {selectedKemandirianFile ? 'File Terpilih (Klik Submit untuk menyimpan):' : 'Berkas Terdaftar Saat Ini:'}
                              </span>
                              <span className="font-mono font-bold text-slate-900 block truncate text-xs sm:text-sm text-blue-900">
                                {selectedKemandirianFile ? selectedKemandirianFile.name : berkasFileLapangData.kemandirian.fileName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono shrink-0 sm:text-right">
                              <span>Ukuran: {selectedKemandirianFile ? `${(selectedKemandirianFile.size / 1024).toFixed(1)} KB` : berkasFileLapangData.kemandirian.fileSize}</span>
                              <span className="block text-[10px] text-slate-400">
                                Tanggal: {berkasFileLapangData.kemandirian.uploadDate}
                              </span>
                            </div>
                          </div>

                          {/* Hidden Input File untuk Browse */}
                          <input
                            type="file"
                            ref={kemandirianFileInputRef}
                            className="hidden"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleKemandirianFileBrowse}
                          />

                          {/* Action Buttons: Browse, Submit, Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            {/* 1. BROWSE */}
                            <button
                              type="button"
                              id="btn-lapang-kemandirian-browse"
                              onClick={() => kemandirianFileInputRef.current?.click()}
                              className="py-2 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Pilih berkas Kemandiriaan Pengayaan Pengetahuan (Browse)"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                              <span>Browse</span>
                            </button>

                            {/* 2. SUBMIT */}
                            <button
                              type="button"
                              id="btn-lapang-kemandirian-submit"
                              onClick={handleKemandirianFileSubmit}
                              className="py-2 px-3 bg-[#002B49] hover:bg-[#003B66] active:bg-[#001D33] text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Unggah dan simpan berkas Kemandiriaan Pengayaan Pengetahuan (Submit)"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Submit</span>
                            </button>

                            {/* 3. PREVIEW */}
                            <button
                              type="button"
                              id="btn-lapang-kemandirian-preview"
                              onClick={() =>
                                setPreviewFileLapangModal({
                                  title: 'File Lembar Penilaian Kemandiriaan Pengayaan Pengetahuan',
                                  type: 'kemandirian'
                                })
                              }
                              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Pratinjau Berkas Kemandiriaan Pengayaan Pengetahuan (Preview)"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expandable Box: Input Nilai Kemandiriaan Pengayaan Pengetahuan (3 Butir) */}
                      {isKemandirianInputOpen && (
                        <div className="mt-3 p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl space-y-4 animate-in fade-in duration-200 shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                                <Edit3 className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="font-extrabold text-slate-900 text-sm">
                                  Input Nilai: Kemandiriaan Pengayaan Pengetahuan
                                </h6>
                                <p className="text-[11px] text-emerald-950 font-medium">
                                  Formulir penilaian 3 butir kompetensi praktik mandiri di laboratorium industri
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs font-mono">
                              Skor: {calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers)} / 100 ({getGradeHuruf(calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers))})
                            </span>
                          </div>

                          {/* Pedoman Pembobotan Jawaban */}
                          <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#002B49] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                                Pedoman Bobot Jawaban Kemandirian:
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                3 Butir Kompetensi Praktik Mandiri
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-0.5">
                              {OPSI_BOBOT_JAWABAN.map((opt) => (
                                <div
                                  key={opt.bobot}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center text-center"
                                >
                                  <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                                  <span className="text-[10px] font-semibold text-[#002B49] mt-0.5">
                                    Bobot {opt.bobot} <span className="text-slate-600 font-normal">(Skor {opt.skor})</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3 Butir Evaluasi Kemandirian */}
                          <div className="space-y-3 pt-1">
                            {DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) => {
                              const currentBobot = nilaiKemandirianLapangData.answers[q.id] ?? 4;
                              return (
                                <div
                                  key={q.id}
                                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs">
                                      {q.id}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
                                        {q.pertanyaan}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                      Skor: {currentBobot * 20}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                                    {OPSI_BOBOT_JAWABAN.map((opt) => {
                                      const isSelected = currentBobot === opt.bobot;
                                      return (
                                        <button
                                          type="button"
                                          key={opt.bobot}
                                          onClick={() => {
                                            setNilaiKemandirianLapangData((prev) => ({
                                              ...prev,
                                              answers: {
                                                ...prev.answers,
                                                [q.id]: opt.bobot
                                              }
                                            }));
                                          }}
                                          className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                            isSelected
                                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs scale-[1.02]'
                                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          <span>{opt.label}</span>
                                          <span
                                            className={`text-[10px] font-medium ${
                                              isSelected ? 'text-[#D4AF37]' : 'text-slate-500'
                                            }`}
                                          >
                                            Skor {opt.skor}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Catatan Kemandirian */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-xs font-bold text-slate-800">
                              Catatan Masukan Kemandirian & Kinerja Industri:
                            </label>
                            <textarea
                              rows={3}
                              value={nilaiKemandirianLapangData.catatan}
                              onChange={(e) =>
                                setNilaiKemandirianLapangData((prev) => ({
                                  ...prev,
                                  catatan: e.target.value
                                }))
                              }
                              placeholder="Tuliskan evaluasi inisiatif riset, kemampuan pemecahan masalah mandiri di laboratorium industri..."
                              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white shadow-2xs"
                            />
                          </div>

                          {/* Simpan & Skor Preview */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-emerald-200">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-700">Skor Terhitung:</span>
                              <span className="text-base font-extrabold font-mono text-[#002B49]">
                                {calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers)} / 100
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37] text-[#002B49]">
                                Nilai Huruf: {getGradeHuruf(calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers))}
                              </span>
                            </div>
                            <button
                              type="button"
                              id="btn-simpan-lapang-kemandirian-accordion"
                              onClick={() => handleSimpanNilaiLapang('kemandirian')}
                              className="w-full sm:w-auto px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Simpan Nilai Kemandirian Pembimbing Lapang</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* FIELD 2: TAMPIL NILAI                             */}
              {/* ================================================= */}
              {(activeTabLapang === 'semua' || activeTabLapang === 'tampil') && (
                <div id="field-tampil-nilai" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider block">
                        Field Penilaian 2
                      </span>
                      <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#002B49]" />
                        <span>Tampil Nilai</span>
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-tab-tampil-lapang-laporan"
                        onClick={() => setSubSectionLapangTampil('laporan')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          subSectionLapangTampil === 'laporan'
                            ? 'bg-[#002B49] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Laporan Akhir Program
                      </button>
                      <button
                        type="button"
                        id="btn-tab-tampil-lapang-kemandirian"
                        onClick={() => setSubSectionLapangTampil('kemandirian')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          subSectionLapangTampil === 'kemandirian'
                            ? 'bg-[#002B49] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Kemandirian Pengayaan Pengetahuan
                      </button>
                    </div>
                  </div>

                  {/* SUBSECTION TAMPIL: LAPORAN AKHIR PROGRAM */}
                  {subSectionLapangTampil === 'laporan' && (
                    <div className="space-y-4">
                      {/* Score Highlight Banner */}
                      {(() => {
                        const totalSkor = calculateTotalSkorLaporan(nilaiLaporanLapangData.answers);
                        const gradeHuruf = getGradeHuruf(totalSkor);
                        const predikat =
                          totalSkor >= 80 ? 'Sangat Baik' : totalSkor >= 70 ? 'Baik' : totalSkor >= 60 ? 'Cukup' : 'Kurang';

                        return (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 to-amber-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-[#002B49] text-white flex flex-col items-center justify-center font-bold shadow-md shrink-0">
                                <span className="text-xl leading-none text-[#D4AF37]">{gradeHuruf}</span>
                                <span className="text-[10px] text-slate-300 font-mono mt-0.5 font-normal">Huruf</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                  Hasil Rekap Nilai Laporan Akhir
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-black text-slate-900 font-mono">{totalSkor}</span>
                                  <span className="text-xs text-slate-500">/ 100 poin</span>
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">
                                    Predikat {predikat}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right sm:border-l sm:border-blue-200 sm:pl-4 space-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tervalidasi Pembimbing Lapangan</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Terakhir diupdate: {nilaiLaporanLapangData.updatedAt}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Criteria breakdown table - 13 Questions */}
                      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#002B49] text-white font-bold">
                            <tr>
                              <th className="px-3 py-2.5 w-10 text-center">No</th>
                              <th className="px-3 py-2.5">Pertanyaan & Aspek Evaluasi Laporan</th>
                              <th className="px-3 py-2.5 text-center w-28">Jawaban</th>
                              <th className="px-3 py-2.5 text-center w-16">Bobot</th>
                              <th className="px-3 py-2.5 text-right w-16">Skor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {DAFTAR_PERTANYAAN_LAPORAN.map((q) => {
                              const bobot = nilaiLaporanLapangData.answers[q.id] ?? 4;
                              const opt =
                                OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) ||
                                OPSI_BOBOT_JAWABAN[3];

                              return (
                                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-3 py-2.5 text-slate-500 text-center font-bold">
                                    {q.id}
                                  </td>
                                  <td className="px-3 py-2.5 font-medium text-slate-800 leading-relaxed">
                                    {q.pertanyaan}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#002B49] border border-blue-200">
                                      {opt.label}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-700">
                                    {opt.bobot}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono font-bold text-[#002B49]">
                                    {opt.skor}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200">
                            <tr>
                              <td colSpan={3} className="px-3 py-2.5 text-right">
                                Rata-rata Skor Akhir (13 Butir):
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono font-bold">
                                {(
                                  DAFTAR_PERTANYAAN_LAPORAN.reduce(
                                    (acc, q) => acc + (nilaiLaporanLapangData.answers[q.id] ?? 4),
                                    0
                                  ) / 13
                                ).toFixed(1)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-sm font-extrabold text-[#002B49]">
                                {calculateTotalSkorLaporan(nilaiLaporanLapangData.answers)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Evaluasi Notes */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 block mb-1">
                          Catatan Masukan Pembimbing Lapangan:
                        </span>
                        <p className="text-slate-700 italic">
                          "{nilaiLaporanLapangData.catatan}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          id="btn-unduh-rekap-lapang-laporan"
                          onClick={() => handleDownloadRekapNilaiLapang('laporan')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Unduh Rekap Nilai Laporan (.xlsx)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBSECTION TAMPIL: KEMANDIRIAN PENGAYAAN PENGETAHUAN */}
                  {subSectionLapangTampil === 'kemandirian' && (
                    <div className="space-y-4">
                      {/* Score Highlight Banner */}
                      {(() => {
                        const totalSkor = calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers);
                        const gradeHuruf = getGradeHuruf(totalSkor);
                        const predikat =
                          totalSkor >= 80 ? 'Sangat Baik' : totalSkor >= 70 ? 'Baik' : totalSkor >= 60 ? 'Cukup' : 'Kurang';

                        return (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/90 to-blue-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-white flex flex-col items-center justify-center font-bold shadow-md shrink-0">
                                <span className="text-xl leading-none text-[#D4AF37]">{gradeHuruf}</span>
                                <span className="text-[10px] text-emerald-200 font-mono mt-0.5 font-normal">Huruf</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                                  Hasil Rekap Nilai Kemandirian
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-black text-slate-900 font-mono">{totalSkor}</span>
                                  <span className="text-xs text-slate-500">/ 100 poin</span>
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">
                                    Predikat {predikat}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4 space-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tervalidasi Pembimbing Lapangan</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Terakhir diupdate: {nilaiKemandirianLapangData.updatedAt}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Criteria breakdown table - 3 Questions */}
                      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#002B49] text-white font-bold">
                            <tr>
                              <th className="px-3 py-2.5 w-10 text-center">No</th>
                              <th className="px-3 py-2.5">Kompetensi Kemandirian & Kinerja Industri</th>
                              <th className="px-3 py-2.5 text-center w-28">Jawaban</th>
                              <th className="px-3 py-2.5 text-center w-16">Bobot</th>
                              <th className="px-3 py-2.5 text-right w-16">Skor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) => {
                              const bobot = nilaiKemandirianLapangData.answers[q.id] ?? 4;
                              const opt =
                                OPSI_BOBOT_JAWABAN.find((o) => o.bobot === bobot) ||
                                OPSI_BOBOT_JAWABAN[3];

                              return (
                                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-3 py-2.5 text-slate-500 text-center font-bold">
                                    {q.id}
                                  </td>
                                  <td className="px-3 py-2.5 font-medium text-slate-800 leading-relaxed">
                                    {q.pertanyaan}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                      {opt.label}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-700">
                                    {opt.bobot}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono font-bold text-[#002B49]">
                                    {opt.skor}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200">
                            <tr>
                              <td colSpan={3} className="px-3 py-2.5 text-right">
                                Rata-rata Skor Akhir (3 Butir):
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono font-bold">
                                {(
                                  DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.reduce(
                                    (acc, q) => acc + (nilaiKemandirianLapangData.answers[q.id] ?? 4),
                                    0
                                  ) / 3
                                ).toFixed(1)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-sm font-extrabold text-[#002B49]">
                                {calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Evaluasi Notes */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 block mb-1">
                          Catatan Masukan Pembimbing Lapangan:
                        </span>
                        <p className="text-slate-700 italic">
                          "{nilaiKemandirianLapangData.catatan}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          id="btn-unduh-rekap-lapang-kemandirian"
                          onClick={() => handleDownloadRekapNilaiLapang('kemandirian')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Unduh Rekap Nilai Kemandirian (.xlsx)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                Departemen Kimia FSTeM &bull; Pembimbing Lapangan Mitra
              </div>
              <button
                type="button"
                id="btn-close-modal-nilai-lapang-footer"
                onClick={() => setModalNilaiPembimbingLapangOpen(false)}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL PRATINJAU TEMPLATE PENILAIAN LAPANGAN             */}
      {/* ======================================================= */}
      {previewTemplateLapangModal && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {previewTemplateLapangModal.title}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Pratinjau Format Baku Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplateLapangModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-800 bg-slate-50 leading-relaxed">
              <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-3">
                <div className="text-center border-b border-slate-300 pb-3 font-sans space-y-0.5">
                  <p className="font-extrabold text-sm text-[#002B49]">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</p>
                  <p className="font-bold text-xs text-slate-800">UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA</p>
                  <p className="font-bold text-xs text-[#D4AF37]">DEPARTEMEN KIMIA - PROGRAM STUDI S1 KIMIA</p>
                  <p className="text-[10px] text-slate-500 font-mono">FORMULIR PENILAIAN KEGIATAN LUAR KAMPUS (KLK)</p>
                </div>

                <div className="space-y-1 font-sans text-xs">
                  <p><span className="font-bold text-slate-700 inline-block w-36">Nama Mahasiswa:</span> {detailModalKlk?.nama || 'Ahmad Fauzi Rahman'}</p>
                  <p><span className="font-bold text-slate-700 inline-block w-36">NIM:</span> {detailModalKlk?.nim || '215090200111001'}</p>
                  <p><span className="font-bold text-slate-700 inline-block w-36">Instansi Mitra:</span> {detailModalKlk?.instansi || 'Pusat Penelitian Bioteknologi & Kimia Terapan'}</p>
                  <p><span className="font-bold text-slate-700 inline-block w-36">Pembimbing Lapangan:</span> {detailModalKlk?.mentorIndustri || 'Dr. Hendra Gunawan, M.Si.'}</p>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden font-sans">
                  <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-300">
                    {previewTemplateLapangModal.type === 'laporan'
                      ? 'Daftar 13 Butir Evaluasi Capaian Kinerja & Laporan Akhir'
                      : 'Daftar 3 Butir Evaluasi Kemandirian Pengayaan Pengetahuan'}
                  </div>
                  <div className="p-3 text-slate-600 text-[11px] space-y-1.5">
                    {previewTemplateLapangModal.type === 'laporan' ? (
                      DAFTAR_PERTANYAAN_LAPORAN.map((q) => (
                        <div key={q.id} className="flex gap-2">
                          <span className="font-bold font-mono">{q.id}.</span>
                          <span>{q.pertanyaan} <span className="text-slate-400 font-mono">[Skala 1 - 5]</span></span>
                        </div>
                      ))
                    ) : (
                      DAFTAR_PERTANYAAN_KEMANDIRIAN_MK1.map((q) => (
                        <div key={q.id} className="flex gap-2">
                          <span className="font-bold font-mono">{q.id}.</span>
                          <span>{q.pertanyaan} <span className="text-slate-400 font-mono">[Skala 1 - 5]</span></span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 font-sans text-xs">
                  <div>
                    <p className="text-slate-500 text-[10px]">Dicetak resmi untuk evaluasi semester genap</p>
                  </div>
                  <div className="text-center space-y-8">
                    <p>Pembimbing Lapangan Mitra,</p>
                    <p className="font-bold underline">{detailModalKlk?.mentorIndustri || 'Dr. Hendra Gunawan, M.Si.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleDownloadLembarPenilaianLapang(previewTemplateLapangModal.type);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl border border-amber-500 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format Template Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplateLapangModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL PRATINJAU FILE PENILAIAN LAPANGAN                 */}
      {/* ======================================================= */}
      {previewFileLapangModal && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {previewFileLapangModal.title}
                  </h3>
                  <p className="text-xs text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Berkas Penilaian Resmi Mitra - Terverifikasi Digital</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFileLapangModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans bg-slate-100">
              <div className="p-5 bg-white rounded-xl border border-slate-300 shadow-sm space-y-4 relative">
                {/* Stempel Cap Digital */}
                <div className="absolute right-6 top-6 border-2 border-emerald-600 text-emerald-700 px-3 py-1.5 rounded-lg text-center font-bold uppercase tracking-wider text-[10px] rotate-[-6deg] bg-emerald-50/80 shadow-2xs">
                  <p>TERVERIFIKASI RESMI</p>
                  <p className="font-mono text-[9px]">{berkasFileLapangData[previewFileLapangModal.type].uploadDate}</p>
                </div>

                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Berkas Unggahan Mahasiswa & Mitra</span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                    {berkasFileLapangData[previewFileLapangModal.type].fileName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Ukuran: {berkasFileLapangData[previewFileLapangModal.type].fileSize} &bull; Status: {berkasFileLapangData[previewFileLapangModal.type].status}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Mahasiswa:</span>
                      <span className="font-bold text-slate-800">{detailModalKlk?.nama || 'Ahmad Fauzi Rahman'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">NIM:</span>
                      <span className="font-mono font-bold text-slate-800">{detailModalKlk?.nim || '215090200111001'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Instansi Magang/KLK:</span>
                      <span className="font-semibold text-slate-800">{detailModalKlk?.instansi || 'Pusat Riset Industri Bioteknologi'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Penilai Lapangan:</span>
                      <span className="font-bold text-[#002B49]">{detailModalKlk?.mentorIndustri || 'Dr. Hendra Gunawan, M.Si.'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Ringkasan Skor Penilaian:</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-900">
                      {previewFileLapangModal.type === 'laporan'
                        ? `${calculateTotalSkorLaporan(nilaiLaporanLapangData.answers)} / 100 (${getGradeHuruf(calculateTotalSkorLaporan(nilaiLaporanLapangData.answers))})`
                        : `${calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers)} / 100 (${getGradeHuruf(calculateTotalSkorKemandirian(nilaiKemandirianLapangData.answers))})`
                      }
                    </span>
                  </div>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Dokumen ini telah ditandatangani basah dan diverifikasi dengan cap resmi lembaga mitra. Semua butir evaluasi telah diinput dan disinkronkan ke dalam sistem SIAKAD KLK Departemen Kimia FSTeM Universitas Brawijaya.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleDownloadFilePenilaianLapang(previewFileLapangModal.type);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewFileLapangModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {modalDetailPenilai && detailModalKlk && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal Detail Penilai */}
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D4AF37] flex items-center justify-center border border-white/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Detail Penilai KLK
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#002B49]">
                      {modalDetailPenilai.type === 'dosen' ? 'Dosen Pembimbing' : 'Pembimbing Lapangan'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-detail-penilai-modal"
                onClick={() => setModalDetailPenilai(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Detail Penilai */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
              {/* Profile Card Penilai */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0 ${
                  modalDetailPenilai.type === 'dosen' ? 'bg-[#002B49]' : 'bg-emerald-700'
                }`}>
                  {modalDetailPenilai.type === 'dosen' ? 'DP' : 'PL'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                    {modalDetailPenilai.peran}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                    {modalDetailPenilai.nama}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {modalDetailPenilai.instansi}
                  </p>
                  {modalDetailPenilai.kontak && (
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Kontak / Email: {modalDetailPenilai.kontak}
                    </p>
                  )}
                </div>
              </div>

              {/* Info Mahasiswa yang Dinilai */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-xs">
                <span className="font-bold text-[#002B49] block mb-1">
                  Mahasiswa Bimbingan / Peserta KLK:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nama Mahasiswa</span>
                    <span className="font-bold text-slate-900">{detailModalKlk.namaMahasiswa}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">NIM</span>
                    <span className="font-mono font-bold text-slate-900">{detailModalKlk.nim}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Judul / Tempat KLK</span>
                    <span className="font-medium text-slate-800">{detailModalKlk.namaMitra} ({detailModalKlk.kotaMitra})</span>
                  </div>
                </div>
              </div>

              {/* Bobot & Status Penilaian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-medium">Bobot Kontribusi Nilai</span>
                  <span className="font-bold text-slate-900 text-xs mt-1 block text-emerald-700">
                    {modalDetailPenilai.bobot}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-medium">Status Penilaian</span>
                  <span className="font-bold text-slate-900 text-xs mt-1 inline-flex items-center gap-1 text-[#002B49]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{modalDetailPenilai.status}</span>
                  </span>
                </div>
              </div>

              {/* Komponen Penilaian */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>Komponen & Rubrik Penilaian KLK</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {modalDetailPenilai.komponen.map((komp, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{komp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Modal Detail */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              {modalDetailPenilai.type === 'lapangan' ? (
                <button
                  type="button"
                  onClick={() => {
                    setModalDetailPenilai(null);
                    handleGenerateLinkPembimbing();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Link2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Generate Link Penilaian</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Dosen Penilai resmi Departemen Kimia FSTeM UB
                </span>
              )}

              <button
                type="button"
                id="btn-close-detail-penilai-footer"
                onClick={() => setModalDetailPenilai(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL GENERATE LINK PENILAIAN PEMBIMBING LAPANGAN */}
      {/* ======================================================= */}
      {modalGenerateLinkOpen && detailModalKlk && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal Generate Link */}
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Link Penilaian Pembimbing Lapangan
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950">
                      Generated
                    </span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Formulir Evaluasi Mandiri untuk Mentor Mitra Industri
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-generate-link-modal"
                onClick={() => setModalGenerateLinkOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Generate Link */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
              {/* Alert Feedback Copied */}
              {linkCopiedAlert && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Tautan penilaian berhasil disalin ke clipboard! Siap dikirimkan ke pembimbing lapangan.</span>
                </div>
              )}

              {/* Penerima Link */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Penerima Tautan Evaluasi
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {detailModalKlk.mentorIndustri || 'Pembimbing Lapangan'}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {detailModalKlk.namaMitra} &bull; {detailModalKlk.kontakMentor || 'Kontak Belum Ada'}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200">
                    Mitra Industri
                  </span>
                </div>
              </div>

              {/* Box URL Input & Copy */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <label className="font-bold text-xs text-slate-900 block">
                  Tautan Form Penilaian Online (Akses Khusus)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={linkPembimbingLapangan}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    id="btn-copy-eval-link"
                    onClick={handleCopyLinkPembimbing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Salin Tautan"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Salin</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tautan dilengkapi token unik terenkripsi dan dapat dibuka oleh pembimbing lapangan tanpa memerlukan login SSO UB.
                </p>
              </div>

              {/* Detail Akses & Keamanan */}
              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Masa Berlaku Tautan:</span>
                  <span className="font-bold text-emerald-700">30 Hari Kedepan</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Autentikasi:</span>
                  <span className="font-bold text-slate-800">Token-Based (Otomatis)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Mahasiswa Dinilai:</span>
                  <span className="font-bold text-[#002B49]">{detailModalKlk.namaMahasiswa} ({detailModalKlk.nim})</span>
                </div>
              </div>

              {/* Kirim via WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Yth. Bapak/Ibu ${detailModalKlk.mentorIndustri || 'Pembimbing Lapangan'} (${detailModalKlk.namaMitra}),\n\nBerikut tautan evaluasi nilai KLK mahasiswa Departemen Kimia FSTeM Universitas Brawijaya atas nama ${detailModalKlk.namaMahasiswa} (${detailModalKlk.nim}):\n${linkPembimbingLapangan}\n\nTerima kasih atas bimbingan dan kerjasamanya.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Bagikan Langsung via WhatsApp</span>
              </a>
            </div>

            {/* Footer Modal Generate Link */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Departemen Kimia FSTeM UB &bull; Sistem Informasi KLK
              </span>

              <button
                type="button"
                id="btn-close-link-modal-footer"
                onClick={() => setModalGenerateLinkOpen(false)}
                className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALUR PROSEDUR PELAKSANAAN KLK (22 LANGKAH) */}
      {modalAlurKlkOpen && (
        <div
          id="modal-alur-klk"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAlurKlkOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#002B49] shadow-sm font-bold">
                  <GitMerge className="w-6 h-6 text-[#002B49]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                      Alur Prosedur Pelaksanaan KLK
                    </h3>
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-white/10 text-amber-300 rounded border border-white/20 font-bold">
                      22 Langkah
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Departemen Kimia Fakultas MIPA Universitas Brawijaya &bull; SIKMA Kimia UB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-download-alur-txt"
                  onClick={handleDownloadAlurKlk}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors cursor-pointer"
                  title="Unduh File Teks Alur KLK"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Unduh</span>
                </button>
                <button
                  type="button"
                  id="btn-close-alur-modal"
                  onClick={() => setModalAlurKlkOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  Filter Aktor:
                </span>
                {(['Semua', 'Mahasiswa', 'Admin', 'Dosen'] as const).map((aktor) => {
                  const count =
                    aktor === 'Semua'
                      ? DAFTAR_ALUR_KLK.length
                      : DAFTAR_ALUR_KLK.filter((item) => item.pelaksana === aktor).length;
                  return (
                    <button
                      key={aktor}
                      type="button"
                      onClick={() => setFilterAktorAlur(aktor)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterAktorAlur === aktor
                          ? 'bg-[#002B49] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {aktor} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari tahapan alur..."
                  value={searchQueryAlur}
                  onChange={(e) => setSearchQueryAlur(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>
            </div>

            {/* Body Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {/* Ringkasan 4 Tahapan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-blue-800 block uppercase">Tahap 1</span>
                  <div className="font-extrabold text-slate-900 text-xs mt-0.5">Sosialisasi & Pendaftaran</div>
                  <span className="text-[11px] text-slate-500">Langkah 1 &ndash; 5</span>
                </div>
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-amber-800 block uppercase">Tahap 2</span>
                  <div className="font-extrabold text-slate-900 text-xs mt-0.5">Verifikasi & Surat Pengantar</div>
                  <span className="text-[11px] text-slate-500">Langkah 6 &ndash; 10</span>
                </div>
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-indigo-800 block uppercase">Tahap 3</span>
                  <div className="font-extrabold text-slate-900 text-xs mt-0.5">Pelaksanaan & Bimbingan</div>
                  <span className="text-[11px] text-slate-500">Langkah 11 &ndash; 15</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-emerald-800 block uppercase">Tahap 4</span>
                  <div className="font-extrabold text-slate-900 text-xs mt-0.5">Ujian & Administrasi Akhir</div>
                  <span className="text-[11px] text-slate-500">Langkah 16 &ndash; 22</span>
                </div>
              </div>

              {/* List of 22 Steps */}
              <div className="space-y-2.5">
                {filteredAlurKlk.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500">Tidak ada langkah alur yang sesuai dengan pencarian / filter.</p>
                  </div>
                ) : (
                  filteredAlurKlk.map((item) => (
                    <div
                      key={item.no}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3.5 group"
                    >
                      {/* Step Number Circle */}
                      <div className="w-8 h-8 rounded-xl bg-[#002B49] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs group-hover:bg-[#D4AF37] group-hover:text-[#002B49] transition-colors">
                        {item.no}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {/* Aktor Pill */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                              item.pelaksana === 'Mahasiswa'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : item.pelaksana === 'Admin'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {item.pelaksana}
                          </span>

                          <span className="text-[10px] font-medium text-slate-400">
                            &bull; {item.tahap}
                          </span>
                        </div>

                        {/* Exact description text */}
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                          {item.deskripsi}
                        </p>

                        {/* Optional explanation */}
                        {item.keterangan && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            {item.keterangan}
                          </p>
                        )}
                      </div>

                      {/* Status indicator check */}
                      <div className="shrink-0 pt-0.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors text-[10px] font-bold">
                          ✓
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Menampilkan {filteredAlurKlk.length} dari 22 Langkah Prosedur KLK
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAlurKlk}
                  className="sm:hidden inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs rounded-xl border border-slate-300 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Unduh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalAlurKlkOpen(false)}
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL REKAP NILAI MAHASISWA KLK & MATA KULIAH KONVERSI                   */}
      {/* ========================================================================= */}
      {modalRekapNilaiOpen && (
        <div
          id="modal-rekap-nilai-klk"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-bold shadow-sm shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">
                      Rekap Nilai Mahasiswa KLK
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      SIKMA KLK
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                    Departemen Kimia FSTeM Universitas Brawijaya &bull; Rekapitulasi Nilai & Konversi SKS
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-unduh-rekap-tabel"
                  onClick={handleDownloadRekapNilaiTable}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg border border-emerald-400/60 transition-colors shadow-xs cursor-pointer"
                  title="Unduh Rekapitulasi Nilai Format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Unduh Rekap (.xlsx)</span>
                </button>
                <button
                  type="button"
                  id="btn-close-modal-rekap"
                  onClick={() => setModalRekapNilaiOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Tutup Modal Rekap Nilai"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Toolbar: 1. Jenis & 2. Semester */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* 1. JENIS (Select) */}
                <div className="sm:col-span-5">
                  <label
                    htmlFor="select-rekap-jenis"
                    className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-extrabold">
                      1
                    </span>
                    <span>Jenis Mata Kuliah / Penilaian:</span>
                  </label>
                  <div className="relative">
                    <select
                      id="select-rekap-jenis"
                      value={rekapFilterJenis}
                      onChange={(e) => setRekapFilterJenis(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49] shadow-2xs appearance-none pr-8 cursor-pointer"
                    >
                      {OPSI_JENIS_REKAP.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. SEMESTER (Select) */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="select-rekap-semester"
                    className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-extrabold">
                      2
                    </span>
                    <span>Semester:</span>
                  </label>
                  <div className="relative">
                    <select
                      id="select-rekap-semester"
                      value={rekapFilterSemester}
                      onChange={(e) => setRekapFilterSemester(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49] shadow-2xs appearance-none pr-8 cursor-pointer"
                    >
                      <option value="Semua">Semua Semester</option>
                      {semesterOptions.map((s) => (
                        <option key={s.id} value={s.namaSemester}>
                          {s.namaSemester} {s.status === 'Aktif' ? '• (Aktif)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* PENCARIAN MAHASISWA */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="input-rekap-search"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Pencarian Mahasiswa:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="input-rekap-search"
                      value={rekapSearchMhs}
                      onChange={(e) => setRekapSearchMhs(e.target.value)}
                      placeholder="NIM, Nama, Mitra..."
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49] shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">Jenis Terpilih</span>
                  <span className="font-bold text-slate-800 text-xs truncate block" title={rekapFilterJenis}>
                    {rekapFilterJenis}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">Semester</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">
                    {rekapFilterSemester === 'Semua' ? 'Semua Semester' : rekapFilterSemester}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">Total Mahasiswa</span>
                  <span className="font-extrabold text-[#002B49] text-sm">
                    {filteredRekapList.length} Orang
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">Standar Kelulusan</span>
                  <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Min. Nilai B (&ge; 70)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {filteredRekapList.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada data rekapitulasi nilai</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sesuaikan pilihan Jenis, Semester, atau kata kunci pencarian Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRekapFilterJenis('KLK');
                      setRekapFilterSemester('Semua');
                      setRekapSearchMhs('');
                    }}
                    className="mt-3 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : rekapFilterJenis === 'Semua (KLK dan MK Konversi)' ? (
                /* TABEL LENGKAP SEMUA MATA KULIAH KONVERSI */
                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#002B49] text-white">
                        <th className="py-2.5 px-3 font-bold text-center w-10">No</th>
                        <th className="py-2.5 px-3 font-bold min-w-[160px]">Mahasiswa</th>
                        <th className="py-2.5 px-2.5 font-bold min-w-[110px]">Semester</th>
                        <th className="py-2.5 px-2.5 font-bold min-w-[130px]">Mitra Instansi</th>
                        <th className="py-2.5 px-2 text-center font-bold bg-blue-900/40" title="Kuliah Lapangan Kimia">
                          KLK
                        </th>
                        <th className="py-2.5 px-2 text-center font-bold" title="Sumber Daya Alam">
                          SDA
                        </th>
                        <th className="py-2.5 px-2 text-center font-bold" title="Keselamatan dan Lingkungan">
                          K3L
                        </th>
                        <th className="py-2.5 px-2 text-center font-bold" title="Metode dan Terapan">
                          Metod
                        </th>
                        <th className="py-2.5 px-2 text-center font-bold" title="Analisis Penilaian Tindakan">
                          APT
                        </th>
                        <th className="py-2.5 px-2 text-center font-bold" title="Kemandirian Pengayaan Pengetahuan">
                          Kemandirian
                        </th>
                        <th className="py-2.5 px-2.5 text-center font-bold bg-amber-500/20 text-[#D4AF37]">
                          Rata-rata
                        </th>
                        <th className="py-2.5 px-2 text-center font-bold">Huruf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredRekapList.map((item, idx) => {
                        const pkl = calculateScoreForMk(item, 'KLK');
                        const sda = calculateScoreForMk(item, 'Sumber Daya Alam');
                        const k3l = calculateScoreForMk(item, 'Keselamatan dan Lingkungan');
                        const met = calculateScoreForMk(item, 'Metode dan Terapan');
                        const apt = calculateScoreForMk(item, 'Analisis Penilaian Tindakan');
                        const kpp = calculateScoreForMk(item, 'Kemandirian Pengayaan Pengetahuan');
                        const avg = Math.round(
                          (pkl.angka + sda.angka + k3l.angka + met.angka + apt.angka + kpp.angka) / 6
                        );
                        const finalHuruf =
                          item.nilaiAkhirHuruf || (avg >= 80 ? 'A' : avg >= 75 ? 'B+' : 'B');

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{item.mahasiswaNama}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{item.nim}</div>
                            </td>
                            <td className="py-2.5 px-2.5 text-slate-700 font-medium">
                              {item.namaSemester || 'Genap 2025/2026'}
                            </td>
                            <td className="py-2.5 px-2.5 text-slate-700">
                              <div className="font-semibold text-slate-800 line-clamp-1" title={item.namaMitra}>
                                {item.namaMitra}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {item.dosenPembimbingKLK || 'Dosen Pembimbing'}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/50">
                              {pkl.angka} <span className="text-[10px] text-slate-500 font-normal">({pkl.huruf})</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                              {sda.angka} <span className="text-[10px] text-slate-500 font-normal">({sda.huruf})</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                              {k3l.angka} <span className="text-[10px] text-slate-500 font-normal">({k3l.huruf})</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                              {met.angka} <span className="text-[10px] text-slate-500 font-normal">({met.huruf})</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                              {apt.angka} <span className="text-[10px] text-slate-500 font-normal">({apt.huruf})</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                              {kpp.angka} <span className="text-[10px] text-slate-500 font-normal">({kpp.huruf})</span>
                            </td>
                            <td className="py-2.5 px-2.5 text-center font-mono font-extrabold text-[#002B49] bg-amber-50">
                              {avg}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                                  finalHuruf === 'A'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : finalHuruf === 'B+'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {finalHuruf}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* TABEL PER MATA KULIAH TERTENTU */
                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#002B49] text-white">
                        <th className="py-2.5 px-3 font-bold text-center w-10">No</th>
                        <th className="py-2.5 px-3 font-bold min-w-[170px]">Mahasiswa & NIM</th>
                        <th className="py-2.5 px-3 font-bold min-w-[110px]">Semester</th>
                        <th className="py-2.5 px-3 font-bold min-w-[140px]">Mitra Instansi</th>
                        <th className="py-2.5 px-3 font-bold min-w-[140px]">Dosen Pembimbing KLK</th>
                        <th className="py-2.5 px-2.5 font-bold text-center">SKS</th>
                        <th className="py-2.5 px-3 text-center font-bold bg-blue-900/50">
                          Nilai Angka ({rekapFilterJenis})
                        </th>
                        <th className="py-2.5 px-3 text-center font-bold">Nilai Huruf</th>
                        <th className="py-2.5 px-3 font-bold">Keterangan</th>
                        <th className="py-2.5 px-3 text-center font-bold">Status KLK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredRekapList.map((item, idx) => {
                        const score = calculateScoreForMk(item, rekapFilterJenis);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 text-center text-slate-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{item.mahasiswaNama}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{item.nim}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-medium">
                              {item.namaSemester || 'Genap 2025/2026'}
                            </td>
                            <td className="py-3 px-3 text-slate-800 font-semibold">
                              <div className="line-clamp-1" title={item.namaMitra}>
                                {item.namaMitra}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {item.bidangPekerjaan || 'Praktik Industri'}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-700">
                              {item.dosenPembimbingKLK || '-'}
                            </td>
                            <td className="py-3 px-2.5 text-center font-bold text-slate-700">
                              {item.sksDiakui}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-extrabold text-sm text-[#002B49] bg-blue-50/50">
                              {score.angka}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-md font-extrabold text-xs shadow-2xs ${
                                  score.huruf === 'A'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : score.huruf === 'B+'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {score.huruf}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 text-[11px]">
                              {score.huruf === 'A'
                                ? 'Lulus Sangat Baik'
                                : score.huruf === 'B+'
                                ? 'Lulus Baik Sekali'
                                : 'Lulus Baik'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === 'Selesai & Dinilai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="text-[11px] text-slate-600">
                Menampilkan <strong>{filteredRekapList.length}</strong> mahasiswa terdata &bull; Filter:{' '}
                <span className="font-semibold text-slate-900">{rekapFilterJenis}</span> &bull; Semester:{' '}
                <span className="font-semibold text-slate-900">
                  {rekapFilterSemester === 'Semua' ? 'Semua Semester' : rekapFilterSemester}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  id="btn-unduh-rekap-tabel-footer"
                  onClick={handleDownloadRekapNilaiTable}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                  title="Unduh Rekapitulasi Nilai Format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Rekap (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalRekapNilaiOpen(false)}
                  className="px-5 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGELOLAAN QR & BUKA BLOKIR (SUPER ADMIN & ADMIN) */}
      <QrManagerModal
        isOpen={isQrManagerModalOpen}
        onClose={() => setIsQrManagerModalOpen(false)}
        qrList={qrSosialisasiList}
        onSaveQrList={handleSaveQrList}
        unblockedNims={unblockedNims}
        onSaveUnblockedNims={handleSaveUnblockedNims}
        adminName={effectiveUser?.nama || 'Administrator Kimia UB'}
        onOpenProjector={(qr) => setProjectorQrItem(qr)}
        mahasiswaList={mahasiswaList}
      />

      {/* MODAL PROYEKTOR LAYAR PENUH UNTUK SESI SOSIALISASI */}
      <QrProjectorModal
        qr={projectorQrItem}
        onClose={() => setProjectorQrItem(null)}
      />
    </div>
  );
};
