import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, AuthUser, KegiatanAgenda, RuanganAgenda, StatusKegiatanAgenda } from '../types/sikma';
import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  X,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Building,
  Info,
  CalendarCheck,
  HelpCircle,
  UserCheck,
  Tag,
  Pencil,
  Search,
  Lock
} from 'lucide-react';

interface AgendaViewProps {
  currentRole: UserRole;
  currentUser?: AuthUser | null;
}

// Map Warna & Styling Status Kegiatan
export const STATUS_KEGIATAN_COLOR_MAP: Record<
  StatusKegiatanAgenda,
  { badge: string; dot: string; text: string }
> = {
  'Menunggu Persetujuan': {
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    text: 'text-amber-700'
  },
  'Disetujui': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700'
  },
  'Selesai': {
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
    text: 'text-blue-700'
  },
  'Ditolak': {
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
    text: 'text-rose-700'
  }
};

// 8 Ruangan sesuai spesifikasi permintaan user
export const DAFTAR_RUANGAN_AGENDA: RuanganAgenda[] = [
  'Ruang Proyek',
  'Ruang Sidang 1',
  'Ruang Sidang 2',
  'Ruang Komputer',
  'Ruang Pertemuan',
  'Ruang KPS Pasca Sarjana',
  'Ruang Dosen KA',
  'Ruang Dosen Biokimia'
];

// Opsi Ruangan untuk Form (menyertakan variasi penulisan PascaSarjana)
export const OPSI_RUANGAN_FORM = [
  'Ruang Proyek',
  'Ruang Sidang 1',
  'Ruang Sidang 2',
  'Ruang Komputer',
  'Ruang Pertemuan',
  'Ruang KPS PascaSarjana',
  'Ruang Dosen KA',
  'Ruang Dosen Biokimia'
] as const;

// Warna khas per Ruangan
export const RUANGAN_COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string; lightBg: string }> = {
  'Ruang Proyek': {
    bg: 'bg-blue-600 text-white',
    text: 'text-blue-700',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    lightBg: 'bg-blue-50/70'
  },
  'Ruang Sidang 1': {
    bg: 'bg-purple-600 text-white',
    text: 'text-purple-700',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    lightBg: 'bg-purple-50/70'
  },
  'Ruang Sidang 2': {
    bg: 'bg-indigo-600 text-white',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    lightBg: 'bg-indigo-50/70'
  },
  'Ruang Komputer': {
    bg: 'bg-cyan-600 text-white',
    text: 'text-cyan-700',
    border: 'border-cyan-300',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    lightBg: 'bg-cyan-50/70'
  },
  'Ruang Pertemuan': {
    bg: 'bg-emerald-600 text-white',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lightBg: 'bg-emerald-50/70'
  },
  'Ruang KPS Pasca Sarjana': {
    bg: 'bg-amber-600 text-white',
    text: 'text-amber-700',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    lightBg: 'bg-amber-50/70'
  },
  'Ruang KPS PascaSarjana': {
    bg: 'bg-amber-600 text-white',
    text: 'text-amber-700',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    lightBg: 'bg-amber-50/70'
  },
  'Ruang Dosen KA': {
    bg: 'bg-rose-600 text-white',
    text: 'text-rose-700',
    border: 'border-rose-300',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    lightBg: 'bg-rose-50/70'
  },
  'Ruang Dosen Biokimia': {
    bg: 'bg-teal-600 text-white',
    text: 'text-teal-700',
    border: 'border-teal-300',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    lightBg: 'bg-teal-50/70'
  }
};

// Generate Time Slots dari 06.00 sampai 21.00 dengan step 15 menit
export const GENERATE_TIME_SLOTS = (): string[] => {
  const slots: string[] = [];
  for (let h = 6; h <= 21; h++) {
    const hStr = h < 10 ? `0${h}` : `${h}`;
    for (let m = 0; m < 60; m += 15) {
      if (h === 21 && m > 0) break;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      slots.push(`${hStr}.${mStr}`);
    }
  }
  return slots;
};

export const TIME_SLOTS_LIST = GENERATE_TIME_SLOTS();

// Helper untuk konversi format jam "HH.mm" atau "HH:mm" ke menit
const timeToMinutes = (timeStr: string): number => {
  const normalized = timeStr.replace(':', '.');
  const parts = normalized.split('.');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

// Initial Sample Activities
const INITIAL_KEGIATAN_LIST: KegiatanAgenda[] = [
  {
    id: 'keg-1',
    namaKegiatan: 'Ujian Sidang Skripsi - Dewi Ayu Anggraeni',
    ruangan: 'Ruang Sidang 1',
    tanggal: '2026-10-05',
    jamMulai: '08.00',
    jamSelesai: '10.30',
    jumlahPeserta: 15,
    penanggungJawab: 'Prof. Dr. Hermin Sulistyarti',
    status: 'Disetujui',
    penyelenggara: 'Komisi Skripsi Departemen Kimia',
    keterangan: 'Penguji: Prof. Dr. Hermin Sulistyarti, Dr. Masruri'
  },
  {
    id: 'keg-2',
    namaKegiatan: 'Praktikum Komputasi Molekuler Kimia',
    ruangan: 'Ruang Komputer',
    tanggal: '2026-10-05',
    jamMulai: '13.00',
    jamSelesai: '15.30',
    jumlahPeserta: 35,
    penanggungJawab: 'Dr. Masruri',
    status: 'Disetujui',
    penyelenggara: 'Lab Kimia Fisik & Komputasi',
    keterangan: 'Software Gaussian & ChemDraw 3D'
  },
  {
    id: 'keg-3',
    namaKegiatan: 'Koordinasi Riset Katalisis Nanomaterial',
    ruangan: 'Ruang Proyek',
    tanggal: '2026-10-05',
    jamMulai: '09.00',
    jamSelesai: '11.45',
    jumlahPeserta: 8,
    penanggungJawab: 'Dr. rer. nat. Rachmat Triandi Tjahjanto',
    status: 'Disetujui',
    penyelenggara: 'Grup Riset Material Maju',
    keterangan: 'Evaluasi data karakterisasi XRD dan FTIR'
  },
  {
    id: 'keg-4',
    namaKegiatan: 'Rapat Koordinasi Kompartemen Kimia Analitik',
    ruangan: 'Ruang Dosen KA',
    tanggal: '2026-10-05',
    jamMulai: '10.00',
    jamSelesai: '12.00',
    jumlahPeserta: 10,
    penanggungJawab: 'Ketua Kompartemen Kimia Analitik',
    status: 'Disetujui',
    penyelenggara: 'Kompartemen Kimia Analitik',
    keterangan: 'Persiapan akreditasi internasional ASIIN'
  },
  {
    id: 'keg-5',
    namaKegiatan: 'Sosialisasi MBKM & Magang Industri FSTeM',
    ruangan: 'Ruang Pertemuan',
    tanggal: '2026-10-05',
    jamMulai: '13.30',
    jamSelesai: '16.00',
    jumlahPeserta: 40,
    penanggungJawab: 'Pengelola KLK & MBKM Kimia',
    status: 'Menunggu Persetujuan',
    penyelenggara: 'Pengelola KLK & MBKM Kimia',
    keterangan: 'Presentasi mitra PT Petrokimia Gresik'
  },
  {
    id: 'keg-6',
    namaKegiatan: 'Bimbingan Tesis Magister Kimia',
    ruangan: 'Ruang KPS Pasca Sarjana',
    tanggal: '2026-10-05',
    jamMulai: '09.30',
    jamSelesai: '11.30',
    jumlahPeserta: 6,
    penanggungJawab: 'KPS Magister Kimia',
    status: 'Disetujui',
    penyelenggara: 'Program Studi Magister Kimia',
    keterangan: 'Review manuskrip publikasi terindeks Scopus'
  },
  {
    id: 'keg-7',
    namaKegiatan: 'Seminar Proposal Skripsi - Fajar Nur Hidayat',
    ruangan: 'Ruang Sidang 2',
    tanggal: '2026-10-06',
    jamMulai: '09.00',
    jamSelesai: '11.30',
    jumlahPeserta: 12,
    penanggungJawab: 'Prof. Dr. Sc. Acep Purqon',
    status: 'Menunggu Persetujuan',
    penyelenggara: 'Komisi Tugas Akhir Kimia',
    keterangan: 'Pembimbing: Prof. Dr. Sc. Acep Purqon'
  },
  {
    id: 'keg-8',
    namaKegiatan: 'Rapat Kurikulum Laboratorium Biokimia',
    ruangan: 'Ruang Dosen Biokimia',
    tanggal: '2026-10-06',
    jamMulai: '13.00',
    jamSelesai: '15.00',
    jumlahPeserta: 8,
    penanggungJawab: 'Kepala Lab Biokimia',
    status: 'Disetujui',
    penyelenggara: 'Kompartemen Biokimia',
    keterangan: 'Revisi modul praktikum enzymologi medik'
  },
  {
    id: 'keg-9',
    namaKegiatan: 'Ujian Komprehensif S1 Kimia Periode Ganjil',
    ruangan: 'Ruang Sidang 1',
    tanggal: '2026-10-07',
    jamMulai: '13.00',
    jamSelesai: '15.30',
    jumlahPeserta: 20,
    penanggungJawab: 'Sekretaris Departemen Kimia',
    status: 'Disetujui',
    penyelenggara: 'Departemen Kimia UB',
    keterangan: 'Peserta mahasiswa angkatan 2021'
  },
  {
    id: 'keg-10',
    namaKegiatan: 'Workshop ChemDraw & Gaussian untuk Mahasiswa',
    ruangan: 'Ruang Komputer',
    tanggal: '2026-10-08',
    jamMulai: '08.30',
    jamSelesai: '11.30',
    jumlahPeserta: 30,
    penanggungJawab: 'Ketua HIMAKI UB',
    status: 'Menunggu Persetujuan',
    penyelenggara: 'Himpunan Mahasiswa Kimia (HIMAKI)',
    keterangan: 'Pelatihan komputasi kimia tingkat dasar'
  },
  {
    id: 'keg-11',
    namaKegiatan: 'Rapat Pleno Departemen Kimia FSTeM UB',
    ruangan: 'Ruang Pertemuan',
    tanggal: '2026-10-09',
    jamMulai: '08.00',
    jamSelesai: '11.00',
    jumlahPeserta: 50,
    penanggungJawab: 'Ketua Departemen Kimia',
    status: 'Disetujui',
    penyelenggara: 'Pimpinan Departemen Kimia',
    keterangan: 'Evaluasi perkuliahan tengah semester ganjil'
  },
  {
    id: 'keg-12',
    namaKegiatan: 'Seminar Proposal Riset Skripsi - Ahmad Rizky Pratama',
    ruangan: 'Ruang Sidang 1',
    tanggal: '2026-10-05',
    jamMulai: '10.45',
    jamSelesai: '12.30',
    jumlahPeserta: 15,
    penanggungJawab: 'Ahmad Rizky Pratama',
    status: 'Disetujui',
    penyelenggara: 'Komisi Tugas Akhir Kimia Organik',
    keterangan: 'Seminar proposal judul riset isolasi dan modifikasi eugenol (NIM: 215090200111012)',
    userId: 'user-mhs',
    userNama: 'Ahmad Rizky Pratama'
  },
  {
    id: 'keg-13',
    namaKegiatan: 'Diskusi Kelompok Studi Komputasi Molekuler Mahasiswa',
    ruangan: 'Ruang Komputer',
    tanggal: '2026-10-06',
    jamMulai: '15.45',
    jamSelesai: '17.30',
    jumlahPeserta: 12,
    penanggungJawab: 'Ahmad Rizky Pratama',
    status: 'Menunggu Persetujuan',
    penyelenggara: 'HIMAKI - Divisi Keilmuan',
    keterangan: 'Simulasi pemodelan Gaussian eugenol dan turunan antibakteri',
    userId: 'user-mhs',
    userNama: 'Ahmad Rizky Pratama'
  },
  {
    id: 'keg-14',
    namaKegiatan: 'Ujian Kolokium Hasil Riset Bahan Alam',
    ruangan: 'Ruang Sidang 2',
    tanggal: '2026-10-08',
    jamMulai: '13.00',
    jamSelesai: '15.00',
    jumlahPeserta: 10,
    penanggungJawab: 'Ahmad Rizky Pratama',
    status: 'Disetujui',
    penyelenggara: 'Laboratorium Kimia Organik & Bahan Alam',
    keterangan: 'Presentasi progres isolasi minyak atsiri cengkeh',
    userId: 'user-mhs',
    userNama: 'Ahmad Rizky Pratama'
  },
  {
    id: 'keg-15',
    namaKegiatan: 'Bimbingan Riset Skripsi & Tesis Analitik - Dr. Akhmad Sabarudin',
    ruangan: 'Ruang Dosen KA',
    tanggal: '2026-10-05',
    jamMulai: '08.00',
    jamSelesai: '10.00',
    jumlahPeserta: 8,
    penanggungJawab: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.',
    status: 'Disetujui',
    penyelenggara: 'Kelompok Bidang Keahlian Kimia Analitik',
    keterangan: 'Konsultasi metodologi spektrofotometri dan validasi HPLC',
    userId: 'user-dosen',
    userNama: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.'
  },
  {
    id: 'keg-16',
    namaKegiatan: 'Rapat Koordinasi Laboratorium Kimia Analitik & Instrumentasi',
    ruangan: 'Ruang Sidang 2',
    tanggal: '2026-10-07',
    jamMulai: '10.00',
    jamSelesai: '12.00',
    jumlahPeserta: 12,
    penanggungJawab: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.',
    status: 'Disetujui',
    penyelenggara: 'Laboratorium Kimia Analitik FMIPA UB',
    keterangan: 'Penyusunan jadwal kalibrasi alat AAS dan GC-MS semester ganjil',
    userId: 'user-dosen',
    userNama: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.'
  },
  {
    id: 'keg-17',
    namaKegiatan: 'Ujian Seminar Hasil Skripsi Mahasiswa Bimbingan',
    ruangan: 'Ruang Sidang 1',
    tanggal: '2026-10-09',
    jamMulai: '13.30',
    jamSelesai: '15.30',
    jumlahPeserta: 15,
    penanggungJawab: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.',
    status: 'Menunggu Persetujuan',
    penyelenggara: 'Komisi Tugas Akhir Departemen Kimia',
    keterangan: 'Ujian seminar hasil riset sensor elektrokimia mahasiswa S1 Kimia',
    userId: 'user-dosen',
    userNama: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.'
  }
];

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

// Helper untuk mengecek apakah suatu kegiatan agenda merupakan milik user yang sedang login
export const isActivityOwnedByUser = (
  keg: KegiatanAgenda,
  user: AuthUser | null,
  role: UserRole
): boolean => {
  // Super Admin dan Admin dapat melihat seluruh aktivitas
  if (role === 'super_admin' || role === 'admin') {
    return true;
  }

  // Identitas user yang login (dengan fallback sesuai role Dosen atau Mahasiswa)
  const curName = (
    user?.nama ||
    (role === 'mahasiswa'
      ? 'Ahmad Rizky Pratama'
      : role === 'dosen'
      ? 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.'
      : '')
  ).trim().toLowerCase();

  const curNim = (
    user?.identifier ||
    (role === 'mahasiswa'
      ? '215090200111012'
      : role === 'dosen'
      ? '197405102000031002'
      : '')
  ).replace(/\D/g, '');

  const curUsername = (
    user?.username ||
    (role === 'mahasiswa' ? 'mahasiswa' : role === 'dosen' ? 'dosen' : '')
  ).trim().toLowerCase();

  const curId = user?.id || (role === 'mahasiswa' ? 'user-mhs' : role === 'dosen' ? 'user-dosen' : '');

  // 1. Cek kecocokan ID akun / Username
  if (keg.userId && curId && keg.userId === curId) return true;
  if (keg.userId && curUsername && keg.userId.toLowerCase() === curUsername) return true;
  if (role === 'dosen' && keg.userId === 'user-dosen' && (curId === 'user-dosen' || curName.includes('sabarudin'))) return true;
  if (role === 'mahasiswa' && keg.userId === 'user-mhs' && (curId === 'user-mhs' || curName.includes('ahmad') || curName.includes('rizky'))) return true;

  // 2. Cek userNama
  if (keg.userNama && curName) {
    const un = keg.userNama.trim().toLowerCase();
    if (un === curName || un.includes(curName) || curName.includes(un)) return true;
  }

  // 3. Cek Penanggung Jawab
  const pj = (keg.penanggungJawab || '').trim().toLowerCase();
  if (pj && curName) {
    if (pj === curName || pj.includes(curName) || curName.includes(pj)) {
      return true;
    }
  }

  // 4. Cek Penyelenggara
  const py = (keg.penyelenggara || '').trim().toLowerCase();
  if (py && curName) {
    if (py === curName || py.includes(curName) || curName.includes(py)) {
      return true;
    }
  }

  // 5. Cek token nama unik (menghilangkan kata umum akademis dan gelar)
  const cleanTokens = curName
    .replace(/\b(prof|dr|dra|drs|ir|s\.si|m\.si|m\.sc|dr\.sc|ph\.d|s\.t|m\.t|gelar|apt|mahasiswa|dosen|kimia|universitas|brawijaya|staf|admin|jurusan|departemen)\b/gi, '')
    .split(/[\s,.-]+/)
    .map((s) => s.trim())
    .filter((token) => token.length >= 4);

  for (const token of cleanTokens) {
    if (pj && pj.includes(token)) return true;
    if (py && py.includes(token)) return true;
    if (keg.namaKegiatan && keg.namaKegiatan.toLowerCase().includes(token)) return true;
    if (keg.keterangan && keg.keterangan.toLowerCase().includes(token)) return true;
  }

  // 6. Cek NIM / NIP di teks kegiatan (Penanggung Jawab, Judul Kegiatan, atau Keterangan)
  if (curNim && curNim.length >= 6) {
    const fullText = `${keg.namaKegiatan} ${keg.penanggungJawab || ''} ${keg.keterangan || ''}`.replace(/\D/g, '');
    if (fullText.includes(curNim)) {
      return true;
    }
  }

  // 7. Cek Nama di Nama Kegiatan (misal: "Ujian Sidang Skripsi - Suparman")
  if (curName && curName.length >= 4) {
    const namaKegLower = keg.namaKegiatan.toLowerCase();
    if (namaKegLower.includes(curName)) {
      return true;
    }
  }

  return false;
};

export const AgendaView: React.FC<AgendaViewProps> = ({ currentRole, currentUser }) => {
  // Ambil data user aktif (dari prop currentUser atau fallback localStorage)
  const effectiveUser = useMemo(() => {
    if (currentUser) return currentUser;
    try {
      const saved = localStorage.getItem('sikma_auth_user');
      if (saved) return JSON.parse(saved) as AuthUser;
    } catch {}
    return null;
  }, [currentUser]);

  // Hak akses penuh: Hanya Super Admin dan Admin yang dapat mengelola status dan menghapus kegiatan
  const isAuthorizedAdmin = currentRole === 'super_admin' || currentRole === 'admin';

  // Calendar month & year state (default: Oktober 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = Oktober

  // Selected date for schedule grid (Format: YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-05');
  const [isDateScheduleModalOpen, setIsDateScheduleModalOpen] = useState<boolean>(false);

  // Filter ruangan saat melihat jadwal
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('Semua');

  // Form Tambah/Edit Kegiatan Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingKegiatan, setEditingKegiatan] = useState<KegiatanAgenda | null>(null);
  const [isAlurPengajuanModalOpen, setIsAlurPengajuanModalOpen] = useState<boolean>(false);
  const [formNamaKegiatan, setFormNamaKegiatan] = useState<string>('');
  const [formRuangan, setFormRuangan] = useState<string>('Ruang Sidang 1');
  const [formTanggal, setFormTanggal] = useState<string>('2026-10-05');
  const [formJamMulai, setFormJamMulai] = useState<string>('08.00');
  const [formJamSelesai, setFormJamSelesai] = useState<string>('10.00');
  const [formJumlahPeserta, setFormJumlahPeserta] = useState<number>(10);
  const [formPenanggungJawab, setFormPenanggungJawab] = useState<string>('');
  const [formStatus, setFormStatus] = useState<StatusKegiatanAgenda>('Menunggu Persetujuan');
  const [formPenyelenggara, setFormPenyelenggara] = useState<string>('');
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter & Pagination State untuk Tabel Daftar Agenda di Bawah Kalender
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [tableRoomFilter, setTableRoomFilter] = useState<string>('Semua');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('Semua');
  const [tableDateFilter, setTableDateFilter] = useState<'Semua' | 'BulanIni' | 'TanggalTerpilih'>('Semua');
  const [tableCurrentPage, setTableCurrentPage] = useState<number>(1);
  const tablePageSize = 10;

  // Reset pagination saat filter tabel berubah
  useEffect(() => {
    setTableCurrentPage(1);
  }, [tableSearchQuery, tableRoomFilter, tableStatusFilter, tableDateFilter]);

  // Selected Detail Kegiatan Modal
  const [selectedDetailKegiatan, setSelectedDetailKegiatan] = useState<KegiatanAgenda | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent kegiatan list
  const [kegiatanList, setKegiatanList] = useState<KegiatanAgenda[]>(() => {
    const saved = localStorage.getItem('sikma_agenda_kegiatan_data');
    if (saved) {
      try {
        const parsed: KegiatanAgenda[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasStudentSample = parsed.some(
            (k) => (k.penanggungJawab || '').toLowerCase().includes('ahmad rizky') || k.id === 'keg-12'
          );
          const hasDosenSample = parsed.some(
            (k) => (k.penanggungJawab || '').toLowerCase().includes('sabarudin') || k.id === 'keg-15'
          );
          let merged = parsed;
          if (!hasStudentSample) {
            const studentItems = INITIAL_KEGIATAN_LIST.filter(
              (k) => k.id === 'keg-12' || k.id === 'keg-13' || k.id === 'keg-14'
            );
            merged = [...merged, ...studentItems];
          }
          if (!hasDosenSample) {
            const dosenItems = INITIAL_KEGIATAN_LIST.filter(
              (k) => k.id === 'keg-15' || k.id === 'keg-16' || k.id === 'keg-17'
            );
            merged = [...merged, ...dosenItems];
          }
          return merged;
        }
        return INITIAL_KEGIATAN_LIST;
      } catch {
        return INITIAL_KEGIATAN_LIST;
      }
    }
    return INITIAL_KEGIATAN_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_agenda_kegiatan_data', JSON.stringify(kegiatanList));
  }, [kegiatanList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // Oktober 2026
    setSelectedDate('2026-10-05');
  };

  // Calendar Day Generation for currentMonth & currentYear
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // Hari dalam seminggu dimulai dari Senin (0 = Senin, 6 = Minggu)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Minggu

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      kegiatan: KegiatanAgenda[];
    }[] = [];

    // Hari bulan sebelumnya
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      const dStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const dateStr = `${y}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === '2026-10-05',
        isSelected: dateStr === selectedDate,
        kegiatan: kegiatanList.filter((k) => k.tanggal === dateStr)
      });
    }

    // Hari bulan saat ini
    for (let i = 1; i <= totalDays; i++) {
      const mStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
      const dStr = i < 10 ? `0${i}` : `${i}`;
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === '2026-10-05',
        isSelected: dateStr === selectedDate,
        kegiatan: kegiatanList.filter((k) => k.tanggal === dateStr)
      });
    }

    // Hari bulan berikutnya agar genap kelipatan 7
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      const dStr = i < 10 ? `0${i}` : `${i}`;
      const dateStr = `${y}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === '2026-10-05',
        isSelected: dateStr === selectedDate,
        kegiatan: kegiatanList.filter((k) => k.tanggal === dateStr)
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDate, kegiatanList]);

  // Handle Klik Tanggal pada kalender
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDateScheduleModalOpen(true);
  };

  // Helper hak akses edit:
  // Super Admin dan Admin dapat mengedit semua kegiatan.
  // Mahasiswa dan Dosen HANYA dapat mengedit kegiatan milik mereka sendiri.
  // Hari, waktu, dan ruangan yang sudah dipesan oleh user lain TIDAK BISA diedit oleh mahasiswa yang sedang login.
  const canEditKegiatan = (keg: KegiatanAgenda | null): boolean => {
    if (!keg) return false;
    if (isAuthorizedAdmin) return true;
    return isActivityOwnedByUser(keg, effectiveUser, currentRole);
  };

  // Deteksi konflik jadwal secara real-time pada form Tambah/Edit Kegiatan
  const activeConflict = useMemo(() => {
    if (!formTanggal || !formRuangan || !formJamMulai || !formJamSelesai) return null;
    const startMin = timeToMinutes(formJamMulai);
    const endMin = timeToMinutes(formJamSelesai);
    if (endMin <= startMin) return null;

    const normalizedRoom = formRuangan === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : formRuangan;
    return kegiatanList.find((k) => {
      if (editingKegiatan && k.id === editingKegiatan.id) return false;
      if (k.status === 'Ditolak') return false;
      const kRoomNorm = k.ruangan === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : k.ruangan;
      if (k.tanggal === formTanggal && kRoomNorm === normalizedRoom) {
        const kStart = timeToMinutes(k.jamMulai);
        const kEnd = timeToMinutes(k.jamSelesai);
        return startMin < kEnd && endMin > kStart;
      }
      return false;
    });
  }, [kegiatanList, editingKegiatan, formTanggal, formRuangan, formJamMulai, formJamSelesai]);

  // Buka Modal Tambah Kegiatan
  const handleOpenAddModal = (presetDate?: string, presetRoom?: string, presetStartTime?: string) => {
    setEditingKegiatan(null);
    setFormNamaKegiatan('');
    const targetRoom = presetRoom || 'Ruang Sidang 1';
    const targetDate = presetDate || selectedDate;
    setFormRuangan(targetRoom);
    setFormTanggal(targetDate);
    setFormJamMulai(presetStartTime || '08.00');

    // Hitung jam selesai default (+2 jam atau sebelum jadwal berikutnya)
    if (presetStartTime) {
      const startMin = timeToMinutes(presetStartTime);
      const targetRoomNorm = targetRoom === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : targetRoom;
      const upcoming = kegiatanList
        .filter((k) => {
          if (k.status === 'Ditolak') return false;
          const kRoomNorm = k.ruangan === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : k.ruangan;
          return k.tanggal === targetDate && kRoomNorm === targetRoomNorm && timeToMinutes(k.jamMulai) > startMin;
        })
        .sort((a, b) => timeToMinutes(a.jamMulai) - timeToMinutes(b.jamMulai))[0];

      const maxLimitMin = upcoming ? timeToMinutes(upcoming.jamMulai) : 21 * 60;
      const endMin = Math.min(maxLimitMin, Math.max(startMin + 15, startMin + 120));
      const endH = Math.floor(endMin / 60);
      const endM = endMin % 60;
      const endHStr = endH < 10 ? `0${endH}` : `${endH}`;
      const endMStr = endM < 10 ? `0${endM}` : `${endM}`;
      setFormJamSelesai(`${endHStr}.${endMStr}`);
    } else {
      setFormJamSelesai('10.00');
    }

    setFormJumlahPeserta(10);
    setFormPenanggungJawab(
      effectiveUser?.nama ||
        (currentRole === 'mahasiswa'
          ? 'Ahmad Rizky Pratama'
          : currentRole === 'dosen'
          ? 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.'
          : '')
    );
    setFormStatus('Menunggu Persetujuan');
    setFormPenyelenggara('');
    setFormKeterangan('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Buka Modal Edit Kegiatan
  const handleOpenEditModal = (kegiatan: KegiatanAgenda) => {
    if (!canEditKegiatan(kegiatan)) {
      const studentName = effectiveUser?.nama || 'Ahmad Rizky Pratama';
      showToast(
        currentRole === 'mahasiswa'
          ? `Akses ditolak: Anda hanya dapat mengedit aktivitas Anda sendiri (${studentName}). Jadwal ini dipesan oleh pengguna lain.`
          : 'Akses ditolak: Jadwal hari, waktu, dan ruangan ini dipesan oleh pengguna lain dan tidak dapat diedit.'
      );
      return;
    }
    setEditingKegiatan(kegiatan);
    setFormNamaKegiatan(kegiatan.namaKegiatan);
    setFormRuangan(kegiatan.ruangan);
    setFormTanggal(kegiatan.tanggal);
    setFormJamMulai(kegiatan.jamMulai);
    setFormJamSelesai(kegiatan.jamSelesai);
    setFormJumlahPeserta(kegiatan.jumlahPeserta);
    setFormPenanggungJawab(kegiatan.penanggungJawab || kegiatan.penyelenggara || '');
    setFormStatus(kegiatan.status || 'Disetujui');
    setFormPenyelenggara(kegiatan.penyelenggara || '');
    setFormKeterangan(kegiatan.keterangan || '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Simpan Kegiatan Baru / Perbarui Kegiatan
  const handleSubmitAddKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi izin edit: Mahasiswa hanya dapat mengedit kegiatan miliknya sendiri (misal: Ahmad Rizky Pratama)
    if (editingKegiatan && !canEditKegiatan(editingKegiatan)) {
      const studentName = effectiveUser?.nama || 'Ahmad Rizky Pratama';
      setFormError(
        currentRole === 'mahasiswa'
          ? `Akses ditolak: Anda hanya dapat mengedit aktivitas milik Anda sendiri (${studentName}).`
          : 'Akses ditolak: Anda tidak memiliki izin untuk mengedit kegiatan yang dipesan oleh pengguna lain.'
      );
      return;
    }

    if (!formNamaKegiatan.trim()) {
      setFormError('Nama kegiatan wajib diisi');
      return;
    }

    if (!formPenanggungJawab.trim()) {
      setFormError('Penanggung Jawab kegiatan wajib diisi');
      return;
    }

    const startMin = timeToMinutes(formJamMulai);
    const endMin = timeToMinutes(formJamSelesai);

    if (endMin <= startMin) {
      setFormError('Jam Selesai harus lebih besar daripada Jam Mulai');
      return;
    }

    if (formJumlahPeserta <= 0) {
      setFormError('Jumlah peserta minimal 1 orang');
      return;
    }

    // Normalisasi Ruang KPS PascaSarjana
    const normalizedRoom = formRuangan === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : formRuangan;

    // Cek Overlap pada ruangan dan tanggal yang sama
    if (activeConflict) {
      const ownerLabel = activeConflict.penanggungJawab || activeConflict.penyelenggara || 'pengguna lain';
      setFormError(
        `Jadwal bentrok: Ruangan "${activeConflict.ruangan}" pada hari ${formatTanggalPelaksanaan(formTanggal)} pukul ${activeConflict.jamMulai} - ${activeConflict.jamSelesai} WIB sudah dipesan oleh ${ownerLabel} ("${activeConflict.namaKegiatan}"). Jadwal tidak dapat ditimpa atau diedit.`
      );
      return;
    }

    const finalStatus: StatusKegiatanAgenda = isAuthorizedAdmin
      ? formStatus
      : editingKegiatan
      ? editingKegiatan.status
      : 'Menunggu Persetujuan';

    if (editingKegiatan) {
      setKegiatanList((prev) =>
        prev.map((k) =>
          k.id === editingKegiatan.id
            ? {
                ...k,
                namaKegiatan: formNamaKegiatan.trim(),
                ruangan: normalizedRoom as RuanganAgenda,
                tanggal: formTanggal,
                jamMulai: formJamMulai,
                jamSelesai: formJamSelesai,
                jumlahPeserta: Number(formJumlahPeserta),
                penanggungJawab: formPenanggungJawab.trim(),
                status: finalStatus,
                penyelenggara: formPenanggungJawab.trim(),
                keterangan: formKeterangan.trim(),
                userId:
                  k.userId ||
                  effectiveUser?.id ||
                  (currentRole === 'mahasiswa' ? 'user-mhs' : currentRole === 'dosen' ? 'user-dosen' : undefined),
                userNama: k.userNama || effectiveUser?.nama || formPenanggungJawab.trim()
              }
            : k
        )
      );
      setIsAddModalOpen(false);
      setEditingKegiatan(null);
      showToast(`Kegiatan "${formNamaKegiatan.trim()}" berhasil diperbarui.`);
    } else {
      const newKegiatan: KegiatanAgenda = {
        id: `keg-${Date.now()}`,
        namaKegiatan: formNamaKegiatan.trim(),
        ruangan: normalizedRoom as RuanganAgenda,
        tanggal: formTanggal,
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
        jumlahPeserta: Number(formJumlahPeserta),
        penanggungJawab: formPenanggungJawab.trim(),
        status: finalStatus,
        penyelenggara: formPenanggungJawab.trim(),
        keterangan: formKeterangan.trim(),
        createdAt: new Date().toISOString(),
        userId:
          effectiveUser?.id ||
          (currentRole === 'mahasiswa' ? 'user-mhs' : currentRole === 'dosen' ? 'user-dosen' : undefined),
        userNama: effectiveUser?.nama || formPenanggungJawab.trim()
      };

      setKegiatanList((prev) => [newKegiatan, ...prev]);
      setIsAddModalOpen(false);
      showToast(`Kegiatan "${newKegiatan.namaKegiatan}" berhasil ditambahkan ke ${newKegiatan.ruangan}.`);
    }
  };

  // Hapus Kegiatan (Hanya Super Admin dan Admin)
  const handleDeleteKegiatan = (id: string, nama: string) => {
    if (!isAuthorizedAdmin) {
      showToast('Akses ditolak: Hanya Super Admin dan Admin yang dapat menghapus kegiatan.');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus kegiatan "${nama}"?`)) {
      setKegiatanList((prev) => prev.filter((k) => k.id !== id));
      if (selectedDetailKegiatan?.id === id) {
        setSelectedDetailKegiatan(null);
      }
      showToast(`Kegiatan "${nama}" berhasil dihapus.`);
    }
  };

  // Data Kegiatan pada selectedDate
  const activitiesOnSelectedDate = useMemo(() => {
    return kegiatanList.filter((k) => k.tanggal === selectedDate);
  }, [kegiatanList, selectedDate]);

  // Format Tanggal Terpilih (e.g. "Senin, 05 Oktober 2026")
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    const dayName = NAMA_HARI[dateObj.getDay()];
    const monthName = NAMA_BULAN[m];
    const dStr = d < 10 ? `0${d}` : `${d}`;
    return `${dayName}, ${dStr} ${monthName} ${y}`;
  }, [selectedDate]);

  // Ruangan yang akan ditampilkan pada tabel matriks (berdasarkan filter)
  const displayedRooms = useMemo(() => {
    if (selectedRoomFilter === 'Semua') {
      return DAFTAR_RUANGAN_AGENDA;
    }
    return DAFTAR_RUANGAN_AGENDA.filter((r) => r === selectedRoomFilter);
  }, [selectedRoomFilter]);

  // Helper Format Tanggal Pelaksanaan (contoh: "Senin, 05 Okt 2026")
  const formatTanggalPelaksanaan = (tanggalStr: string): string => {
    if (!tanggalStr) return '-';
    const parts = tanggalStr.split('-');
    if (parts.length !== 3) return tanggalStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    const dayName = NAMA_HARI[dateObj.getDay()] || '';
    const monthName = NAMA_BULAN[m] || '';
    const dStr = d < 10 ? `0${d}` : `${d}`;
    return `${dayName}, ${dStr} ${monthName.slice(0, 3)} ${y}`;
  };

  // Filter & Search untuk Fields / Tabel di bawah kalender
  const filteredTableKegiatan = useMemo(() => {
    return kegiatanList.filter((keg) => {
      // Filter hak akses: Peran Mahasiswa hanya dapat melihat aktivitas dari mahasiswa itu sendiri
      // Peran Super Admin dan Admin dapat melihat seluruh aktivitas
      if (!isAuthorizedAdmin && !isActivityOwnedByUser(keg, effectiveUser, currentRole)) {
        return false;
      }

      // 1. Search Query
      if (tableSearchQuery.trim()) {
        const q = tableSearchQuery.toLowerCase();
        const matchNama = keg.namaKegiatan.toLowerCase().includes(q);
        const matchPJ = (keg.penanggungJawab || keg.penyelenggara || '').toLowerCase().includes(q);
        const matchRoom = keg.ruangan.toLowerCase().includes(q);
        const matchTgl = keg.tanggal.toLowerCase().includes(q);
        if (!matchNama && !matchPJ && !matchRoom && !matchTgl) return false;
      }

      // 2. Filter Ruangan
      if (tableRoomFilter !== 'Semua') {
        const normTableRoom = tableRoomFilter === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : tableRoomFilter;
        const normKegRoom = keg.ruangan === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : keg.ruangan;
        if (normKegRoom !== normTableRoom) return false;
      }

      // 3. Filter Status
      if (tableStatusFilter !== 'Semua') {
        if ((keg.status || 'Disetujui') !== tableStatusFilter) return false;
      }

      // 4. Filter Tanggal / Periode
      if (tableDateFilter === 'TanggalTerpilih') {
        if (keg.tanggal !== selectedDate) return false;
      } else if (tableDateFilter === 'BulanIni') {
        const parts = keg.tanggal.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (y !== currentYear || m !== currentMonth) return false;
      }

      return true;
    });
  }, [
    kegiatanList,
    isAuthorizedAdmin,
    effectiveUser,
    currentRole,
    tableSearchQuery,
    tableRoomFilter,
    tableStatusFilter,
    tableDateFilter,
    selectedDate,
    currentYear,
    currentMonth
  ]);

  const totalTablePages = Math.max(1, Math.ceil(filteredTableKegiatan.length / tablePageSize));

  const paginatedTableKegiatan = useMemo(() => {
    const start = (tableCurrentPage - 1) * tablePageSize;
    return filteredTableKegiatan.slice(start, start + tablePageSize);
  }, [filteredTableKegiatan, tableCurrentPage, tablePageSize]);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-80 max-w-md bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER UTAMA AGENDA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] tracking-tight">
                  Agenda Ruangan
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Departemen Kimia FSTeM Universitas Brawijaya • Penjadwalan & Peminjaman Ruang
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar Header: Sejajar, Presisi & Elegan */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Button Alur Pengajuan Kegiatan */}
            <button
              type="button"
              onClick={() => setIsAlurPengajuanModalOpen(true)}
              className="h-10 inline-flex items-center gap-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all cursor-pointer border border-amber-500/50 whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-amber-950 shrink-0" />
              <span>Alur Pengajuan Kegiatan</span>
            </button>

            {/* 2. Button Tambah Kegiatan */}
            <button
              type="button"
              onClick={() => handleOpenAddModal(selectedDate)}
              className="h-10 inline-flex items-center gap-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah Kegiatan</span>
            </button>

            {/* 3. Tulisan Total Kegiatan */}
            <div className="h-10 inline-flex items-center gap-2 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium shadow-2xs whitespace-nowrap">
              <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-lg border border-blue-200">
                {kegiatanList.length}
              </span>
              <span className="font-semibold text-slate-700">Total Kegiatan</span>
            </div>
          </div>
        </div>

        {/* KONTROL NAVIGASI BULAN KALENDER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>
                {NAMA_BULAN[currentMonth]} {currentYear}
              </span>
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              (Klik tanggal untuk melihat matriks waktu & ruangan)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Bulan Sekarang
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DISPLAY KALENDER 1 BULAN
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Hari dalam Seminggu */}
        <div className="grid grid-cols-7 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200 text-center py-3">
          <div className="text-slate-600">Senin</div>
          <div className="text-slate-600">Selasa</div>
          <div className="text-slate-600">Rabu</div>
          <div className="text-slate-600">Kamis</div>
          <div className="text-slate-600">Jumat</div>
          <div className="text-amber-700">Sabtu</div>
          <div className="text-rose-600">Minggu</div>
        </div>

        {/* Grid Tanggal Kalender 1 Bulan */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-slate-200/50">
          {calendarDays.map((dayItem, idx) => {
            const hasActivities = dayItem.kegiatan.length > 0;
            return (
              <div
                key={idx}
                onClick={() => handleDateClick(dayItem.dateStr)}
                className={`min-h-[115px] sm:min-h-[130px] p-2 sm:p-2.5 bg-white transition-all duration-150 cursor-pointer flex flex-col justify-between group hover:bg-blue-50/40 ${
                  !dayItem.isCurrentMonth ? 'bg-slate-50/70 text-slate-400' : 'text-slate-800'
                } ${dayItem.isSelected ? 'ring-2 ring-blue-600 ring-inset bg-blue-50/30' : ''}`}
                title={`Klik untuk melihat jadwal ruangan ${dayItem.dateStr}`}
              >
                {/* Tanggal & Badge Hari Ini */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      dayItem.isToday
                        ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                        : dayItem.isSelected
                        ? 'bg-blue-100 text-blue-900 font-bold'
                        : 'text-slate-700 group-hover:text-blue-600'
                    }`}
                  >
                    {dayItem.dayNumber}
                  </span>

                  {hasActivities && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                      {dayItem.kegiatan.length} Kegiatan
                    </span>
                  )}
                </div>

                {/* List Singkat Kegiatan pada Kotak Tanggal */}
                <div className="space-y-1 overflow-hidden flex-1">
                  {dayItem.kegiatan.slice(0, 2).map((keg) => {
                    const roomColor = RUANGAN_COLOR_MAP[keg.ruangan] || RUANGAN_COLOR_MAP['Ruang Sidang 1'];
                    const isOwner = isAuthorizedAdmin || isActivityOwnedByUser(keg, effectiveUser, currentRole);
                    return (
                      <div
                        key={keg.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailKegiatan(keg);
                        }}
                        className={`text-[10px] font-semibold p-1 rounded border leading-tight truncate flex items-center justify-between cursor-pointer hover:brightness-95 transition-all ${roomColor.badge}`}
                        title={`${keg.jamMulai} - ${keg.jamSelesai}: ${keg.namaKegiatan} (${keg.ruangan})${
                          !isOwner && currentRole === 'mahasiswa' ? ' • Dipesan pengguna lain (Hanya Lihat)' : ''
                        }`}
                      >
                        <div className="truncate flex items-center gap-1">
                          <span className="font-mono text-[9px]">{keg.jamMulai}</span>
                          <span className="truncate">{keg.namaKegiatan}</span>
                        </div>
                        {isOwner && currentRole === 'mahasiswa' && (
                          <UserCheck className="w-2.5 h-2.5 text-emerald-700 shrink-0 ml-1" title="Aktivitas Anda (Dapat Diedit)" />
                        )}
                        {!isOwner && currentRole === 'mahasiswa' && (
                          <Lock className="w-2.5 h-2.5 text-amber-700 shrink-0 ml-1" title="Dipesan oleh pengguna lain (Terkunci)" />
                        )}
                      </div>
                    );
                  })}
                  {dayItem.kegiatan.length > 2 && (
                    <div className="text-[9px] text-blue-600 font-bold px-1">
                      +{dayItem.kegiatan.length - 2} kegiatan lainnya...
                    </div>
                  )}
                </div>

                {/* Petunjuk Aksi Klik */}
                <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">Buka Jadwal</span>
                  <ChevronRight className="w-3 h-3 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info Kalender */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Klik salah satu tanggal pada kalender di atas untuk membuka matriks waktu (06.00 s/d 21.00) dan 8 ruangan.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Tanggal Terpilih:</span>
            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
              {formattedSelectedDate}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FIELDS / TABEL DAFTAR AGENDA KEGIATAN DI BAWAH KALENDER
          Fields:
          - Penanggung Jawab
          - Nama Kegiatan
          - Tanggal Pelaksanaan
          - Waktu (rentang Jam Mulai dan Jam Selesai)
          - Ruangan
          - Total Peserta
          - Status
          - Action (terdiri dari button Edit)
          Sinkronisasi data fields berasal dari input button Tambah Kegiatan & Edit
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Tabel Fields */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base sm:text-lg text-[#002B49]">
                      Daftar Agenda Kegiatan & Peminjaman Ruangan
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {filteredTableKegiatan.length} Kegiatan
                    </span>
                    {!isAuthorizedAdmin && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {currentRole === 'dosen' ? 'Aktivitas Dosen' : 'Aktivitas Mahasiswa'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAuthorizedAdmin
                      ? 'Menampilkan seluruh agenda kegiatan dan peminjaman ruangan civitas akademika.'
                      : currentRole === 'dosen'
                      ? `Menampilkan hanya agenda kegiatan & peminjaman ruangan atas nama Anda (${effectiveUser?.nama || 'Dosen'}).`
                      : `Menampilkan hanya agenda kegiatan & permohonan ruangan atas nama Anda (${effectiveUser?.nama || 'Mahasiswa'}).`}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Tambah Kegiatan */}
            <button
              type="button"
              onClick={() => handleOpenAddModal(selectedDate)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>

          {/* Bar Filter & Pencarian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* 1. Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kegiatan, PJ, atau ruangan..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
              {tableSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTableSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Filter Ruangan */}
            <div>
              <select
                value={tableRoomFilter}
                onChange={(e) => setTableRoomFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Semua">Semua Ruangan (8 Ruang)</option>
                {DAFTAR_RUANGAN_AGENDA.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filter Status */}
            <div>
              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>

            {/* 4. Filter Tanggal / Periode */}
            <div>
              <select
                value={tableDateFilter}
                onChange={(e) => setTableDateFilter(e.target.value as 'Semua' | 'BulanIni' | 'TanggalTerpilih')}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Semua">Semua Tanggal</option>
                <option value="BulanIni">Bulan Ini ({NAMA_BULAN[currentMonth]} {currentYear})</option>
                <option value="TanggalTerpilih">Tanggal Terpilih ({selectedDate})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Fields */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-[180px]">Penanggung Jawab</th>
                <th className="py-3 px-4 min-w-[220px]">Nama Kegiatan</th>
                <th className="py-3 px-4 w-[160px]">Tanggal Pelaksanaan</th>
                <th className="py-3 px-4 w-[160px]">Waktu</th>
                <th className="py-3 px-4 w-[170px]">Ruangan</th>
                <th className="py-3 px-4 text-center w-[120px]">Total Peserta</th>
                <th className="py-3 px-4 text-center w-[160px]">Status</th>
                <th className="py-3 px-4 text-center w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedTableKegiatan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      {!isAuthorizedAdmin
                        ? 'Belum ada agenda kegiatan atau peminjaman ruangan atas nama Anda'
                        : 'Tidak ada kegiatan yang ditemukan'}
                    </p>
                    <p className="text-[11px] mt-0.5 text-slate-400">
                      {!isAuthorizedAdmin
                        ? 'Gunakan tombol "+ Tambah Kegiatan" di atas untuk mengajukan agenda atau peminjaman ruangan baru.'
                        : 'Sesuaikan filter pencarian atau klik tombol Tambah Kegiatan untuk memasukkan agenda baru.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTableKegiatan.map((keg) => {
                  const roomColor = RUANGAN_COLOR_MAP[keg.ruangan] || RUANGAN_COLOR_MAP['Ruang Sidang 1'];
                  const statusStyle =
                    STATUS_KEGIATAN_COLOR_MAP[keg.status || 'Disetujui'] ||
                    STATUS_KEGIATAN_COLOR_MAP['Disetujui'];

                  return (
                    <tr
                      key={keg.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* 1. Penanggung Jawab */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span
                            className="truncate max-w-[150px] font-bold text-slate-800"
                            title={keg.penanggungJawab || keg.penyelenggara || '-'}
                          >
                            {keg.penanggungJawab || keg.penyelenggara || '-'}
                          </span>
                        </div>
                      </td>

                      {/* 2. Nama Kegiatan */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-snug">
                          {keg.namaKegiatan}
                        </div>
                        {keg.keterangan && (
                          <div
                            className="text-[11px] text-slate-400 mt-0.5 line-clamp-1"
                            title={keg.keterangan}
                          >
                            {keg.keterangan}
                          </div>
                        )}
                      </td>

                      {/* 3. Tanggal Pelaksanaan */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {formatTanggalPelaksanaan(keg.tanggal)}
                          </span>
                        </div>
                      </td>

                      {/* 4. Waktu (rentang Jam Mulai dan Jam Selesai) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-mono font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {keg.jamMulai} - {keg.jamSelesai} WIB
                          </span>
                        </span>
                      </td>

                      {/* 5. Ruangan */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${roomColor.badge}`}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{keg.ruangan}</span>
                        </span>
                      </td>

                      {/* 6. Total Peserta */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{keg.jumlahPeserta} Orang</span>
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span>{keg.status || 'Disetujui'}</span>
                        </span>
                      </td>

                      {/* 8. Field Aksi: Edit, View, dan Hapus (Hanya Super Admin & Admin) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {canEditKegiatan(keg) ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(keg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-2xs hover:shadow transition-all cursor-pointer"
                              title={`Edit kegiatan ${keg.namaKegiatan}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs border border-slate-200 cursor-not-allowed"
                              title="Hari, waktu, dan ruangan ini dipesan oleh pengguna lain dan tidak dapat diedit"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Terkunci</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailKegiatan(keg)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                            title="View / Rincian Kegiatan"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>
                          {isAuthorizedAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteKegiatan(keg.id, keg.namaKegiatan)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Hapus Kegiatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Paginasi Tabel Fields */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800">
              {filteredTableKegiatan.length > 0 ? (tableCurrentPage - 1) * tablePageSize + 1 : 0}
            </span>{' '}
            s/d{' '}
            <span className="font-bold text-slate-800">
              {Math.min(tableCurrentPage * tablePageSize, filteredTableKegiatan.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-800">{filteredTableKegiatan.length}</span> total kegiatan
          </div>

          {totalTablePages > 1 && (
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setTableCurrentPage((p) => Math.max(1, p - 1))}
                disabled={tableCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setTableCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tableCurrentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTableCurrentPage((p) => Math.min(totalTablePages, p + 1))}
                disabled={tableCurrentPage === totalTablePages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: FORM TAMBAH / EDIT KEGIATAN
          List fields:
          - Nama Kegiatan
          - Ruangan (Ruang Proyek, Ruang Sidang 1, Ruang Sidang 2, Ruang Komputer,
            Ruang Pertemuan, Ruang KPS PascaSarjana, Ruang Dosen KA, Ruang Dosen Biokimia)
          - Tanggal Pelaksanaan
          - Jam Mulai
          - Jam Selesai
          - Jumlah Peserta (Total Peserta)
          - Penanggung Jawab
          - Status
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8 flex flex-col">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingKegiatan ? 'Edit Kegiatan Agenda' : 'Tambah Kegiatan Agenda'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {editingKegiatan
                      ? 'Perbarui Data Peminjaman & Penjadwalan Ruangan'
                      : 'Form Peminjaman & Penjadwalan Ruangan Departemen Kimia'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingKegiatan(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmitAddKegiatan} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Nama Kegiatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ujian Sidang Skripsi - Dewi Ayu Anggraeni"
                  value={formNamaKegiatan}
                  onChange={(e) => setFormNamaKegiatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* 2. Ruangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ruangan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formRuangan}
                  onChange={(e) => setFormRuangan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  required
                >
                  {OPSI_RUANGAN_FORM.map((room, idx) => (
                    <option key={idx} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Tanggal Pelaksanaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  required
                />
              </div>

              {/* 4. Jam Mulai & 5. Jam Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jam Mulai <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formJamMulai}
                    onChange={(e) => setFormJamMulai(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer font-mono"
                    required
                  >
                    {TIME_SLOTS_LIST.slice(0, -1).map((time, idx) => (
                      <option key={idx} value={time}>
                        {time} WIB
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jam Selesai <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formJamSelesai}
                    onChange={(e) => setFormJamSelesai(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer font-mono"
                    required
                  >
                    {TIME_SLOTS_LIST.slice(1).map((time, idx) => (
                      <option key={idx} value={time}>
                        {time} WIB
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6. Jumlah Peserta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jumlah Peserta <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 25"
                    value={formJumlahPeserta}
                    onChange={(e) => setFormJumlahPeserta(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    Orang
                  </span>
                </div>
              </div>

              {/* 7. Penanggung Jawab */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Penanggung Jawab <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dr. Ir. Masruri / Prof. Hermin / Komisi Skripsi / Ketua Panitia"
                  value={formPenanggungJawab}
                  onChange={(e) => setFormPenanggungJawab(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* 8. Status (Hanya bisa diakses Super Admin dan Admin, disembunyikan untuk peran Mahasiswa) */}
              {(currentRole === 'super_admin' || currentRole === 'admin') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusKegiatanAgenda)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                    required
                  >
                    <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              )}

              {/* Keterangan Tambahan (Opsional) */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Keterangan Tambahan (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan fasilitas khusus, proyektor, dll..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Peringatan Real-Time Jika Ruangan & Waktu Sudah Dipesan Pengguna Lain */}
              {activeConflict && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">Ruangan & Waktu Sudah Dipesan Pengguna Lain</p>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      Ruangan <span className="font-bold">{activeConflict.ruangan}</span> sudah dipesan pada hari{' '}
                      <span className="font-bold">{formatTanggalPelaksanaan(activeConflict.tanggal)}</span> pukul{' '}
                      <span className="font-bold font-mono">{activeConflict.jamMulai} - {activeConflict.jamSelesai} WIB</span> oleh{' '}
                      <span className="font-bold">{activeConflict.penanggungJawab || activeConflict.penyelenggara}</span> (
                      {activeConflict.namaKegiatan}).
                    </p>
                    <p className="mt-1 text-[11px] text-amber-700 font-medium">
                      Mahasiswa tidak dapat memesan atau mengedit jadwal yang sudah dipesan oleh pengguna lain. Silakan pilih hari, waktu, atau ruangan yang berbeda.
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingKegiatan(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!!activeConflict}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all ${
                    activeConflict
                      ? 'bg-slate-400 cursor-not-allowed opacity-75'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg cursor-pointer'
                  }`}
                  title={activeConflict ? 'Hari, waktu, dan ruangan sudah dipesan oleh pengguna lain' : undefined}
                >
                  {editingKegiatan ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Simpan Kegiatan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DETAIL JADWAL TANGGAL (DIPICU SAAT KLIK TANGGAL PADA KALENDER)
          Menampilkan matriks waktu 06.00 s/d 21.00 dan 8 ruangan dalam modal dialog
          ========================================================================= */}
      {isDateScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Jadwal Agenda Ruangan: {formattedSelectedDate}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Fields: Waktu (06.00 s/d 21.00 per 15 menit) • 8 Ruangan Departemen Kimia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDateScheduleModalOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Jendela"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-bar Filter & Ringkasan */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Total Terjadwal:</span>
                <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activitiesOnSelectedDate.length} Kegiatan
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">
                  Klik sel waktu kosong untuk memesan ruangan langsung.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Filter Ruang:</span>
                <select
                  value={selectedRoomFilter}
                  onChange={(e) => setSelectedRoomFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Semua">Semua 8 Ruangan</option>
                  {DAFTAR_RUANGAN_AGENDA.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAlurPengajuanModalOpen(true)}
                  className="h-8.5 inline-flex items-center gap-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 font-bold text-xs transition-colors cursor-pointer shadow-xs border border-amber-500/50 whitespace-nowrap"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                  <span>Alur Pengajuan Kegiatan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="h-8.5 inline-flex items-center gap-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Matriks Lengkap */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-[550px] overflow-auto relative">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-20 bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200 shadow-xs">
                      <tr>
                        {/* 1. Field Waktu (06.00 s/d 21.00 per 15 menit) */}
                        <th className="py-3 px-3 w-24 text-center sticky left-0 z-30 bg-slate-100 border-r border-slate-200">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Waktu</span>
                          </div>
                        </th>

                        {/* 8 Field Ruangan Sesuai Spesifikasi */}
                        {displayedRooms.map((roomName, idx) => {
                          const color = RUANGAN_COLOR_MAP[roomName] || RUANGAN_COLOR_MAP['Ruang Sidang 1'];
                          return (
                            <th
                              key={idx}
                              className="py-3 px-3 min-w-[170px] max-w-[210px] text-center border-r border-slate-200 last:border-r-0"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <DoorOpen className={`w-3.5 h-3.5 ${color.text}`} />
                                <span className="truncate">{roomName}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TIME_SLOTS_LIST.map((slotTime, slotIdx) => {
                        const slotMinutes = timeToMinutes(slotTime);

                        return (
                          <tr key={slotIdx} className="hover:bg-slate-50/60 transition-colors">
                            {/* Waktu */}
                            <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 text-xs whitespace-nowrap">
                              {slotTime}
                            </td>

                            {/* Ruangan */}
                            {displayedRooms.map((roomName, roomIdx) => {
                              const matchingKegiatan = activitiesOnSelectedDate.find((keg) => {
                                const kRoomNorm = keg.ruangan === 'Ruang KPS PascaSarjana' ? 'Ruang KPS Pasca Sarjana' : keg.ruangan;
                                if (kRoomNorm !== roomName) return false;
                                const kStart = timeToMinutes(keg.jamMulai);
                                const kEnd = timeToMinutes(keg.jamSelesai);
                                return slotMinutes >= kStart && slotMinutes < kEnd;
                              });

                              const isStartSlot =
                                matchingKegiatan && timeToMinutes(matchingKegiatan.jamMulai) === slotMinutes;
                              const roomColor = RUANGAN_COLOR_MAP[roomName] || RUANGAN_COLOR_MAP['Ruang Sidang 1'];

                              if (matchingKegiatan) {
                                const isOwner = isAuthorizedAdmin || isActivityOwnedByUser(matchingKegiatan, effectiveUser, currentRole);

                                if (isStartSlot) {
                                  return (
                                    <td
                                      key={roomIdx}
                                      className={`p-2 border-r border-slate-200 align-top ${roomColor.lightBg}`}
                                    >
                                      <div
                                        onClick={() => setSelectedDetailKegiatan(matchingKegiatan)}
                                        className={`p-2 rounded-xl border shadow-xs transition-all cursor-pointer hover:shadow-md ${roomColor.badge}`}
                                      >
                                        <div className="flex items-start justify-between gap-1">
                                          <h4 className="font-bold text-xs leading-snug line-clamp-2">
                                            {matchingKegiatan.namaKegiatan}
                                          </h4>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {isOwner && currentRole === 'mahasiswa' && (
                                              <span
                                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-bold"
                                                title="Aktivitas Anda (Dapat Diedit)"
                                              >
                                                <UserCheck className="w-2.5 h-2.5 text-emerald-800" />
                                                <span>Aktivitas Anda</span>
                                              </span>
                                            )}
                                            {!isOwner && currentRole === 'mahasiswa' && (
                                              <span
                                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-200/90 text-amber-900 border border-amber-300 text-[9px] font-bold"
                                                title="Dipesan oleh pengguna lain (Terkunci)"
                                              >
                                                <Lock className="w-2.5 h-2.5 text-amber-800" />
                                                <span>Terkunci</span>
                                              </span>
                                            )}
                                            {isAuthorizedAdmin && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteKegiatan(matchingKegiatan.id, matchingKegiatan.namaKegiatan);
                                                }}
                                                className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer shrink-0"
                                                title="Hapus Kegiatan"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                                          <span className="font-mono font-bold bg-white/80 px-1 py-0.5 rounded text-slate-700">
                                            {matchingKegiatan.jamMulai} - {matchingKegiatan.jamSelesai}
                                          </span>
                                          <span className="text-slate-600 flex items-center gap-0.5">
                                            <Users className="w-2.5 h-2.5" />
                                            {matchingKegiatan.jumlahPeserta} Peserta
                                          </span>
                                          {matchingKegiatan.status && (
                                            <span
                                              className={`px-1.5 py-0.5 rounded font-bold border text-[9px] ${
                                                STATUS_KEGIATAN_COLOR_MAP[matchingKegiatan.status]?.badge || 'bg-slate-100 text-slate-700'
                                              }`}
                                            >
                                              {matchingKegiatan.status}
                                            </span>
                                          )}
                                        </div>
                                        {matchingKegiatan.penanggungJawab && (
                                          <div className="mt-1 text-[10px] text-slate-700 font-medium truncate flex items-center gap-1">
                                            <UserCheck className="w-3 h-3 text-slate-500 shrink-0" />
                                            <span className="truncate">PJ: {matchingKegiatan.penanggungJawab}</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  );
                                } else {
                                  return (
                                    <td
                                      key={roomIdx}
                                      onClick={() => setSelectedDetailKegiatan(matchingKegiatan)}
                                      className={`px-2 py-1 border-r border-slate-200 cursor-pointer ${roomColor.lightBg}`}
                                    >
                                      <div className="border-l-2 border-dashed border-blue-400 pl-1.5 text-[10px] text-slate-500 truncate italic flex items-center justify-between">
                                        <span className="truncate">↳ {matchingKegiatan.namaKegiatan} ({matchingKegiatan.jamMulai} - {matchingKegiatan.jamSelesai})</span>
                                        {isOwner && currentRole === 'mahasiswa' && (
                                          <UserCheck className="w-2.5 h-2.5 text-emerald-700 shrink-0 ml-1" title="Aktivitas Anda (Dapat Diedit)" />
                                        )}
                                        {!isOwner && currentRole === 'mahasiswa' && (
                                          <Lock className="w-2.5 h-2.5 text-amber-700 shrink-0 ml-1" title="Dipesan oleh pengguna lain (Terkunci)" />
                                        )}
                                      </div>
                                    </td>
                                  );
                                }
                              }

                              // Slot Kosong
                              return (
                                <td
                                  key={roomIdx}
                                  onClick={() => handleOpenAddModal(selectedDate, roomName, slotTime)}
                                  className="p-1.5 border-r border-slate-200 text-center transition-colors group cursor-pointer hover:bg-blue-50/50"
                                  title={`Pesan ${roomName} pada ${slotTime}`}
                                >
                                  <span className="text-[10px] text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                                    + Pesan
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Sistem Agenda & Penjadwalan Ruang Departemen Kimia UB
              </span>
              <button
                type="button"
                onClick={() => setIsDateScheduleModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DETAIL INFORMASI KEGIATAN
          ========================================================================= */}
      {selectedDetailKegiatan && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Rincian Kegiatan Agenda</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailKegiatan(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              {/* Banner Status Akses Edit untuk Mahasiswa */}
              {canEditKegiatan(selectedDetailKegiatan) && currentRole === 'mahasiswa' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-start gap-2.5 font-medium shadow-2xs">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-emerald-900">Aktivitas Mahasiswa Anda (Dapat Diedit)</span>
                    <span className="text-[11px] text-emerald-800 leading-relaxed block mt-0.5">
                      Kegiatan ini merupakan agenda peminjaman ruangan atas nama Anda (<span className="font-bold">{effectiveUser?.nama || 'Ahmad Rizky Pratama'}</span>). Anda memiliki hak akses penuh untuk mengedit jadwal kegiatan ini.
                    </span>
                  </div>
                </div>
              )}

              {!canEditKegiatan(selectedDetailKegiatan) && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start gap-2.5 font-medium shadow-2xs">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-900">Dipesan oleh Pengguna Lain (Hanya Lihat)</span>
                    <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                      Hari, waktu, dan ruangan dalam jadwal ini sudah dipesan oleh{' '}
                      <span className="font-bold">{selectedDetailKegiatan.penanggungJawab || selectedDetailKegiatan.penyelenggara || 'pengguna lain'}</span>.
                      Sebagai akun mahasiswa yang sedang login ({effectiveUser?.nama || 'Ahmad Rizky Pratama'}), Anda hanya dapat mengedit aktivitas Anda sendiri dan tidak dapat mengedit aktivitas pengguna lain.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[11px]">Nama Kegiatan</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedDetailKegiatan.namaKegiatan}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Ruangan</span>
                  <span className="font-bold text-blue-700 block">
                    {selectedDetailKegiatan.ruangan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jumlah Peserta</span>
                  <span className="font-bold text-slate-800 block">
                    {selectedDetailKegiatan.jumlahPeserta} Orang
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Pelaksanaan</span>
                  <span className="font-medium text-slate-800 block">
                    {selectedDetailKegiatan.tanggal}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Waktu</span>
                  <span className="font-mono font-bold text-emerald-700 block">
                    {selectedDetailKegiatan.jamMulai} - {selectedDetailKegiatan.jamSelesai} WIB
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Penanggung Jawab</span>
                  <span className="font-bold text-slate-800 block">
                    {selectedDetailKegiatan.penanggungJawab || selectedDetailKegiatan.penyelenggara || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-lg border mt-0.5 ${
                      STATUS_KEGIATAN_COLOR_MAP[selectedDetailKegiatan.status || 'Disetujui']?.badge || 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_KEGIATAN_COLOR_MAP[selectedDetailKegiatan.status || 'Disetujui']?.dot || 'bg-slate-400'
                      }`}
                    />
                    <span>{selectedDetailKegiatan.status || 'Disetujui'}</span>
                  </span>
                </div>
              </div>

              {selectedDetailKegiatan.penyelenggara && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Penyelenggara</span>
                  <span className="font-medium text-slate-700">
                    {selectedDetailKegiatan.penyelenggara}
                  </span>
                </div>
              )}

              {selectedDetailKegiatan.keterangan && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Keterangan</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    {selectedDetailKegiatan.keterangan}
                  </p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {isAuthorizedAdmin ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteKegiatan(selectedDetailKegiatan.id, selectedDetailKegiatan.namaKegiatan)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Kegiatan</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  {canEditKegiatan(selectedDetailKegiatan) ? (
                    <button
                      type="button"
                      onClick={() => {
                        const keg = selectedDetailKegiatan;
                        setSelectedDetailKegiatan(null);
                        handleOpenEditModal(keg);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer text-xs shadow-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-semibold cursor-not-allowed border border-slate-200 text-xs"
                      title="Hari, waktu, dan ruangan ini dipesan oleh pengguna lain dan tidak dapat diedit"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tidak Dapat Diedit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedDetailKegiatan(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer text-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PETUNJUK ALUR PENGAJUAN KEGIATAN (WARNA KUNING)
          ========================================================================= */}
      {isAlurPengajuanModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-amber-300 overflow-hidden my-8 flex flex-col">
            {/* Header Modal Alur Pengajuan (Warna Emas / Kuning UB) */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b-4 border-amber-400 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-sm">
                  <HelpCircle className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Petunjuk Alur Pengajuan Kegiatan
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    Agenda Ruangan Departemen Kimia FSTeM UB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAlurPengajuanModalOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Petunjuk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-slate-800">
              {/* Box Catatan Pengajuan */}
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-1">
                      Catatan :
                    </span>
                    <p className="leading-relaxed font-medium">
                      Pengajuan kegiatan maksimal H-2 pelaksanaan. Apabila mendadak dan urgent silahkan menghubungi Admin
                    </p>
                  </div>
                </div>
              </div>

              {/* Box Alur Pengajuan (Langkah 1 s/d 5) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    Alur Pengajuan :
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* 1. Pengguna memilih tanggal pada kalender. */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50/50 hover:border-amber-200 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      1
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      Pengguna memilih tanggal pada kalender.
                    </span>
                  </div>

                  {/* 2. Pengguna melihat Ruangan dan Waktu yang tersedia pada tanggal tersebut. */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50/50 hover:border-amber-200 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      2
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      Pengguna melihat Ruangan dan Waktu yang tersedia pada tanggal tersebut.
                    </span>
                  </div>

                  {/* 3. Pengguna menginputkan kegiatan pada popup tambah kegiatan. */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50/50 hover:border-amber-200 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      3
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      Pengguna menginputkan kegiatan pada popup tambah kegiatan.
                    </span>
                  </div>

                  {/* 4. Pengguna melakukan konfirmasi kepada Admin agar pengajuan kegiatan disetujui. */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50/50 hover:border-amber-200 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      4
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      Pengguna melakukan konfirmasi kepada Admin agar pengajuan kegiatan disetujui.
                    </span>
                  </div>

                  {/* 5. Pengguna melaksanakan kegiatan yang sudah diinputkan. */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50/50 hover:border-amber-200 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      5
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      Pengguna melaksanakan kegiatan yang sudah diinputkan.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Tombol */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsAlurPengajuanModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
